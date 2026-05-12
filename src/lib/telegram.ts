import "server-only";

// Telegram bot client. Sends short notifications to a single chat
// (Desi's personal chat with the bot) when bookings happen, cancel, or
// are about to start. Soft-fails on every error — a Telegram outage must
// not break the booking flow itself.
//
// Setup:
//   1. Open Telegram, search @BotFather, send `/newbot`, follow prompts.
//      Save the bot token it returns.
//   2. Open the new bot's chat, send any message (e.g. "hi").
//   3. Run: npx tsx --env-file=.env.local scripts/telegram-setup.ts
//      It will print your chat ID.
//   4. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local AND
//      in Vercel (Production + Preview).

import { serverEnv } from "@/lib/env";

const TELEGRAM_API = "https://api.telegram.org";

/** True when both Telegram env vars are set — safe to call the API. */
export function isTelegramConfigured(): boolean {
  const env = serverEnv();
  return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);
}

/**
 * Send a plain or HTML-formatted message to the configured chat.
 * Returns true on success, false on any failure (logged). Caller should
 * not throw on a false return — Telegram is a secondary notification, the
 * primary state (booking row, email) has already been persisted.
 *
 * Supports a tiny HTML subset:
 *   <b>bold</b>  <i>italic</i>  <u>underline</u>  <a href="...">link</a>
 *   <code>code</code>  <pre>pre</pre>
 */
export async function sendTelegramAlert(html: string): Promise<boolean> {
  if (!isTelegramConfigured()) {
    console.warn(
      "[telegram] skipping alert — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set",
    );
    return false;
  }
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = serverEnv();
  try {
    const res = await fetch(
      `${TELEGRAM_API}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: html,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "<no body>");
      console.error(
        `[telegram] sendMessage ${res.status}: ${body.slice(0, 200)}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] sendMessage threw:", err);
    return false;
  }
}

/**
 * Escape user-supplied text so it renders as literal text inside an
 * HTML-formatted Telegram message. Required for invitee names / notes
 * that could contain `<`, `>`, or `&`.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Format an ISO timestamp in the admin's home timezone (Chicago) so
 * messages read naturally for Desi regardless of the invitee's tz.
 */
export function formatAdminTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}
