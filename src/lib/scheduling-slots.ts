import "server-only";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import {
  addDays,
  addMinutes,
  startOfDay,
  isAfter,
  isBefore,
} from "date-fns";
import type {
  EventType,
  AvailabilityRule,
  Booking,
  BookingStatus,
} from "@/lib/scheduling-constants";

// ============================================================
// Slot generation — the heart of the booking system
// ============================================================
//
// Given an event type, the admin's weekly availability rules, and the set of
// existing bookings, compute the list of free time slots within a date range.
// All returned timestamps are UTC; the visitor's timezone is used only for
// display-friendly strings attached to each slot.
//
// This file is server-only — it uses no DB client directly, so it's easy to
// unit-test with mocked inputs.

export interface Slot {
  /** ISO-8601 UTC */
  startUtc: string;
  /** ISO-8601 UTC */
  endUtc: string;
  /** Display string in the viewer's timezone, e.g. "Mon, Apr 8 · 10:00 AM" */
  startLocal: string;
  endLocal: string;
}

// ============================================================
// overlaps() — THE business-logic decision point
// ============================================================
//
// Given a proposed [slotStart, slotEnd] (UTC) and a list of existing bookings,
// return true if the proposed slot conflicts with any "blocking" booking
// after factoring in buffer times.
//
// This is a working default. Three decisions are baked in — each is marked
// with a TODO(Desi) so you can change them if you disagree:
//
//   1. BLOCKING STATUSES — what counts as a "taken" slot?
//      Default: only "confirmed" bookings block. Cancelled, rescheduled,
//      completed, and no_show slots free up.
//      Alternative: include "completed" too (past slots stay blocked even
//      after the meeting ends — prevents double-logging).
//
//   2. BUFFER APPLICATION — do buffers extend the existing booking outward?
//      Default: existing booking's footprint is extended by bufferBefore
//      (earlier) and bufferAfter (later). So a 2pm–3pm booking with 15min
//      buffers blocks 1:45pm–3:15pm for the new slot.
//      Alternative: extend the new slot's footprint instead (same math,
//      opposite direction).
//
//   3. EDGE CASE — does a slot ending EXACTLY at an existing booking's start
//      count as overlap?
//      Default: NO. A slot from 1pm–2pm and an existing 2pm–3pm booking do
//      not overlap (strict `<` comparison).
//      Alternative: YES (use `<=`). Makes sense if you want back-to-back
//      meetings to be impossible.
//
// If you want different behavior, edit the three marked sections below.
function overlaps(
  slotStartMs: number,
  slotEndMs: number,
  existingBookings: Booking[],
  bufferBeforeMs: number,
  bufferAfterMs: number,
): boolean {
  // TODO(Desi): decision #1 — which booking statuses block a new slot?
  const BLOCKING_STATUSES: ReadonlySet<BookingStatus> = new Set([
    "confirmed",
  ]);

  for (const booking of existingBookings) {
    if (!BLOCKING_STATUSES.has(booking.status)) continue;

    const bookingStartMs = new Date(booking.startTime).getTime();
    const bookingEndMs = new Date(booking.endTime).getTime();

    // TODO(Desi): decision #2 — extend the EXISTING booking's footprint by
    // the buffer. Change the +/- signs here if you'd rather extend the new
    // slot's footprint instead.
    const blockedStartMs = bookingStartMs - bufferBeforeMs;
    const blockedEndMs = bookingEndMs + bufferAfterMs;

    // TODO(Desi): decision #3 — use strict `<` so back-to-back meetings are
    // allowed. Change to `<=` if you want a hard separation.
    const overlapping =
      slotStartMs < blockedEndMs && slotEndMs > blockedStartMs;

    if (overlapping) return true;
  }

  return false;
}

// ============================================================
// Parse a "HH:MM" time string on a given date in a given timezone → UTC Date
// ============================================================
function timeOnDateInTz(
  date: Date,
  hhmm: string,
  tz: string,
): Date {
  const [h, m] = hhmm.split(":").map(Number);
  // Build the zoned-time representation first, then convert to UTC.
  const zoned = new Date(
    `${date.toISOString().slice(0, 10)}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
  );
  return fromZonedTime(zoned, tz);
}

function countBookingsOnDayInTz(
  bookings: Booking[],
  dayInTz: Date,
  tz: string,
): number {
  const dayString = toZonedTime(dayInTz, tz).toISOString().slice(0, 10);
  return bookings.filter((b) => {
    if (b.status !== "confirmed") return false;
    const bDay = toZonedTime(new Date(b.startTime), tz)
      .toISOString()
      .slice(0, 10);
    return bDay === dayString;
  }).length;
}

function formatSlotLocal(iso: string, tz: string): string {
  // IMPORTANT: do NOT wrap `new Date(iso)` in `toZonedTime()` before calling
  // `toLocaleString({ timeZone: tz })`. `toZonedTime` shifts the Date's
  // internal UTC ms so that `.getHours()` returns the zoned hour — but
  // `toLocaleString({ timeZone })` *also* applies the TZ offset, leading
  // to a double conversion that's exactly one TZ offset off (e.g. 8 PM
  // Chicago displayed as 3 PM). Pass the raw Date directly; Intl handles
  // the single conversion correctly.
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
}

// ============================================================
// computeAvailableSlots — the main entry point
// ============================================================
export function computeAvailableSlots(params: {
  eventType: EventType;
  rules: AvailabilityRule[];
  existingBookings: Booking[];
  viewerTz: string;
  fromDate: Date;
  toDate: Date;
  now?: Date;
}): Slot[] {
  const {
    eventType,
    rules,
    existingBookings,
    viewerTz,
    fromDate,
    toDate,
  } = params;
  const now = params.now ?? new Date();

  if (rules.length === 0) return [];

  // All rules share the admin's timezone (enforced by AvailabilityEditor).
  const adminTz = rules[0].timezone;

  const durationMs = eventType.durationMinutes * 60 * 1000;
  const bufferBeforeMs = eventType.bufferBeforeMinutes * 60 * 1000;
  const bufferAfterMs = eventType.bufferAfterMinutes * 60 * 1000;
  const minNoticeMs = eventType.minNoticeHours * 60 * 60 * 1000;
  const maxAdvanceMs = eventType.maxAdvanceDays * 24 * 60 * 60 * 1000;

  const earliestBookableMs = now.getTime() + minNoticeMs;
  const latestBookableMs = now.getTime() + maxAdvanceMs;

  // Slot step granularity — we step by the event duration so slots never
  // overlap inside a single window. This is the simplest and most predictable
  // approach; Calendly uses fixed 15/30-min grids which can feel cleaner but
  // also leave dead time at window edges.
  const stepMs = durationMs;

  const slots: Slot[] = [];

  const fromDay = startOfDay(fromDate);
  const toDay = startOfDay(toDate);

  for (let day = fromDay; !isAfter(day, toDay); day = addDays(day, 1)) {
    // Which weekday is this day in the admin's timezone?
    const dayInAdminTz = toZonedTime(day, adminTz);
    const dayOfWeek = dayInAdminTz.getDay();
    const todaysRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);
    if (todaysRules.length === 0) continue;

    // Per-day cap (max_per_day)
    if (eventType.maxPerDay !== null && eventType.maxPerDay !== undefined) {
      const todaysBookings = countBookingsOnDayInTz(
        existingBookings,
        day,
        adminTz,
      );
      if (todaysBookings >= eventType.maxPerDay) continue;
    }

    for (const rule of todaysRules) {
      const windowStartUtc = timeOnDateInTz(day, rule.startTime, adminTz);
      const windowEndUtc = timeOnDateInTz(day, rule.endTime, adminTz);

      let cursorMs = windowStartUtc.getTime();
      const windowEndMs = windowEndUtc.getTime();

      while (cursorMs + durationMs <= windowEndMs) {
        const slotStartMs = cursorMs;
        const slotEndMs = cursorMs + durationMs;

        // Hard-stop if we've sailed past the max advance window
        if (slotStartMs > latestBookableMs) {
          return slots;
        }

        // Respect min notice
        if (slotStartMs < earliestBookableMs) {
          cursorMs += stepMs;
          continue;
        }

        // Check against existing bookings
        if (
          overlaps(
            slotStartMs,
            slotEndMs,
            existingBookings,
            bufferBeforeMs,
            bufferAfterMs,
          )
        ) {
          cursorMs += stepMs;
          continue;
        }

        const startIso = new Date(slotStartMs).toISOString();
        const endIso = new Date(slotEndMs).toISOString();
        slots.push({
          startUtc: startIso,
          endUtc: endIso,
          startLocal: formatSlotLocal(startIso, viewerTz),
          endLocal: formatSlotLocal(endIso, viewerTz),
        });

        cursorMs += stepMs;
      }
    }
  }

  return slots;
}

// ============================================================
// isSlotStillAvailable — used at book-time to prevent double-booking races
// ============================================================
//
// Between "show me the slot picker" and "submit the booking form", another
// visitor could have grabbed the same slot. Before we insert a new booking,
// we re-run the availability check against a fresh `existingBookings` list.
export function isSlotStillAvailable(params: {
  eventType: EventType;
  rules: AvailabilityRule[];
  existingBookings: Booking[];
  startUtc: string;
  now?: Date;
}): boolean {
  const { eventType, rules, existingBookings, startUtc } = params;
  const now = params.now ?? new Date();

  if (rules.length === 0) return false;

  const startMs = new Date(startUtc).getTime();
  const endMs = startMs + eventType.durationMinutes * 60 * 1000;

  // Min notice
  if (startMs < now.getTime() + eventType.minNoticeHours * 60 * 60 * 1000) {
    return false;
  }

  // Max advance
  if (
    startMs >
    now.getTime() + eventType.maxAdvanceDays * 24 * 60 * 60 * 1000
  ) {
    return false;
  }

  // Falls within an availability window (admin TZ)
  const adminTz = rules[0].timezone;
  const startInAdminTz = toZonedTime(new Date(startUtc), adminTz);
  const dayOfWeek = startInAdminTz.getDay();
  const todaysRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);
  if (todaysRules.length === 0) return false;

  const withinWindow = todaysRules.some((rule) => {
    const windowStartMs = timeOnDateInTz(
      new Date(startUtc),
      rule.startTime,
      adminTz,
    ).getTime();
    const windowEndMs = timeOnDateInTz(
      new Date(startUtc),
      rule.endTime,
      adminTz,
    ).getTime();
    return startMs >= windowStartMs && endMs <= windowEndMs;
  });
  if (!withinWindow) return false;

  // Per-day cap
  if (eventType.maxPerDay !== null && eventType.maxPerDay !== undefined) {
    const todaysBookings = countBookingsOnDayInTz(
      existingBookings,
      new Date(startUtc),
      adminTz,
    );
    if (todaysBookings >= eventType.maxPerDay) return false;
  }

  // Not overlapping existing bookings
  const bufferBeforeMs = eventType.bufferBeforeMinutes * 60 * 1000;
  const bufferAfterMs = eventType.bufferAfterMinutes * 60 * 1000;
  if (overlaps(startMs, endMs, existingBookings, bufferBeforeMs, bufferAfterMs)) {
    return false;
  }

  // Suppress the unused-param warning on `isBefore` import (kept for
  // potential future use in scheduled-event edge cases).
  void isBefore;
  void addMinutes;

  return true;
}
