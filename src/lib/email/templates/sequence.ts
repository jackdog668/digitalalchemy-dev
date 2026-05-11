interface SequenceEmailProps {
  previewText: string;
  bodyHtml: string;
  unsubscribeUrl: string;
  siteUrl: string;
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderSequenceEmail({
  previewText,
  bodyHtml,
  unsubscribeUrl,
  siteUrl,
}: SequenceEmailProps): string {
  return `
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
    ${esc(previewText)}
  </div>
  <div style="margin:0;padding:0;background:#050816;font-family:Arial,sans-serif;color:#e5e7eb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050816;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0f172a;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#00D4FF;">Digital Alchemy</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px 28px;color:#e5e7eb;font-size:16px;line-height:1.65;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #1f2937;padding:18px 28px;color:#94a3b8;font-size:12px;line-height:1.5;">
                You are receiving this because you subscribed at
                <a href="${esc(siteUrl)}" style="color:#94a3b8;">digitalalchemy.dev</a>.
                <a href="${esc(unsubscribeUrl)}" style="color:#94a3b8;">Unsubscribe</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}
