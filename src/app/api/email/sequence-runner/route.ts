import { NextResponse, type NextRequest } from "next/server";
import {
  isResendConfigured,
  isSupabaseConfigured,
  verifyCronAuth,
} from "@/lib/env";
import { processDueEmailSequences } from "@/lib/email/sequences";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: true, skipped: "supabase-not-configured" },
      { status: 200 },
    );
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      { ok: true, skipped: "resend-not-configured" },
      { status: 200 },
    );
  }

  const startedAt = Date.now();
  const summary = await processDueEmailSequences();
  const result = {
    ...summary,
    durationMs: Date.now() - startedAt,
  };

  console.log("[email sequence runner]", JSON.stringify(result));
  return NextResponse.json(result);
}
