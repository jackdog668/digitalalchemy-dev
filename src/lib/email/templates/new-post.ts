// Plain HTML template for the new-post announcement email. No JSX — keeps
// the email-send path free of React SSR so it works in edge runtimes too.

interface NewPostEmailProps {
  title: string;
  description: string;
  url: string;
  coverImage: string | null;
  unsubscribeUrl: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderNewPostEmail(props: NewPostEmailProps): string {
  const { title, description, url, coverImage, unsubscribeUrl } = props;
  const cover = coverImage
    ? `<img src="${esc(coverImage)}" alt="" style="width:100%;max-width:600px;border-radius:12px;margin-bottom:24px" />`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0f1e;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px;">
            <tr><td>
              <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;">New post</p>
              <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.2;color:#f8fafc;">${esc(title)}</h1>
              ${cover}
              <p style="margin:0 0 24px 0;color:#94a3b8;font-size:16px;line-height:1.6;">${esc(description)}</p>
              <a href="${esc(url)}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Read the post →</a>
              <hr style="margin:40px 0 20px 0;border:none;border-top:1px solid #334155;" />
              <p style="margin:0;font-size:12px;color:#64748b;">You're receiving this because you subscribed at digitalalchemy.dev. <a href="${esc(unsubscribeUrl)}" style="color:#94a3b8;">Unsubscribe</a>.</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
