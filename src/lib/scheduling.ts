import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type {
  EventType,
  AvailabilityRule,
  Booking,
  CustomQuestion,
} from "@/lib/scheduling-constants";

// ============================================================
// Row adapters — convert snake_case DB rows to camelCase TS
// ============================================================

interface EventTypeRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  color: string;
  location_type: string;
  location_details: string | null;
  price_cents: number;
  currency: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  min_notice_hours: number;
  max_per_day: number | null;
  max_advance_days: number;
  status: string;
  custom_questions: CustomQuestion[] | null;
  created_at: string;
  updated_at: string;
}

function rowToEventType(row: EventTypeRow): EventType {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    color: row.color,
    locationType: row.location_type as EventType["locationType"],
    locationDetails: row.location_details,
    priceCents: row.price_cents,
    currency: row.currency,
    bufferBeforeMinutes: row.buffer_before_minutes,
    bufferAfterMinutes: row.buffer_after_minutes,
    minNoticeHours: row.min_notice_hours,
    maxPerDay: row.max_per_day,
    maxAdvanceDays: row.max_advance_days,
    status: row.status as EventType["status"],
    customQuestions: row.custom_questions ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface AvailabilityRuleRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  created_at: string;
}

function rowToAvailabilityRule(row: AvailabilityRuleRow): AvailabilityRule {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    // Postgres `time` comes back as "HH:MM:SS"; strip seconds for the UI.
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    timezone: row.timezone,
    createdAt: row.created_at,
  };
}

interface BookingRow {
  id: string;
  event_type_id: string;
  invitee_name: string;
  invitee_email: string;
  invitee_notes: string | null;
  custom_answers: Record<string, string> | null;
  start_time: string;
  end_time: string;
  timezone: string;
  status: string;
  cancel_token: string;
  reschedule_token: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  google_calendar_event_id: string | null;
  google_calendar_html_link?: string | null;
  google_meet_url: string | null;
  stripe_payment_intent_id: string | null;
  amount_paid_cents: number | null;
  reminder_24h_sent_at: string | null;
  reminder_1h_sent_at: string | null;
  admin_reminder_15m_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    eventTypeId: row.event_type_id,
    inviteeName: row.invitee_name,
    inviteeEmail: row.invitee_email,
    inviteeNotes: row.invitee_notes,
    customAnswers: row.custom_answers ?? {},
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    status: row.status as Booking["status"],
    cancelToken: row.cancel_token,
    rescheduleToken: row.reschedule_token,
    cancellationReason: row.cancellation_reason,
    cancelledAt: row.cancelled_at,
    googleCalendarEventId: row.google_calendar_event_id,
    googleCalendarHtmlLink: row.google_calendar_html_link ?? null,
    googleMeetUrl: row.google_meet_url,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amountPaidCents: row.amount_paid_cents,
    reminder24hSentAt: row.reminder_24h_sent_at,
    reminder1hSentAt: row.reminder_1h_sent_at,
    adminReminder15mSentAt: row.admin_reminder_15m_sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// Event type queries
// ============================================================

export async function getAllEventTypes(): Promise<EventType[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_event_types")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getAllEventTypes error:", error);
    return [];
  }
  return (data ?? []).map(rowToEventType);
}

export async function getActiveEventTypes(): Promise<EventType[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_event_types")
    .select("*")
    .eq("status", "active")
    .order("price_cents", { ascending: true });
  if (error) {
    console.error("getActiveEventTypes error:", error);
    return [];
  }
  return (data ?? []).map(rowToEventType);
}

export async function getEventTypeBySlug(
  slug: string,
): Promise<EventType | undefined> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_event_types")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToEventType(data);
}

export async function getEventTypeById(
  id: string,
): Promise<EventType | undefined> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_event_types")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToEventType(data);
}

// ============================================================
// Availability queries
// ============================================================

export async function getAvailabilityRules(): Promise<AvailabilityRule[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_availability_rules")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) {
    console.error("getAvailabilityRules error:", error);
    return [];
  }
  return (data ?? []).map(rowToAvailabilityRule);
}

// ============================================================
// Booking queries (Phase 2+ will use these heavily)
// ============================================================

export async function listRecentBookings(limit = 10): Promise<Booking[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("listRecentBookings error:", error);
    return [];
  }
  return (data ?? []).map(rowToBooking);
}

export async function countBookings(): Promise<number> {
  const db = createServiceRoleClient();
  const { count, error } = await db
    .from("scheduling_bookings")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function getBookingsForDateRange(
  eventTypeId: string,
  fromIso: string,
  toIso: string,
): Promise<Booking[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .select("*")
    .eq("event_type_id", eventTypeId)
    .gte("start_time", fromIso)
    .lte("start_time", toIso)
    .order("start_time", { ascending: true });
  if (error) {
    console.error("getBookingsForDateRange error:", error);
    return [];
  }
  return (data ?? []).map(rowToBooking);
}

export async function getAllBookingsInRange(
  fromIso: string,
  toIso: string,
): Promise<Booking[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .select("*")
    .gte("start_time", fromIso)
    .lte("start_time", toIso)
    .order("start_time", { ascending: true });
  if (error) return [];
  return (data ?? []).map(rowToBooking);
}

export async function getBookingById(
  id: string,
): Promise<Booking | undefined> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToBooking(data);
}

export async function getBookingByCancelToken(
  token: string,
): Promise<Booking | undefined> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .select("*")
    .eq("cancel_token", token)
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToBooking(data);
}

export interface CreateBookingInput {
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeNotes: string | null;
  customAnswers: Record<string, string>;
  startTimeUtc: string;
  endTimeUtc: string;
  timezone: string;
}

export async function createBookingRow(
  input: CreateBookingInput,
): Promise<Booking> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .insert({
      event_type_id: input.eventTypeId,
      invitee_name: input.inviteeName,
      invitee_email: input.inviteeEmail.toLowerCase(),
      invitee_notes: input.inviteeNotes,
      custom_answers: input.customAnswers,
      start_time: input.startTimeUtc,
      end_time: input.endTimeUtc,
      timezone: input.timezone,
      status: "confirmed",
    })
    .select()
    .single();
  if (error) throw new Error(`createBookingRow: ${error.message}`);
  return rowToBooking(data);
}

export async function cancelBookingRow(
  id: string,
  reason: string | null,
): Promise<Booking> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .update({
      status: "cancelled",
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`cancelBookingRow: ${error.message}`);
  return rowToBooking(data);
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"],
): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db
    .from("scheduling_bookings")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`updateBookingStatus: ${error.message}`);
}

/**
 * After a successful Google Calendar event creation, persist the API ids
 * (`eventId`, Meet URL, Calendar `htmlLink`) back to the booking row.
 * Separate from createBookingRow so a Google API failure does not roll
 * back the DB write.
 */
export async function attachGoogleEventToBooking(
  id: string,
  googleEventId: string,
  googleMeetUrl: string | null,
  googleCalendarHtmlLink: string | null,
): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db
    .from("scheduling_bookings")
    .update({
      google_calendar_event_id: googleEventId,
      google_meet_url: googleMeetUrl,
      google_calendar_html_link: googleCalendarHtmlLink,
    })
    .eq("id", id);
  if (error)
    throw new Error(`attachGoogleEventToBooking: ${error.message}`);
}

export async function listAllBookings(): Promise<Booking[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_bookings")
    .select("*")
    .order("start_time", { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToBooking);
}

// ============================================================
// Reminder cron helpers (Phase 4)
// ============================================================

export type ReminderKind = "24h" | "1h" | "15m_admin";

const REMINDER_COLUMN: Record<ReminderKind, string> = {
  "24h": "reminder_24h_sent_at",
  "1h": "reminder_1h_sent_at",
  "15m_admin": "admin_reminder_15m_sent_at",
};

/**
 * Find confirmed bookings whose start_time falls inside the reminder window
 * for the given kind AND which have not already had that reminder sent.
 *
 * The cron runs every 15 min. Windows are intentionally wider than the
 * cron interval so that one skipped run doesn't miss a booking — the
 * `_sent_at` column guards against double-sends.
 *
 *     24h kind → start_time ∈ [now + 23h,   now + 25h]
 *      1h kind → start_time ∈ [now + 30m,   now + 90m]
 *  15m_admin   → start_time ∈ [now + 7m,    now + 23m]   (admin Telegram)
 */
export async function getBookingsNeedingReminder(
  kind: ReminderKind,
): Promise<Booking[]> {
  const db = createServiceRoleClient();
  const now = Date.now();
  let windowStartMs: number;
  let windowEndMs: number;
  if (kind === "24h") {
    windowStartMs = now + 23 * 3600_000;
    windowEndMs = now + 25 * 3600_000;
  } else if (kind === "1h") {
    windowStartMs = now + 30 * 60_000;
    windowEndMs = now + 90 * 60_000;
  } else {
    // 15m_admin: target = ~15 min before start. Window is centered on 15
    // and ±8 min wide so a single cron tick at minute :00, :15, :30, :45
    // is guaranteed to catch each upcoming booking once.
    windowStartMs = now + 7 * 60_000;
    windowEndMs = now + 23 * 60_000;
  }
  const column = REMINDER_COLUMN[kind];

  const { data, error } = await db
    .from("scheduling_bookings")
    .select("*")
    .eq("status", "confirmed")
    .is(column, null)
    .gte("start_time", new Date(windowStartMs).toISOString())
    .lte("start_time", new Date(windowEndMs).toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error(`getBookingsNeedingReminder(${kind}) error:`, error);
    return [];
  }
  return (data ?? []).map(rowToBooking);
}

export async function markReminderSent(
  bookingId: string,
  kind: ReminderKind,
): Promise<void> {
  const db = createServiceRoleClient();
  const column = REMINDER_COLUMN[kind];
  const { error } = await db
    .from("scheduling_bookings")
    .update({ [column]: new Date().toISOString() })
    .eq("id", bookingId);
  if (error) throw new Error(`markReminderSent(${kind}): ${error.message}`);
}
