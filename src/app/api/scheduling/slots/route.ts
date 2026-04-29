import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getEventTypeBySlug,
  getAvailabilityRules,
  getBookingsForDateRange,
} from "@/lib/scheduling";
import { computeAvailableSlots } from "@/lib/scheduling-slots";
import { isSupabaseConfigured } from "@/lib/env";
import {
  fetchBusyIntervals,
  busyIntervalsAsBookings,
} from "@/lib/google/freebusy";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Public endpoint — returns available time slots for an event type within a
// date range, converted to the visitor's timezone. Called from the booking
// page client component on date navigation.

const bodySchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/),
    viewerTz: z.string().min(1).max(100),
    fromDate: z.string().min(1).max(40), // ISO date or datetime
    toDate: z.string().min(1).max(40),
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
    key: "scheduling:slots",
    identifier: ip,
    max: 30,
    windowMs: 60_000,
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

  const { slug, viewerTz, fromDate, toDate } = parsed.data;

  const eventType = await getEventTypeBySlug(slug);
  if (!eventType || eventType.status !== "active") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (
    isNaN(from.getTime()) ||
    isNaN(to.getTime()) ||
    to.getTime() - from.getTime() > 1000 * 60 * 60 * 24 * 90
  ) {
    // Cap at 90 days per request to prevent huge payloads.
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const rules = await getAvailabilityRules();
  const dbBookings = await getBookingsForDateRange(
    eventType.id,
    from.toISOString(),
    to.toISOString(),
  );

  // Pull the admin's Google Calendar busy intervals and merge them in as
  // synthetic bookings. Fails soft — returns [] on any error so the slot
  // picker stays functional during Google API outages.
  const googleBusy = await fetchBusyIntervals(
    from.toISOString(),
    to.toISOString(),
  );
  const googleBookings = busyIntervalsAsBookings(googleBusy, eventType.id);

  const slots = computeAvailableSlots({
    eventType,
    rules,
    existingBookings: [...dbBookings, ...googleBookings],
    viewerTz,
    fromDate: from,
    toDate: to,
  });

  return NextResponse.json({ slots });
}
