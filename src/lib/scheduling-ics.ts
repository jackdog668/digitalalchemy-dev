import type { Booking, EventType } from "@/lib/scheduling-constants";

// Build an RFC 5545 ICS calendar event. Used as an attachment (base64) or
// data URL in booking confirmation emails so invitees can one-click "Add to
// calendar" in Apple Mail, Gmail, Outlook, etc.

function fmtIcsDate(iso: string): string {
  // 2026-04-08T14:30:00.000Z → 20260408T143000Z
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildIcsString(
  booking: Booking,
  eventType: EventType,
  siteName: string,
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${esc(siteName)}//Scheduling//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${booking.id}@digitalalchemy.dev`,
    `DTSTAMP:${fmtIcsDate(new Date().toISOString())}`,
    `DTSTART:${fmtIcsDate(booking.startTime)}`,
    `DTEND:${fmtIcsDate(booking.endTime)}`,
    `SUMMARY:${esc(eventType.title)}`,
    `DESCRIPTION:${esc(eventType.description)}`,
    `ORGANIZER;CN=${esc(siteName)}:mailto:noreply@digitalalchemy.dev`,
    `ATTENDEE;CN=${esc(booking.inviteeName)};ROLE=REQ-PARTICIPANT:mailto:${booking.inviteeEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
