// Diagnose: fetch ALL env vars decrypted to see which types work.

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
const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
const { projectId, orgId } = project;

async function main() {
  // Use v9 with decrypt=true
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${orgId}&decrypt=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    console.log(`ERROR ${res.status}: ${await res.text()}`);
    return;
  }
  const body = await res.json();
  const envs = body.envs as Array<{
    id: string;
    key: string;
    type: string;
    target: string[];
    value?: string;
  }>;

  console.log(`Total env vars: ${envs.length}\n`);
  console.log("key".padEnd(32) + " | type".padEnd(14) + " | target".padEnd(25) + " | value preview");
  console.log("-".repeat(110));
  for (const e of envs) {
    const val = e.value ?? "<undef>";
    const preview = val.length > 30 ? val.slice(0, 27) + "..." : val;
    console.log(
      e.key.padEnd(32) + " | " + (e.type || "?").padEnd(12) + " | " + e.target.join(",").padEnd(23) + " | " + preview,
    );
  }
}
main();
