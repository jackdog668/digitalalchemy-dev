import { NextResponse, type NextRequest } from "next/server";
import {
  getBookingsNeedingReminder,
  markReminderSent,
  getEventTypeById,
  type ReminderKind,
} from "@/lib/scheduling";
import { sendBookingReminder } from "@/lib/scheduling-emails";
import { sendUpcomingTelegramAlert } from "@/lib/scheduling-telegram";
import {
  verifyCronAuth,
  isResendConfigured,
} from "@/lib/env";
import { isTelegramConfigured } from "@/lib/telegram";

// External cron (cron-job.org / GitHub Actions) → this endpoint every 15 min.
//
// Flow:
//   1. Verify the Authorization header matches CRON_SECRET
//   2. For each kind:
//        24h / 1h   → email the INVITEE (requires Resend)
//        15m_admin  → Telegram the ADMIN (requires Telegram bot)
//      find confirmed bookings inside the window whose `_sent_at` is null
//   3. Send the notification, mark the column on success
//   4. Return compact JSON summary so Vercel logs are grep-able
//
// Notifications only mark the column AFTER the send resolves so a transient
// Resend/Telegram outage retries on the next tick. Failures are logged,
// not thrown — one bad booking must not stop the rest from going out.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ReminderResult {
  kind: ReminderKind;
  attempted: number;
  sent: number;
  failed: number;
  skipped?: string;
}

async function processKind(kind: ReminderKind): Promise<ReminderResult> {
  // Channel-specific guard: skip the whole kind cleanly if its delivery
  // channel isn't configured, instead of attempting and erroring per row.
  if (kind === "15m_admin" && !isTelegramConfigured()) {
    return { kind, attempted: 0, sent: 0, failed: 0, skipped: "no-telegram" };
  }
  if (kind !== "15m_admin" && !isResendConfigured()) {
    return { kind, attempted: 0, sent: 0, failed: 0, skipped: "no-resend" };
  }

  const bookings = await getBookingsNeedingReminder(kind);
  let sent = 0;
  let failed = 0;

  for (const booking of bookings) {
    try {
      const eventType = await getEventTypeById(booking.eventTypeId);
      if (!eventType) {
        console.error(
          `[reminder cron] event type ${booking.eventTypeId} not found for booking ${booking.id}`,
        );
        failed++;
        continue;
      }

      if (kind === "15m_admin") {
        await sendUpcomingTelegramAlert(booking, eventType);
      } else {
        await sendBookingReminder(booking, eventType, kind);
      }
      await markReminderSent(booking.id, kind);
      sent++;
    } catch (err) {
      console.error(
        `[reminder cron] failed for booking ${booking.id} (${kind}):`,
        err,
      );
      failed++;
    }
  }

  return { kind, attempted: bookings.length, sent, failed };
}

export async function GET(req: NextRequest) {
  // Auth: CRON_SECRET via Authorization header (Vercel Cron convention)
  if (!verifyCronAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // No early skip — each kind self-guards on its delivery channel inside
  // processKind so one missing provider doesn't kill the others.
  const startedAt = Date.now();
  const results = await Promise.all([
    processKind("24h"),
    processKind("1h"),
    processKind("15m_admin"),
  ]);
  const durationMs = Date.now() - startedAt;

  const summary = {
    ok: true,
    durationMs,
    results,
    at: new Date().toISOString(),
  };
  console.log("[reminder cron]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
