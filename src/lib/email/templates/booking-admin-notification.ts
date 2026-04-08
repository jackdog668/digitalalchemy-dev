// Admin notification — sent to Desi whenever someone books a slot.
// Short, actionable: who, what, when, link to admin view.

interface AdminNotificationProps {
  inviteeName: string;
  inviteeEmail: string;
  inviteeNotes: string | null;
  eventTitle: string;
  whenAdminLocal: string; // pre-formatted in ADMIN's TZ
  priceLabel: string; // "Free" or "$200 (invoice later)"
  adminUrl: string; // link to /admin/scheduling/bookings/[id]
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderAdminNotificationEmail(
  p: AdminNotificationProps,
): string {
  const notesBlock = p.inviteeNotes
    ? `<p style="margin:16px 0 0 0;padding:12px;background:#0f172a;border-left:3px solid #6366f1;border-radius:4px;font-size:14px;color:#94a3b8;white-space:pre-wrap;">${esc(p.inviteeNotes)}</p>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#40FF78;">New booking</p>
            <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;color:#f8fafc;">${esc(p.inviteeName)} booked ${esc(p.eventTitle)}</h1>
            <p style="margin:0 0 4px 0;color:#94a3b8;font-size:15px;">${esc(p.whenAdminLocal)}</p>
            <p style="margin:0 0 4px 0;color:#94a3b8;font-size:15px;">${esc(p.inviteeEmail)}</p>
            <p style="margin:0 0 16px 0;color:#94a3b8;font-size:15px;">${esc(p.priceLabel)}</p>
            ${notesBlock}
            <p style="margin:32px 0 0 0;"><a href="${esc(p.adminUrl)}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View in admin</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
