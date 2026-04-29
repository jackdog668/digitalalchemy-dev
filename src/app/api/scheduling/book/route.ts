import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getEventTypeBySlug,
  getAvailabilityRules,
  getBookingsForDateRange,
  createBookingRow,
  attachGoogleEventToBooking,
} from "@/lib/scheduling";
import { isSlotStillAvailable } from "@/lib/scheduling-slots";
import {
  sendBookingConfirmation,
  sendAdminBookingNotification,
} from "@/lib/scheduling-emails";
import { createCalendarEventForBooking } from "@/lib/google/events";
import { isSupabaseConfigured, isResendConfigured } from "@/lib/env";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Public endpoint — creates a booking. Revalidates slot availability server-
// side to prevent double-booking races, then inserts the row and fires off
// two emails in parallel (invitee confirmation + admin notification).

const bodySchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/),
    startUtc: z.string().datetime(),
    name: z.string().min(1).max(200),
    email: z.string().email().max(254),
    notes: z.string().max(2000).optional().or(z.literal("")),
    customAnswers: z.record(z.string(), z.string().max(2000)).default({}),
    timezone: z.string().min(1).max(100),
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
    key: "scheduling:book",
    identifier: ip,
    max: 3,
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

  const input = parsed.data;
  const eventType = await getEventTypeBySlug(input.slug);
  if (!eventType || eventType.status !== "active") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Validate all REQUIRED custom questions are answered
  for (const q of eventType.customQuestions) {
    if (q.required && !input.customAnswers[q.label]) {
      return NextResponse.json(
        { error: `Missing required answer: ${q.label}` },
        { status: 400 },
      );
    }
  }

  const startMs = new Date(input.startUtc).getTime();
  const endMs = startMs + eventType.durationMinutes * 60 * 1000;
  const endUtc = new Date(endMs).toISOString();

  // Re-check availability with fresh data (race prevention)
  const rules = await getAvailabilityRules();
  const windowFrom = new Date(startMs - 24 * 60 * 60 * 1000).toISOString();
  const windowTo = new Date(endMs + 24 * 60 * 60 * 1000).toISOString();
  const existingBookings = await getBookingsForDateRange(
    eventType.id,
    windowFrom,
    windowTo,
  );

  const stillAvailable = isSlotStillAvailable({
    eventType,
    rules,
    existingBookings,
    startUtc: input.startUtc,
  });

  if (!stillAvailable) {
    return NextResponse.json(
      { error: "Slot no longer available. Please pick another time." },
      { status: 409 },
    );
  }

  // Insert booking
  let booking;
  try {
    booking = await createBookingRow({
      eventTypeId: eventType.id,
      inviteeName: input.name,
      inviteeEmail: input.email,
      inviteeNotes: input.notes || null,
      customAnswers: input.customAnswers,
      startTimeUtc: input.startUtc,
      endTimeUtc: endUtc,
      timezone: input.timezone,
    });
  } catch (err) {
    console.error("Booking insert failed:", err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }

  // Send emails before returning. Previously fire-and-forget, but Vercel
  // serverless terminates the container after the response returns, which
  // can kill un-awaited promises mid-send. Costs ~1-2s but guarantees
  // delivery attempts actually complete. Still non-blocking for errors —
  // booking row is already saved, so log + move on if Resend fails.
  if (!isResendConfigured()) {
    console.error(
      "[booking] RESEND_API_KEY not set — skipping invitee + admin emails. " +
        "Booking saved but no one was notified.",
    );
  } else {
    const labels = ["invitee confirmation", "admin notification"] as const;
    const results = await Promise.allSettled([
      sendBookingConfirmation(booking, eventType),
      sendAdminBookingNotification(booking, eventType),
    ]);
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[booking] ${labels[i]} email failed:`, r.reason);
      } else {
        console.log(`[booking] ${labels[i]} email sent OK`);
      }
    });
  }

  // Create a Google Calendar event with Meet link. Soft fails — booking is
  // already valid in our DB and invitee already got their Resend email.
  // If Google event creation succeeds, persist the eventId + meetUrl back
  // to the booking row so cancellation can delete the event later.
  try {
    const googleResult = await createCalendarEventForBooking(
      booking,
      eventType,
    );
    if (googleResult) {
      await attachGoogleEventToBooking(
        booking.id,
        googleResult.eventId,
        googleResult.meetUrl,
      );
    }
  } catch (err) {
    console.error("[google] attach to booking failed:", err);
  }

  return NextResponse.json({
    ok: true,
    cancelToken: booking.cancelToken,
    bookingId: booking.id,
  });
}
