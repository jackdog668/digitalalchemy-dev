import "server-only";
import { randomUUID } from "crypto";
import type { Booking, EventType } from "@/lib/scheduling-constants";
import { getAuthedCalendarClient } from "./client";
import { isGoogleOAuthConfigured, serverEnv } from "@/lib/env";
import { isConnected } from "./tokens";

// Format the title of the Google Calendar event as it will appear on Desi's
// personal calendar. Leads with the invitee's name so at-a-glance scanning
// surfaces WHO before WHAT — much easier to triage a packed calendar than
// the previous "Digital Alchemy:" prefix.
function formatEventTitle(booking: Booking, eventType: EventType): string {
  return `${booking.inviteeName} — ${eventType.title}`;
}

function formatEventDescription(
  booking: Booking,
  eventType: EventType,
): string {
  const lines: string[] = [];
  lines.push(eventType.description);
  lines.push("");
  lines.push(`Invitee: ${booking.inviteeName} <${booking.inviteeEmail}>`);
  if (booking.inviteeNotes) {
    lines.push("");
    lines.push("Notes:");
    lines.push(booking.inviteeNotes);
  }
  if (Object.keys(booking.customAnswers).length > 0) {
    lines.push("");
    for (const [q, a] of Object.entries(booking.customAnswers)) {
      lines.push(`${q}: ${a}`);
    }
  }
  return lines.join("\n");
}

/**
 * Create a Google Calendar event for a booking and auto-generate a Meet link.
 * Returns null on any failure (logged). Caller should treat null as
 * "proceed without Google sync" — the booking itself is still valid.
 */
export async function createCalendarEventForBooking(
  booking: Booking,
  eventType: EventType,
): Promise<{ eventId: string; meetUrl: string | null } | null> {
  if (!isGoogleOAuthConfigured()) {
    console.warn(
      "[google] skipping event — GOOGLE_OAUTH_CLIENT_ID / SECRET not set",
    );
    return null;
  }
  const adminEmail = serverEnv().ADMIN_EMAIL;
  if (!(await isConnected(adminEmail))) {
    console.warn(
      `[google] skipping event — no token row for ${adminEmail}. ` +
        `Reconnect at /admin/scheduling.`,
    );
    return null;
  }

  try {
    const { calendar, tokens } = await getAuthedCalendarClient();

    const res = await calendar.events.insert({
      calendarId: tokens.calendarId,
      conferenceDataVersion: 1, // required to create a Meet link
      sendUpdates: "all", // email invitee from Google Calendar
      requestBody: {
        summary: formatEventTitle(booking, eventType),
        description: formatEventDescription(booking, eventType),
        start: { dateTime: booking.startTime, timeZone: "UTC" },
        end: { dateTime: booking.endTime, timeZone: "UTC" },
        attendees: [
          { email: booking.inviteeEmail, displayName: booking.inviteeName },
        ],
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 15 },
          ],
        },
      },
    });

    const eventId = res.data.id;
    const meetUrl = res.data.hangoutLink ?? null;
    if (!eventId) {
      console.error("[google] events.insert returned no eventId");
      return null;
    }
    return { eventId, meetUrl };
  } catch (err) {
    console.error("[google] createCalendarEventForBooking failed:", err);
    return null;
  }
}

/**
 * Delete the Google Calendar event associated with a booking. Soft fails
 * on any error — cancellation has already succeeded in our DB.
 */
export async function deleteCalendarEventForBooking(
  booking: Booking,
): Promise<void> {
  if (!booking.googleCalendarEventId) return;
  if (!isGoogleOAuthConfigured()) {
    console.warn(
      "[google] skipping delete — GOOGLE_OAUTH_CLIENT_ID / SECRET not set",
    );
    return;
  }
  const adminEmail = serverEnv().ADMIN_EMAIL;
  if (!(await isConnected(adminEmail))) {
    console.warn(
      `[google] skipping delete — no token row for ${adminEmail}. ` +
        `Reconnect at /admin/scheduling.`,
    );
    return;
  }

  try {
    const { calendar, tokens } = await getAuthedCalendarClient();
    await calendar.events.delete({
      calendarId: tokens.calendarId,
      eventId: booking.googleCalendarEventId,
      sendUpdates: "all",
    });
  } catch (err) {
    console.error("[google] deleteCalendarEventForBooking failed:", err);
  }
}
