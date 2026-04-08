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

// Public endpoint — returns available time slots for an event type within a
// date range, converted to the visitor's timezone. Called from the booking
// page client component on date navigation.

const RL_WINDOW_MS = 60_000;
const RL_MAX = 30;
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
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
