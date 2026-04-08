// Client-safe scheduling constants and types. No fs, no supabase —
// can be imported from client components (PostEditor pattern).

export const LOCATION_TYPES = [
  "google_meet",
  "zoom",
  "phone",
  "in_person",
  "custom",
] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const LOCATION_LABELS: Record<LocationType, string> = {
  google_meet: "Google Meet (auto-generated)",
  zoom: "Zoom",
  phone: "Phone call",
  in_person: "In person",
  custom: "Custom location",
};

export const BOOKING_STATUSES = [
  "confirmed",
  "cancelled",
  "rescheduled",
  "completed",
  "no_show",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const EVENT_TYPE_STATUSES = ["active", "inactive"] as const;
export type EventTypeStatus = (typeof EVENT_TYPE_STATUSES)[number];

// Sunday-indexed, matches JS Date.getDay() and our `day_of_week` column.
export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Short list of IANA timezones most likely to be used. Admin-facing dropdown.
// Visitors on the public booking page will auto-detect via browser in Phase 2.
export const POPULAR_TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Los_Angeles",
  "America/Denver",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Berlin",
  "UTC",
] as const;
export type PopularTimezone = (typeof POPULAR_TIMEZONES)[number];

// Custom-question schema (stored as JSONB on event_types.custom_questions).
// Used by the booking form in Phase 2.
export const CUSTOM_QUESTION_TYPES = [
  "short_text",
  "long_text",
  "phone",
] as const;
export type CustomQuestionType = (typeof CUSTOM_QUESTION_TYPES)[number];

export interface CustomQuestion {
  label: string;
  type: CustomQuestionType;
  required: boolean;
}

// Canonical TypeScript shapes for DB rows (camelCase).
// `src/lib/scheduling.ts` converts snake_case DB columns → these at the boundary.
export interface EventType {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  color: string;
  locationType: LocationType;
  locationDetails: string | null;
  priceCents: number;
  currency: string;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minNoticeHours: number;
  maxPerDay: number | null;
  maxAdvanceDays: number;
  status: EventTypeStatus;
  customQuestions: CustomQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRule {
  id: string;
  dayOfWeek: number; // 0–6, Sunday=0
  startTime: string; // "HH:MM" (24h)
  endTime: string; // "HH:MM" (24h)
  timezone: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeNotes: string | null;
  customAnswers: Record<string, string>;
  startTime: string;
  endTime: string;
  timezone: string;
  status: BookingStatus;
  cancelToken: string;
  rescheduleToken: string;
  cancellationReason: string | null;
  cancelledAt: string | null;
  googleCalendarEventId: string | null;
  googleMeetUrl: string | null;
  stripePaymentIntentId: string | null;
  amountPaidCents: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Format cents → "$200" or "Free" */
export function formatPrice(cents: number, currency = "USD"): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Format duration → "30 min" / "1 hr 30 min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}
