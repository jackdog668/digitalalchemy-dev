import "server-only";
import { getAuthedCalendarClient } from "./client";
import type { Booking } from "@/lib/scheduling-constants";

export interface BusyInterval {
  start: string; // ISO
  end: string; // ISO
}

/**
 * Call Google Calendar freebusy.query and return a flat array of busy
 * intervals for the admin's primary calendar within the given window.
 *
 * Soft-fails on any error (network, auth, API) — returns []. Slot generation
 * falls back to DB-only bookings in that case. This keeps the public booking
 * page resilient to Google API outages.
 */
export async function fetchBusyIntervals(
  fromIso: string,
  toIso: string,
): Promise<BusyInterval[]> {
  try {
    const { calendar, tokens } = await getAuthedCalendarClient();
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: fromIso,
        timeMax: toIso,
        items: [{ id: tokens.calendarId }],
      },
    });
    const busyList = res.data.calendars?.[tokens.calendarId]?.busy ?? [];
    return busyList
      .filter((b) => b.start && b.end)
      .map((b) => ({ start: b.start!, end: b.end! }));
  } catch (err) {
    console.error("[google] fetchBusyIntervals failed:", err);
    return [];
  }
}

/**
 * Convert busy intervals into synthetic Booking objects so they can be merged
 * with real DB bookings and fed into computeAvailableSlots() unchanged.
 * The existing overlaps() predicate treats anything with status='confirmed'
 * as blocking, which is exactly what we want.
 */
export function busyIntervalsAsBookings(
  busy: BusyInterval[],
  eventTypeId: string,
): Booking[] {
  return busy.map((b, idx) => ({
    id: `google-busy-${idx}`,
    eventTypeId,
    inviteeName: "(Google Calendar)",
    inviteeEmail: "",
    inviteeNotes: null,
    customAnswers: {},
    startTime: b.start,
    endTime: b.end,
    timezone: "UTC",
    status: "confirmed",
    cancelToken: "",
    rescheduleToken: "",
    cancellationReason: null,
    cancelledAt: null,
    googleCalendarEventId: null,
    googleMeetUrl: null,
    stripePaymentIntentId: null,
    amountPaidCents: null,
    reminder24hSentAt: null,
    reminder1hSentAt: null,
    createdAt: b.start,
    updatedAt: b.start,
  }));
}
