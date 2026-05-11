// Check which domains are verified in your Resend account.
// This tells us what RESEND_FROM_EMAIL *could* be set to.

async function main() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY not set");
    process.exit(1);
  }
  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.error(`Resend API ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const body = await res.json();
  const domains = body.data ?? [];
  if (domains.length === 0) {
    console.log("No domains in your Resend account yet.");
    console.log("You're stuck using onboarding@resend.dev (test mode).");
    console.log("\nNext: https://resend.com/domains → Add Domain → digitalalchemy.dev");
    return;
  }
  console.log("Resend domains:\n");
  for (const d of domains) {
    console.log(`  ${d.name.padEnd(30)}  status=${d.status}  region=${d.region}  id=${d.id}`);
  }
  const verified = domains.filter((d: { status: string }) => d.status === "verified");
  console.log(`\n${verified.length} verified of ${domains.length} total.`);
  if (verified.length > 0) {
    console.log("\nYou can set RESEND_FROM_EMAIL to any address on these domains, e.g.:");
    for (const d of verified) console.log(`  desi@${d.name}   hello@${d.name}   bookings@${d.name}`);
  }
}

main();
