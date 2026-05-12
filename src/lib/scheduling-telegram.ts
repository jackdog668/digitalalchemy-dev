import "server-only";

// Scheduling-specific Telegram alerts. Mirrors scheduling-emails.ts but
// for the Telegram channel. Each function builds the message and fires
// it; all return void and never throw — Telegram is a secondary signal,
// the booking row + email path already handle persistence + notification.

import { serverEnv } from "@/lib/env";
import {
  sendTelegramAlert,
  escapeHtml,
  escapeHtmlAttr,
  formatAdminTime,
  isTelegramConfigured,
} from "@/lib/telegram";
import type { Booking, EventType } from "@/lib/scheduling-constants";

function adminBookingLink(bookingId: string): string {
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  return `${siteUrl}/admin/scheduling/bookings/${bookingId}`;
}

/** Calendar event (browser) + Meet — shown when Google sync succeeded. */
function pushGoogleLinks(lines: string[], booking: Booking): void {
  const hrefs: Array<{ href: string; label: string }> = [];
  if (booking.googleCalendarHtmlLink) {
    hrefs.push({
      href: booking.googleCalendarHtmlLink,
      label: "Open in Google Calendar",
    });
  }
  if (booking.googleMeetUrl) {
    hrefs.push({ href: booking.googleMeetUrl, label: "Join Google Meet" });
  }
  if (hrefs.length === 0) return;
  lines.push("");
  for (const { href, label } of hrefs) {
    lines.push(`<a href="${escapeHtmlAttr(href)}">${label}</a>`);
  }
}

/**
 * Fire-and-forget alert when a new booking is created. Caller should
 * not await this in the hot booking path — but doing so is also fine
 * because the function never throws.
 */
export async function sendNewBookingTelegramAlert(
  booking: Booking,
  eventType: EventType,
): Promise<void> {
  if (!isTelegramConfigured()) return;
  const lines = [
    `<b>NEW BOOKING</b>`,
    `<b>${escapeHtml(booking.inviteeName)}</b> — ${escapeHtml(eventType.title)}`,
    `${escapeHtml(formatAdminTime(booking.startTime))}`,
    `${escapeHtml(booking.inviteeEmail)}`,
  ];
  if (booking.inviteeNotes) {
    lines.push("");
    lines.push(`<i>Notes:</i> ${escapeHtml(booking.inviteeNotes)}`);
  }
  lines.push("");
  lines.push(
    `<a href="${escapeHtmlAttr(adminBookingLink(booking.id))}">View in admin</a>`,
  );
  pushGoogleLinks(lines, booking);
  await sendTelegramAlert(lines.join("\n"));
}

/**
 * Alert when a booking is cancelled (either via the invitee's cancel
 * link or via the admin actions on /admin/scheduling/bookings/[id]).
 * `actor` lets the admin tell at a glance who triggered the cancel.
 */
export async function sendCancellationTelegramAlert(
  booking: Booking,
  eventType: EventType,
  actor: "invitee" | "admin",
): Promise<void> {
  if (!isTelegramConfigured()) return;
  const lines = [
    `<b>CANCELLED</b> (by ${actor})`,
    `<b>${escapeHtml(booking.inviteeName)}</b> — ${escapeHtml(eventType.title)}`,
    `Was: ${escapeHtml(formatAdminTime(booking.startTime))}`,
  ];
  if (booking.cancellationReason) {
    lines.push(`Reason: ${escapeHtml(booking.cancellationReason)}`);
  }
  await sendTelegramAlert(lines.join("\n"));
}

/**
 * Fired by the 15-min cron tick. Tells the admin a meeting starts soon
 * and includes the Meet link (if any) so they can tap straight in from
 * the lock screen.
 */
export async function sendUpcomingTelegramAlert(
  booking: Booking,
  eventType: EventType,
): Promise<void> {
  if (!isTelegramConfigured()) return;
  const lines = [
    `<b>STARTING IN ~15 MIN</b>`,
    `<b>${escapeHtml(booking.inviteeName)}</b> — ${escapeHtml(eventType.title)}`,
    `${escapeHtml(formatAdminTime(booking.startTime))}`,
    `${escapeHtml(booking.inviteeEmail)}`,
  ];
  pushGoogleLinks(lines, booking);
  await sendTelegramAlert(lines.join("\n"));
}
