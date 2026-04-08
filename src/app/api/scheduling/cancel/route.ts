import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getBookingByCancelToken,
  getEventTypeById,
  cancelBookingRow,
} from "@/lib/scheduling";
import { sendCancellationEmails } from "@/lib/scheduling-emails";
import { isSupabaseConfigured, isResendConfigured } from "@/lib/env";

const RL_WINDOW_MS = 60 * 60 * 1000;
const RL_MAX = 10;
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
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

  return NextResponse.json({ ok: true });
}
