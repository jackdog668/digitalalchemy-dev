// Send a test ADMIN notification email (not a customer confirm) to verify
// ADMIN_NOTIFICATION_EMAILS is routing correctly.

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY!;
const from = process.env.RESEND_FROM_EMAIL!;
const raw = (process.env.ADMIN_NOTIFICATION_EMAILS || process.env.ADMIN_EMAIL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`FROM:  ${from}`);
console.log(`TO:    ${raw.join(", ")}`);

async function main() {
const resend = new Resend(apiKey);
const result = await resend.emails.send({
  from: `Digital Alchemy <${from}>`,
  to: raw,
  subject: `📅 Admin notification probe — ${new Date().toLocaleString()}`,
  html: `<p>This simulates the admin notification you'll receive when a new booking comes in.</p>
         <p>If you got this at <b>${raw.join(", ")}</b>, routing is correct.</p>`,
});

if (result.error) {
  console.error("✗", result.error);
  process.exit(1);
}
console.log("✓ Sent — Resend id:", result.data?.id);
}
main();
