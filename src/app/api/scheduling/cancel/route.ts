import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getBookingByCancelToken,
  getEventTypeById,
  cancelBookingRow,
} from "@/lib/scheduling";
import { sendCancellationEmails } from "@/lib/scheduling-emails";
import { deleteCalendarEventForBooking } from "@/lib/google/events";
import { isSupabaseConfigured, isResendConfigured } from "@/lib/env";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const bodySchema = z
  .object({
    token: z.string().min(10).max(200),
    reason: z.string().max(2000).optional().or(z.literal("")),
  })
  .strict();

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Scheduling not configured" },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const rl = await rateLimit({
    key: "scheduling:cancel",
    identifier: ip,
    max: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const booking = await getBookingByCancelToken(parsed.data.token);
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  const eventType = await getEventTypeById(booking.eventTypeId);
  if (!eventType) {
    return NextResponse.json({ error: "Event type missing" }, { status: 500 });
  }

  let cancelled;
  try {
    cancelled = await cancelBookingRow(
      booking.id,
      parsed.data.reason || null,
    );
  } catch (err) {
    console.error("Cancel failed:", err);
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }

  if (isResendConfigured()) {
    try {
      await sendCancellationEmails(cancelled, eventType, "invitee");
    } catch (err) {
      console.error("Cancellation email failed:", err);
    }
  }

  // Remove the Google Calendar event so the admin's calendar stays clean.
  try {
    await deleteCalendarEventForBooking(cancelled);
  } catch (err) {
    console.error("[google] delete event on cancel failed:", err);
  }

  return NextResponse.json({ ok: true });
}
