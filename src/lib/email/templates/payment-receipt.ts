// Payment receipt + admin notification email templates.
// Matches the visual style of booking-confirmation.ts (dark slate, indigo
// labels, cyan accent on the eyebrow).

interface BuyerProps {
  customerName: string;
  productName: string;
  priceLabel: string;
  orderId: string;
  siteUrl: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPaymentReceiptEmail(p: BuyerProps): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#00D4FF;">Payment received</p>
            <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.2;color:#f8fafc;">You're in, ${esc(p.customerName)}</h1>
            <p style="margin:0 0 24px 0;color:#94a3b8;font-size:16px;line-height:1.6;">Thanks for buying ${esc(p.productName)} — payment is confirmed. Desi will reach out within 24 hours with next steps (cohort invite, kickoff time, anything you need to bring).</p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr><td>
                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Product</p>
                <p style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#f8fafc;">${esc(p.productName)}</p>

                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Amount</p>
                <p style="margin:0 0 16px 0;font-size:16px;color:#f8fafc;">${esc(p.priceLabel)}</p>

                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Order ID</p>
                <p style="margin:0;font-size:14px;font-family:'JetBrains Mono',monospace;color:#94a3b8;">${esc(p.orderId)}</p>
              </td></tr>
            </table>

            <p style="margin:0 0 16px 0;color:#94a3b8;font-size:14px;line-height:1.6;">Questions? Just reply to this email — it goes straight to Desi.</p>

            <hr style="margin:32px 0 20px 0;border:none;border-top:1px solid #334155;" />
            <p style="margin:0;font-size:12px;color:#64748b;"><a href="${esc(p.siteUrl)}" style="color:#64748b;">digitalalchemy.dev</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

interface AdminProps {
  customerName: string | null;
  customerEmail: string;
  productName: string;
  priceLabel: string;
  orderId: string;
  paypalCaptureId: string;
  siteUrl: string;
}

export function renderPaymentAdminNotificationEmail(p: AdminProps): string {
  const displayName = p.customerName ?? p.customerEmail;
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#40FF78;">New sale</p>
            <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;color:#f8fafc;">${esc(displayName)} bought ${esc(p.productName)}</h1>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr><td>
                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Buyer</p>
                <p style="margin:0 0 4px 0;font-size:16px;color:#f8fafc;">${esc(p.customerName ?? "(no name)")}</p>
                <p style="margin:0 0 16px 0;font-size:14px;color:#94a3b8;">${esc(p.customerEmail)}</p>

                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Product</p>
                <p style="margin:0 0 16px 0;font-size:16px;color:#f8fafc;">${esc(p.productName)} — ${esc(p.priceLabel)}</p>

                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">PayPal capture</p>
                <p style="margin:0 0 16px 0;font-size:13px;font-family:'JetBrains Mono',monospace;color:#94a3b8;">${esc(p.paypalCaptureId)}</p>

                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Order ID</p>
                <p style="margin:0;font-size:13px;font-family:'JetBrains Mono',monospace;color:#94a3b8;">${esc(p.orderId)}</p>
              </td></tr>
            </table>

            <p style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;line-height:1.6;"><b style="color:#f8fafc;">Next step:</b> add them to Skool / cohort and reply with kickoff details.</p>

            <hr style="margin:32px 0 20px 0;border:none;border-top:1px solid #334155;" />
            <p style="margin:0;font-size:12px;color:#64748b;"><a href="${esc(p.siteUrl)}" style="color:#64748b;">digitalalchemy.dev</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
