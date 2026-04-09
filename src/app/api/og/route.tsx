import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Dynamic OG image generator. Call via:
//   /api/og?title=Your%20Post%20Title&category=Blog
//
// Returns a 1200x630 PNG rendered at request time and cached by
// Vercel's CDN (1 hour default via `next/og`). Used for blog post
// social previews on Twitter, LinkedIn, Slack, Discord, iMessage,
// etc. — all of which crawl <meta property="og:image"> tags.
//
// Design: Digital Alchemy brand gradient background, category
// kicker in cyan, title in the largest Space Grotesk available,
// bottom-right branding lockup with the site URL.

export const runtime = "edge";

const DA_DARK = "#0a0f1e";
const DA_INDIGO = "#6366f1";
const DA_CYAN = "#00D4FF";
const DA_PURPLE = "#8b5cf6";
const DA_TEXT = "#f8fafc";
const DA_MUTED = "#94a3b8";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawTitle =
    searchParams.get("title")?.slice(0, 120) ??
    "Digital Alchemy";
  const category = searchParams.get("category")?.slice(0, 40) ?? "Digital Alchemy";

  // Auto-shrink font size for long titles so they still fit the card.
  // These breakpoints roughly match what looks balanced in practice.
  const titleLength = rawTitle.length;
  const titleFontSize =
    titleLength > 80 ? 56 : titleLength > 50 ? 72 : titleLength > 30 ? 88 : 104;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: DA_DARK,
          backgroundImage: `radial-gradient(circle at 20% 10%, ${DA_INDIGO}33 0%, transparent 45%), radial-gradient(circle at 85% 95%, ${DA_PURPLE}33 0%, transparent 45%), radial-gradient(circle at 50% 50%, ${DA_CYAN}11 0%, transparent 60%)`,
          color: DA_TEXT,
          fontFamily: "sans-serif",
        }}
      >
        {/* Top kicker */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: DA_CYAN,
              boxShadow: `0 0 30px ${DA_CYAN}`,
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: DA_CYAN,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        </div>

        {/* Title — the main event */}
        <div
          style={{
            display: "flex",
            fontSize: titleFontSize,
            lineHeight: 1.05,
            fontWeight: 800,
            color: DA_TEXT,
            maxWidth: "95%",
            letterSpacing: "-0.02em",
          }}
        >
          {rawTitle}
        </div>

        {/* Bottom brand lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: DA_TEXT,
                letterSpacing: "-0.01em",
              }}
            >
              DIGITAL<span style={{ color: DA_CYAN }}>ALCHEMY</span>
            </div>
            <div style={{ fontSize: 22, color: DA_MUTED, marginTop: 6 }}>
              digitalalchemy.dev
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: DA_MUTED,
              borderLeft: `2px solid ${DA_INDIGO}66`,
              paddingLeft: 20,
            }}
          >
            Learn to build with AI
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
