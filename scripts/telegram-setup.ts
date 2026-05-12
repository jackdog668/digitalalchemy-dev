// One-time helper to fetch the chat ID for your personal Telegram bot.
//
// Usage:
//   1. Create a bot via @BotFather, save the token.
//   2. Open the bot's chat in Telegram and send any message ("hi").
//   3. Set TELEGRAM_BOT_TOKEN in .env.local.
//   4. Run: npx tsx --env-file=.env.local scripts/telegram-setup.ts
//   5. Paste the printed chat ID into TELEGRAM_CHAT_ID in .env.local
//      AND in Vercel (Production + Preview).
//
// The bot only knows about chats AFTER someone has messaged it, so step
// 2 is required. If the script prints "no chats yet", you skipped it.

const token = process.env.TELEGRAM_BOT_TOKEN;

async function main() {
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not set in .env.local. Add it first.");
    process.exit(1);
  }

  console.log("Fetching recent updates from Telegram...");
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  if (!res.ok) {
    console.error(
      `Telegram API error ${res.status}: ${await res.text().catch(() => "")}`,
    );
    process.exit(1);
  }
  const body = (await res.json()) as {
    ok: boolean;
    result?: Array<{
      message?: {
        chat?: { id: number; type: string; first_name?: string; username?: string };
        text?: string;
        date: number;
      };
    }>;
    description?: string;
  };

  if (!body.ok) {
    console.error(`Telegram returned not-ok: ${body.description}`);
    process.exit(1);
  }
  const updates = body.result ?? [];
  if (updates.length === 0) {
    console.log("");
    console.log("No chats yet. Open your bot in Telegram and send any message,");
    console.log("then re-run this script.");
    console.log("");
    process.exit(0);
  }

  const seen = new Map<
    number,
    { type: string; name: string; lastMessage: string; lastDate: Date }
  >();
  for (const u of updates) {
    const chat = u.message?.chat;
    if (!chat) continue;
    const name =
      chat.first_name ?? chat.username ?? `chat-${chat.id}`;
    seen.set(chat.id, {
      type: chat.type,
      name,
      lastMessage: u.message?.text?.slice(0, 80) ?? "<no text>",
      lastDate: new Date((u.message?.date ?? 0) * 1000),
    });
  }

  console.log("");
  console.log("─".repeat(60));
  console.log("Chats your bot has seen:");
  console.log("─".repeat(60));
  for (const [id, info] of seen) {
    console.log("");
    console.log(`  Chat ID: ${id}`);
    console.log(`  Type:    ${info.type}`);
    console.log(`  Name:    ${info.name}`);
    console.log(`  Last:    ${info.lastDate.toISOString()}`);
    console.log(`  Message: ${info.lastMessage}`);
  }
  console.log("");
  console.log("─".repeat(60));
  console.log("Paste your personal chat ID into .env.local as:");
  console.log("  TELEGRAM_CHAT_ID=<the number above>");
  console.log("Then add it to Vercel (Production + Preview).");
  console.log("─".repeat(60));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
