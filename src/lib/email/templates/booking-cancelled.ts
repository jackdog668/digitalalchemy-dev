// Cancellation email — sent to both parties when a booking is cancelled.

interface CancellationProps {
  recipientName: string;
  eventTitle: string;
  whenLocal: string;
  cancelledBy: "invitee" | "admin";
  reason: string | null;
  siteUrl: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderCancellationEmail(p: CancellationProps): string {
  const reasonBlock = p.reason
    ? `<p style="margin:16px 0 0 0;padding:12px;background:#0f172a;border-left:3px solid #64748b;border-radius:4px;font-size:14px;color:#94a3b8;white-space:pre-wrap;">${esc(p.reason)}</p>`
    : "";

  const heading =
    p.cancelledBy === "invitee"
      ? `Booking cancelled`
      : `Your booking was cancelled`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Cancellation</p>
            <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;color:#f8fafc;">${esc(heading)}</h1>
            <p style="margin:0 0 4px 0;color:#94a3b8;font-size:15px;">${esc(p.eventTitle)}</p>
            <p style="margin:0 0 16px 0;color:#94a3b8;font-size:15px;">${esc(p.whenLocal)}</p>
            ${reasonBlock}
            <hr style="margin:32px 0 20px 0;border:none;border-top:1px solid #334155;" />
            <p style="margin:0;font-size:13px;color:#64748b;">Need to book again? <a href="${esc(p.siteUrl)}/book" style="color:#94a3b8;">Pick a new time</a>.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
