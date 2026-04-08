import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { generateAuthUrl } from "@/lib/google/client";
import { isGoogleOAuthConfigured } from "@/lib/env";

// Admin-only (middleware gates /api/scheduling/google/**).
// Generates a CSRF state token, stores it in a short-lived cookie, then
// redirects the admin to Google's OAuth consent screen.
export async function GET(req: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/scheduling?google=notconfigured", req.url),
    );
  }

  const state = randomBytes(32).toString("hex");
  const authUrl = generateAuthUrl(state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });
  return res;
}
