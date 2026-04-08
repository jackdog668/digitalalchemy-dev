import { NextResponse, type NextRequest } from "next/server";
import {
  getBookingsNeedingReminder,
  markReminderSent,
  getEventTypeById,
  type ReminderKind,
} from "@/lib/scheduling";
import { sendBookingReminder } from "@/lib/scheduling-emails";
import { verifyCronAuth, isResendConfigured } from "@/lib/env";

// Vercel Cron → this endpoint, every 15 minutes.
//
// Flow:
//   1. Verify the Authorization header matches CRON_SECRET (Vercel injects it)
//   2. For each kind (24h, 1h): find confirmed bookings inside the window
//      whose reminder_Xh_sent_at IS NULL
//   3. Send the reminder email, mark the column on success
//   4. Return a compact JSON summary so the Vercel logs are grep-able
//
// We mark the column *only* after the email send resolves so a transient
// Resend outage retries on the next cron tick. Failures are logged, not
// thrown — one bad booking must not stop the rest from going out.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ReminderResult {
  kind: ReminderKind;
  attempted: number;
  sent: number;
  failed: number;
}

async function processKind(kind: ReminderKind): Promise<ReminderResult> {
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
      await sendBookingReminder(booking, eventType, kind);
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

  if (!isResendConfigured()) {
    return NextResponse.json(
      { ok: true, skipped: "resend-not-configured" },
      { status: 200 },
    );
  }

  const startedAt = Date.now();
  const results = await Promise.all([processKind("24h"), processKind("1h")]);
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
