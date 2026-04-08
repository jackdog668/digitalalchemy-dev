import "server-only";

import { Resend } from "resend";
import { toZonedTime } from "date-fns-tz";
import {
  requireResend,
  serverEnv,
  getAdminNotificationEmails,
} from "@/lib/env";
import { SITE } from "@/lib/constants";
import { formatPrice, LOCATION_LABELS } from "@/lib/scheduling-constants";
import type { Booking, EventType } from "@/lib/scheduling-constants";
import { renderBookingConfirmationEmail } from "@/lib/email/templates/booking-confirmation";
import { renderAdminNotificationEmail } from "@/lib/email/templates/booking-admin-notification";
import { renderCancellationEmail } from "@/lib/email/templates/booking-cancelled";
import {
  renderBookingReminderEmail,
  type ReminderKind,
} from "@/lib/email/templates/booking-reminder";

// Format "Mon, Apr 8 at 2:00 PM CT" given an ISO UTC string and target TZ.
function formatWhen(iso: string, tz: string): string {
  const d = toZonedTime(new Date(iso), tz);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
    timeZoneName: "short",
  });
}

function locationLabel(eventType: EventType): string {
  if (eventType.locationType === "google_meet") {
    return "Google Meet (link will be in your calendar invite)";
  }
  if (eventType.locationDetails) {
    return `${LOCATION_LABELS[eventType.locationType]}: ${eventType.locationDetails}`;
  }
  return LOCATION_LABELS[eventType.locationType];
}

function priceLabel(eventType: EventType): string {
  if (eventType.priceCents === 0) return "Free";
  return `${formatPrice(eventType.priceCents, eventType.currency)} (invoice to follow)`;
}

export async function sendBookingConfirmation(
  booking: Booking,
  eventType: EventType,
): Promise<void> {
  const { apiKey, fromEmail } = requireResend();
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  const cancelUrl = `${siteUrl}/scheduling/cancel/${encodeURIComponent(booking.cancelToken)}`;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: `${SITE.name} <${fromEmail}>`,
    to: [booking.inviteeEmail],
    subject: `Confirmed: ${eventType.title} — ${formatWhen(booking.startTime, booking.timezone)}`,
    html: renderBookingConfirmationEmail({
      inviteeName: booking.inviteeName,
      eventTitle: eventType.title,
      eventDescription: eventType.description,
      whenLocal: formatWhen(booking.startTime, booking.timezone),
      locationLabel: locationLabel(eventType),
      cancelUrl,
      siteUrl,
    }),
  });
}

export async function sendAdminBookingNotification(
  booking: Booking,
  eventType: EventType,
): Promise<void> {
  const { apiKey, fromEmail } = requireResend();
  const env = serverEnv();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const adminRecipients = getAdminNotificationEmails();

  // Admin always sees times in their own timezone (Central by default).
  // We infer the admin TZ from the availability rules at send time — simpler
  // is to hard-code from the event type's owner, but we only have one admin
  // in Phase 1/2, so Central is fine. Easy to swap later.
  const adminTz = "America/Chicago";

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: `${SITE.name} <${fromEmail}>`,
    to: adminRecipients,
    subject: `📅 ${booking.inviteeName} booked ${eventType.title}`,
    html: renderAdminNotificationEmail({
      inviteeName: booking.inviteeName,
      inviteeEmail: booking.inviteeEmail,
      inviteeNotes: booking.inviteeNotes,
      eventTitle: eventType.title,
      whenAdminLocal: formatWhen(booking.startTime, adminTz),
      priceLabel: priceLabel(eventType),
      adminUrl: `${siteUrl}/admin/scheduling/bookings/${booking.id}`,
    }),
  });
}

export async function sendBookingReminder(
  booking: Booking,
  eventType: EventType,
  kind: ReminderKind,
): Promise<void> {
  const { apiKey, fromEmail } = requireResend();
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  const cancelUrl = `${siteUrl}/scheduling/cancel/${encodeURIComponent(booking.cancelToken)}`;

  const subjectPrefix =
    kind === "24h" ? "Reminder — tomorrow" : "Starting soon";

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: `${SITE.name} <${fromEmail}>`,
    to: [booking.inviteeEmail],
    subject: `${subjectPrefix}: ${eventType.title} — ${formatWhen(booking.startTime, booking.timezone)}`,
    html: renderBookingReminderEmail({
      kind,
      inviteeName: booking.inviteeName,
      eventTitle: eventType.title,
      whenLocal: formatWhen(booking.startTime, booking.timezone),
      locationLabel: locationLabel(eventType),
      meetUrl: booking.googleMeetUrl,
      cancelUrl,
      siteUrl,
    }),
  });
}

export async function sendCancellationEmails(
  booking: Booking,
  eventType: EventType,
  cancelledBy: "invitee" | "admin",
): Promise<void> {
  const { apiKey, fromEmail } = requireResend();
  const env = serverEnv();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const adminRecipients = getAdminNotificationEmails();
  const adminTz = "America/Chicago";

  const resend = new Resend(apiKey);

  // To invitee
  await resend.emails.send({
    from: `${SITE.name} <${fromEmail}>`,
    to: [booking.inviteeEmail],
    subject: `Cancelled: ${eventType.title}`,
    html: renderCancellationEmail({
      recipientName: booking.inviteeName,
      eventTitle: eventType.title,
      whenLocal: formatWhen(booking.startTime, booking.timezone),
      cancelledBy,
      reason: booking.cancellationReason,
      siteUrl,
    }),
  });

  // To admin(s)
  await resend.emails.send({
    from: `${SITE.name} <${fromEmail}>`,
    to: adminRecipients,
    subject: `Cancelled: ${booking.inviteeName} — ${eventType.title}`,
    html: renderCancellationEmail({
      recipientName: SITE.founder,
      eventTitle: eventType.title,
      whenLocal: formatWhen(booking.startTime, adminTz),
      cancelledBy,
      reason: booking.cancellationReason,
      siteUrl,
    }),
  });
}
