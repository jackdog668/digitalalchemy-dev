// Invitee confirmation email — sent immediately after a successful booking.

interface BookingConfirmationProps {
  inviteeName: string;
  eventTitle: string;
  eventDescription: string;
  whenLocal: string; // pre-formatted, e.g. "Mon, Apr 8 at 2:00 PM CT"
  locationLabel: string; // e.g. "Google Meet (link to be sent)" or "+1-555-..."
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

export function renderBookingConfirmationEmail(
  p: BookingConfirmationProps,
): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#00D4FF;">Booking confirmed</p>
            <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.2;color:#f8fafc;">You're on the calendar, ${esc(p.inviteeName)}</h1>
            <p style="margin:0 0 24px 0;color:#94a3b8;font-size:16px;line-height:1.6;">Thanks for booking — here are the details. We'll follow up ahead of the meeting if there's anything to prep.</p>

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

            <p style="margin:0 0 16px 0;color:#94a3b8;font-size:14px;line-height:1.6;">${esc(p.eventDescription)}</p>

            <hr style="margin:32px 0 20px 0;border:none;border-top:1px solid #334155;" />
            <p style="margin:0;font-size:13px;color:#64748b;">Can't make it? <a href="${esc(p.cancelUrl)}" style="color:#94a3b8;">Cancel this booking</a>.</p>
            <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;"><a href="${esc(p.siteUrl)}" style="color:#64748b;">digitalalchemy.dev</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
