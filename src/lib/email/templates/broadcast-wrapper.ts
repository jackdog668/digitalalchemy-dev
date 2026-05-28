// Premium email wrapper compiler for custom admin broadcasts and campaigns.
import "server-only";

interface BroadcastCompileProps {
  content: string;
  subject: string;
  customerEmail: string;
  downloadUrl: string;
  siteUrl: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Derives a clean first name prefix from a subscriber's email address.
 * E.g. "desi.baker@gmail.com" -> "Desi"
 */
export function deriveFirstName(email: string): string {
  if (!email || !email.includes("@")) return "Alchemist";
  const part = email.split("@")[0];
  // Split on dots, dashes, or underscores and take the first part
  const first = part.split(/[\._-]/)[0];
  if (!first) return "Alchemist";
  // Capitalize first letter
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * Performs dynamic merge tag substitutions for a specific recipient.
 */
export function interpolateMergeTags(
  text: string,
  p: { customerEmail: string; downloadUrl: string; siteUrl: string }
): string {
  const firstName = deriveFirstName(p.customerEmail);
  const unsubscribeUrl = `${p.siteUrl}/unsubscribe?email=${encodeURIComponent(p.customerEmail)}`;
  
  return text
    .replace(/\{\{email\}\}/g, p.customerEmail)
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{download_url\}\}/g, p.downloadUrl)
    .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl)
    .replace(/\{\{site_url\}\}/g, p.siteUrl);
}

/**
 * Renders custom drafted campaign content wrapped inside the gorgeous
 * Digital Alchemy low-chroma slate shell.
 */
export function renderBroadcastEmail(p: BroadcastCompileProps): string {
  const interpolatedContent = interpolateMergeTags(p.content, {
    customerEmail: p.customerEmail,
    downloadUrl: p.downloadUrl,
    siteUrl: p.siteUrl,
  });

  // Convert line breaks to HTML paragraphs to make drafting natural for the user
  const contentHtml = interpolatedContent
    .split(/\n{2,}/)
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";
      // If it looks like HTML, let it pass directly, otherwise wrap in <p>
      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        return trimmed;
      }
      return `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#94a3b8;">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;text-align:left;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#00D4FF;font-weight:700;">Digital Alchemy Broadcast</p>
            <h1 style="margin:0 0 24px 0;font-size:24px;line-height:1.2;color:#f8fafc;">${esc(interpolateMergeTags(p.subject, {
              customerEmail: p.customerEmail,
              downloadUrl: p.downloadUrl,
              siteUrl: p.siteUrl,
            }))}</h1>
            
            <div style="color:#e2e8f0;">
              ${contentHtml}
            </div>

            <hr style="margin:32px 0 20px 0;border:none;border-top:1px solid #334155;" />
            <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
              <a href="${esc(p.siteUrl)}" style="color:#64748b;text-decoration:none;">digitalalchemy.dev</a> · Chicago, IL <br />
              Sent to ${esc(p.customerEmail)}. If you no longer want to receive these, you can 
              <a href="${esc(p.siteUrl)}/unsubscribe?email=${encodeURIComponent(p.customerEmail)}" style="color:#6366f1;text-decoration:underline;">unsubscribe</a> instantly.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
