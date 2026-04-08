// Double opt-in confirmation email.

interface ConfirmEmailProps {
  confirmUrl: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderConfirmEmail({ confirmUrl }: ConfirmEmailProps): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
            <tr><td>
              <h1 style="margin:0 0 16px 0;font-size:24px;color:#f8fafc;">Confirm your subscription</h1>
              <p style="margin:0 0 24px 0;color:#94a3b8;font-size:16px;line-height:1.6;">Thanks for subscribing to the Digital Alchemy newsletter. Tap the button below to confirm your email and start getting new posts in your inbox.</p>
              <a href="${esc(confirmUrl)}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Confirm subscription</a>
              <p style="margin:24px 0 0 0;font-size:12px;color:#64748b;">If you didn't sign up, just ignore this email.</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
