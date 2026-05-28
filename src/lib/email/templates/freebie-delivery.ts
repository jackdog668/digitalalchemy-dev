// Freebie email delivery template

interface FreebieDeliveryProps {
  customerEmail: string;
  productName: string;
  downloadUrl?: string;
  siteUrl: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderFreebieDeliveryEmail(p: FreebieDeliveryProps): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#00D4FF;font-weight:700;">Digital Alchemy delivery</p>
            <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;color:#f8fafc;">Your guide is ready, ${esc(p.customerEmail)}</h1>
            <p style="margin:0 0 24px 0;color:#94a3b8;font-size:16px;line-height:1.6;">Thanks for claiming **${esc(p.productName)}**. We have attached your visual guide directly to this email! You can download and open the HTML attachment below natively in any browser to get the step-by-step roadmap.</p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:28px;">
              <tr><td align="center">
                <p style="margin:0 0 6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">Resource Claimed</p>
                <p style="margin:0;font-size:16px;font-weight:600;color:#f8fafc;">${esc(p.productName)}</p>
              </td></tr>
            </table>

            <p style="margin:0 0 16px 0;color:#94a3b8;font-size:14px;line-height:1.6;">Ready to take the next step? We write practical notes on vibe coding, AI prompt engineering, and building dynamic apps. Explore our full library of blueprints and join the active cohort at <a href="${esc(p.siteUrl)}" style="color:#40FF78;text-decoration:none;">digitalalchemy.dev ↗</a>.</p>
            <p style="margin:0 0 16px 0;color:#94a3b8;font-size:14px;line-height:1.6;">Questions or build blockages? Just reply straight to this email—Desi reads every message.</p>

            <hr style="margin:32px 0 20px 0;border:none;border-top:1px solid #334155;" />
            <p style="margin:0;font-size:12px;color:#64748b;"><a href="${esc(p.siteUrl)}" style="color:#64748b;text-decoration:none;">digitalalchemy.dev</a> · Chicago, IL</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
