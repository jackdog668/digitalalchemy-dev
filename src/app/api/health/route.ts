import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

// GET /api/health
// Lightweight liveness probe for uptime monitors (UptimeRobot, BetterStack,
// Vercel deploy smoke tests). No auth, no DB hit — just confirms the Node
// runtime + env validation didn't blow up on cold start.
//
// We return PAYPAL_ENV so a live deploy accidentally pointing at sandbox
// (or vice versa) is visible from the response without hitting payments.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Touch serverEnv() so a misconfigured deploy fails the health check
  // instead of silently 200ing while every other route 500s.
  const env = serverEnv();
  return NextResponse.json(
    {
      ok: true,
      ts: new Date().toISOString(),
      paypalEnv: env.PAYPAL_ENV,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
