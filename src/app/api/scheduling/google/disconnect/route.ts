import { NextResponse, type NextRequest } from "next/server";
import { deleteTokens } from "@/lib/google/tokens";
import { serverEnv } from "@/lib/env";

// Admin-only (middleware gates /api/scheduling/google/**). POST only — we
// don't want CSRF shenanigans disconnecting the admin's Google account.
export async function POST(req: NextRequest) {
  try {
    const adminEmail = serverEnv().ADMIN_EMAIL;
    await deleteTokens(adminEmail);
  } catch (err) {
    console.error("[google] disconnect failed:", err);
  }
  return NextResponse.redirect(
    new URL("/admin/scheduling?google=disconnected", req.url),
  );
}
