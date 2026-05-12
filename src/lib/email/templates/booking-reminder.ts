// Reminder email — sent by the cron job 24h and 1h before a booking starts.
// Same visual language as the confirmation email (da-dark bg, indigo accents)
// so the invitee recognizes it as part of the same thread.

export type ReminderKind = "24h" | "1h";

interface BookingReminderProps {
  kind: ReminderKind;
  inviteeName: string;
  eventTitle: string;
  whenLocal: string; // pre-formatted, e.g. "Mon, Apr 8 at 2:00 PM CT"
  locationLabel: string;
  meetUrl: string | null; // populated once Google event was attached
  /** Calendar API `htmlLink` — open the event in Google Calendar in browser */
  googleCalendarHtmlLink: string | null;
  cancelUrl: string;
  siteUrl: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function headlineFor(kind: ReminderKind, name: string): string {
  return kind === "24h"
    ? `See you tomorrow, ${esc(name)}`
    : `Starting in about an hour, ${esc(name)}`;
}

function kickerFor(kind: ReminderKind): string {
  return kind === "24h" ? "Reminder · 24 hours" : "Reminder · starting soon";
}

function subcopyFor(kind: ReminderKind): string {
  return kind === "24h"
    ? "Quick heads-up so it's on your radar. If anything's changed on your end, use the link at the bottom to reschedule or cancel — no hard feelings."
    : "Just a last-minute reminder that we're meeting shortly. The join link is below if you need it.";
}

export function renderBookingReminderEmail(p: BookingReminderProps): string {
  const joinBlock = p.meetUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 12px 0;"><tr><td style="background:#6366f1;border-radius:10px;">
         <a href="${esc(p.meetUrl)}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;">Join Google Meet →</a>
       </td></tr></table>`
    : "";

  const calendarBlock = p.googleCalendarHtmlLink
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px 0;"><tr><td style="border:1px solid #475569;border-radius:10px;background:#0f172a;">
         <a href="${esc(p.googleCalendarHtmlLink)}" style="display:inline-block;padding:14px 24px;color:#e2e8f0;font-weight:600;font-size:15px;text-decoration:none;">Open in Google Calendar →</a>
       </td></tr></table>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#00D4FF;">${esc(kickerFor(p.kind))}</p>
            <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.2;color:#f8fafc;">${headlineFor(p.kind, p.inviteeName)}</h1>
            <p style="margin:0 0 24px 0;color:#94a3b8;font-size:16px;line-height:1.6;">${subcopyFor(p.kind)}</p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr><td>
                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">What</p>
                <p style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#f8fafc;">${esc(p.eventTitle)}</p>

                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">When</p>
                <p style="margin:0 0 16px 0;font-size:16px;color:#f8fafc;">${esc(p.whenLocal)}</p>

                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Where</p>
                <p style="margin:0;font-size:16px;color:#f8fafc;">${esc(p.locationLabel)}</p>
              </td></tr>
            </table>

            ${joinBlock}
            ${calendarBlock}

            <hr style="margin:24px 0 20px 0;border:none;border-top:1px solid #334155;" />
            <p style="margin:0;font-size:13px;color:#64748b;">Need to cancel? <a href="${esc(p.cancelUrl)}" style="color:#94a3b8;">Cancel this booking</a>.</p>
            <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;"><a href="${esc(p.siteUrl)}" style="color:#64748b;">digitalalchemy.dev</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
