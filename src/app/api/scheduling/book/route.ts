import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getEventTypeBySlug,
  getAvailabilityRules,
  getBookingsForDateRange,
  createBookingRow,
} from "@/lib/scheduling";
import { isSlotStillAvailable } from "@/lib/scheduling-slots";
import {
  sendBookingConfirmation,
  sendAdminBookingNotification,
} from "@/lib/scheduling-emails";
import { isSupabaseConfigured, isResendConfigured } from "@/lib/env";

// Public endpoint — creates a booking. Revalidates slot availability server-
// side to prevent double-booking races, then inserts the row and fires off
// two emails in parallel (invitee confirmation + admin notification).

const RL_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RL_MAX = 3; // 3 bookings per hour per IP
const bucket = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || entry.resetAt < now) {
    bucket.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return true;
  }
  if (entry.count >= RL_MAX) return false;
  entry.count += 1;
  return true;
}

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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "3600" } },
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

  // Fire emails in parallel — don't block the response if one fails
  if (isResendConfigured()) {
    Promise.allSettled([
      sendBookingConfirmation(booking, eventType),
      sendAdminBookingNotification(booking, eventType),
    ]).then((results) => {
      results.forEach((r) => {
        if (r.status === "rejected") {
          console.error("Booking email failed:", r.reason);
        }
      });
    });
  }

  return NextResponse.json({
    ok: true,
    cancelToken: booking.cancelToken,
    bookingId: booking.id,
  });
}
