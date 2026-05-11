// CLI v50.42.0 is buggy: --value / stdin both write empty string.
// Bypass and use the Vercel REST API directly.
// Reads token from %APPDATA%\com.vercel.cli\Data\auth.json
// Reads projectId + orgId from .vercel/project.json

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const auth = JSON.parse(
  readFileSync(
    join(homedir(), "AppData", "Roaming", "com.vercel.cli", "Data", "auth.json"),
    "utf8",
  ),
);
const token = auth.token;
if (!token) throw new Error("No Vercel token in auth.json");

const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
const { projectId, orgId } = project;

const TARGETS = ["production"] as const;
const UPDATES: Array<{ key: string; value: string }> = [
  { key: "RESEND_FROM_EMAIL", value: "desi@digitalalchemy.dev" },
  { key: "ADMIN_NOTIFICATION_EMAILS", value: "dbcreationsllc@gmail.com" },
];

async function listEnv() {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${orgId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`list env: ${res.status} ${await res.text()}`);
  return (await res.json()).envs as Array<{
    id: string;
    key: string;
    target: string[];
    value?: string;
  }>;
}

async function deleteEnv(id: string) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env/${id}?teamId=${orgId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`delete ${id}: ${res.status} ${await res.text()}`);
}

async function addEnv(key: string, value: string, targets: readonly string[]) {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${orgId}&upsert=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, value, type: "encrypted", target: targets }),
    },
  );
  const body = await res.text();
  if (!res.ok) throw new Error(`add ${key}: ${res.status} ${body}`);
  console.log(`  ✓ ${key} → ${value}  [${targets.join(", ")}]`);
  console.log(`    response: ${body.slice(0, 300)}`);
}

async function main() {
  console.log("Fetching current env vars...");
  const before = await listEnv();

  // Remove existing entries for our target keys (in our target envs) so we can re-create cleanly
  const keys = new Set(UPDATES.map((u) => u.key));
  for (const e of before) {
    if (!keys.has(e.key)) continue;
    const overlap = e.target.some((t) => (TARGETS as readonly string[]).includes(t));
    if (!overlap) continue;
    console.log(`  removing existing ${e.key} [${e.target.join(",")}]  id=${e.id}`);
    await deleteEnv(e.id);
  }

  console.log("\nAdding new values:");
  for (const u of UPDATES) {
    await addEnv(u.key, u.value, TARGETS);
  }

  console.log("\nVerifying...");
  const after = await listEnv();
  for (const u of UPDATES) {
    const found = after.find(
      (e) =>
        e.key === u.key &&
        e.target.some((t) => (TARGETS as readonly string[]).includes(t)),
    );
    if (!found) {
      console.log(`  ✗ ${u.key}: NOT FOUND`);
      continue;
    }
    // value is redacted from list API unless we request decrypted — fetch it
    const decrypted = await fetch(
      `https://api.vercel.com/v1/projects/${projectId}/env/${found.id}?teamId=${orgId}&decrypt=true`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const d = await decrypted.json();
    const ok = d.value === u.value;
    console.log(
      `  ${ok ? "✓" : "✗"} ${u.key} = "${d.value}"  ${ok ? "" : `(expected "${u.value}")`}`,
    );
  }
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
