# Digital Alchemy — Blog/Admin/Newsletter Setup

This site has a full blog stack: SEO, RSS, Supabase-backed admin, Resend newsletter. Phase 1 (SEO + RSS) works today with zero config. Phases 2–4 need ~10 min of external setup.

## 1. Supabase (posts + subscribers)

1. Create a new project at https://supabase.com/dashboard
2. In the project dashboard, go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠ server-only, never commit)
3. Paste into `.env.local` (copy `.env.example` first)
4. In the Supabase dashboard, go to **SQL Editor** → **New query**, paste the contents of `supabase/schema.sql`, run it. You should see 3 new tables: `posts`, `subscribers`, `post_views`.
5. In **Authentication → Providers**, confirm **Email** is enabled (it's on by default). Magic-link sign-in uses this.
6. In **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` for dev, `https://digitalalchemy.dev` for prod
   - **Redirect URLs**: add `http://localhost:3000/admin/auth/callback` and `https://digitalalchemy.dev/admin/auth/callback`

## 2. Migrate existing MDX posts into Supabase

```bash
npx tsx scripts/migrate-mdx-to-supabase.ts
```

This inserts the 2 posts currently in `content/blog/` as rows. Idempotent — safe to re-run.

After migration, the `content/blog/` MDX files are still on disk as a safety net. You can delete them once you've verified `/blog` reads from Supabase.

## 3. Resend (newsletter)

1. Sign up at https://resend.com
2. **Domains** → Add `digitalalchemy.dev` → add the DNS records Resend provides to your DNS host → wait for verification (usually < 10 min)
3. **API Keys** → Create API key → copy it
4. Paste into `.env.local` as `RESEND_API_KEY`
5. Set `RESEND_FROM_EMAIL=desi@digitalalchemy.dev` (any address on the verified domain)

## 4. New subscriber autoresponder

The welcome autoresponder uses the same Supabase + Resend setup as the newsletter. It starts only after the subscriber clicks the double opt-in confirmation link.

1. In Supabase SQL Editor, run:

```bash
supabase/migrations/20260430_email_autoresponder.sql
```

2. Make sure `CRON_SECRET` is set in `.env.local`, Vercel, and GitHub Actions secrets.
3. The scheduled workflow `.github/workflows/email-sequence-runner.yml` calls:

```bash
https://digitalalchemy.dev/api/email/sequence-runner
```

The endpoint is auth-gated by `Authorization: Bearer <CRON_SECRET>`, sends one due autoresponder email per enrollment, and records each sent/failed/skipped attempt in `email_sequence_sends`.

## 5. Start the site

```bash
npm run dev
```

Visit:

- http://localhost:3000/blog — blog index with subscribe form
- http://localhost:3000/admin/login — enter `desibaker54@gmail.com`, click magic link in email
- http://localhost:3000/admin — create/edit/delete posts
- http://localhost:3000/feed.xml — RSS
- http://localhost:3000/sitemap.xml — sitemap

## How it works

- **Only you** can access `/admin` — middleware checks the session cookie against `ADMIN_EMAIL`
- **Publishing** a post automatically emails all confirmed subscribers
- **Subscribers** use double opt-in — they confirm via email before getting any newsletters
- **Welcome sequence** enrolls subscribers after confirmation and sends the 3-email autoresponder via the scheduled runner
- **Unsubscribe** is a single click on any email
- **Posts** are versioned in Supabase (created_at, updated_at tracked)
- **Drafts** never appear publicly
- **Scheduled posts** use `published_at > now()` — the public read policy filters them out automatically

## Security notes

- All DB writes use the `service_role` client inside server code
- All server actions call `assertAdmin()` before touching data
- Every public input goes through Zod `.strict()` validation
- Subscribe endpoint is rate-limited (5/min/IP)
- `.env.local` is gitignored
- `/admin` and `/api/admin/*` are `noindex` and excluded in `robots.txt`

---

# Google Calendar Integration (Scheduling Phase 3)

Optional. When configured, the booking system reads your Google Calendar's free/busy and auto-creates events with Google Meet links when someone books. If env vars are missing, the site builds fine and the booking system falls back to DB-only.

## 1. Create a Google Cloud project

1. Go to https://console.cloud.google.com
2. Click the project dropdown in the top bar → **New Project**
3. Name it `digital-alchemy-scheduling` (or whatever), leave organization as-is, click Create
4. Switch to the new project

## 2. Enable the Google Calendar API

1. In the sidebar: **APIs & Services** → **Library**
2. Search for `Google Calendar API` → click it → click **Enable**

## 3. Configure the OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**
2. User type: **External** → Create
3. **App information:**
   - App name: `Digital Alchemy Scheduling`
   - User support email: `desibaker54@gmail.com`
   - Developer contact email: `desibaker54@gmail.com`
4. Click **Save and Continue**
5. **Scopes:** click **Add or remove scopes**, search for and add:
   - `.../auth/calendar.events`
   - `.../auth/calendar.freebusy`
   - Save
6. **Test users:** **Add users** → `desibaker54@gmail.com` → Save
7. **Summary:** click **Back to dashboard**
8. You can leave the app in **Testing** mode indefinitely — no Google verification needed as long as you're the only user.

## 4. Create OAuth 2.0 credentials

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `Digital Alchemy Web`
4. **Authorized redirect URIs** — add BOTH:
   - `http://localhost:3000/api/scheduling/google/callback`
   - `https://digitalalchemy.dev/api/scheduling/google/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** from the popup

## 5. Paste into `.env.local`

```
GOOGLE_OAUTH_CLIENT_ID=<paste client id>
GOOGLE_OAUTH_CLIENT_SECRET=<paste client secret>
```

Also paste these into **Vercel → Project Settings → Environment Variables** (Production + Preview + Development). Trigger a redeploy.

## 6. Connect from the admin UI

1. `npm run dev`
2. Sign into `/admin/login`
3. Go to `/admin/scheduling`
4. You'll see a "Google Calendar" card at the top. Click **Connect Google Calendar**
5. Google consent screen appears → click your test account → grant the two scopes → redirected back to `/admin/scheduling?google=connected`
6. The card now shows **✓ Connected as desibaker54@gmail.com**

## 7. Verify end-to-end

1. **Free/busy read**: In Google Calendar, create an event for tomorrow at 11:00am (30 min). Visit `/book/<your-event-type-slug>`, pick tomorrow. The 11:00 slot should be hidden.
2. **Event creation**: Book a slot on `/book/<slug>` as a test. Check:
   - A new event appears on your Google Calendar at that time
   - The event has a Google Meet link
   - Two emails arrive at the booking address: one from Resend (`Confirmed: ...`) and one from Google (`Invitation: ...`)
3. **Cancellation**: Click the cancel link in the Resend email, cancel the booking. The Google Calendar event disappears.
4. **Disconnect**: On `/admin/scheduling`, click **Disconnect**. Slot generation falls back to DB-only.

## Troubleshooting

- **"OAuth exchange did not return a full token set"** — Google only issues a refresh token on the *first* grant. If you've connected before, go to https://myaccount.google.com/permissions, revoke Digital Alchemy Scheduling, and try again.
- **Slots don't hide Google Calendar events** — your calendar might be using a non-primary calendar. Check `scheduling_google_oauth_tokens.calendar_id` in Supabase; defaults to `primary`.
- **Booking succeeds but no Google event** — check server logs for `[google]` errors. Most common cause: refresh token revoked, expired scopes, or the admin's Google account is locked. Click Disconnect then Reconnect.
- **"Your client has issued a malformed or illegal request"** — the redirect URI in Google Cloud Console doesn't match exactly. Must include the protocol, host, port, and path with no trailing slash.

---

# Reminder Emails + Embeddable Widget (Scheduling Phase 4)

Phase 4 adds two things:

1. **Reminder emails** — a Vercel Cron hits `/api/scheduling/reminders` every 15 minutes and sends a 24-hour and a 1-hour reminder to each upcoming booking's invitee. Uses the existing Resend setup from Phase 2; no new provider keys.
2. **Embeddable `<BookingWidget />`** — a drop-in iframe that mounts the booking flow on any marketing page. Backed by a new `/embed/[slug]` route that renders the exact same `BookingFlow` component as `/book/[slug]` but with the site nav, footer, grain overlay, and Convai widget hidden via CSS.

## 1. Run the migration

```bash
# In Supabase SQL Editor, run:
supabase/migrations/20260408_scheduling_phase4_reminders.sql
```

Adds two nullable `timestamptz` columns (`reminder_24h_sent_at`, `reminder_1h_sent_at`) plus two partial indexes on `scheduling_bookings`. Idempotent — safe to re-run.

Also run (same SQL Editor; idempotent) if you use Google Calendar sync — stores the Calendar API `htmlLink` on each booking for reminder emails and Telegram:

```bash
supabase/migrations/20260513_google_calendar_html_link.sql
```

Adds nullable `google_calendar_html_link` on `scheduling_bookings`. Required for new code paths that persist and link the event in the browser.

## 2. Generate and set `CRON_SECRET`

Vercel Cron authenticates itself to your endpoint by sending `Authorization: Bearer <CRON_SECRET>`. You generate the secret; Vercel auto-injects it into cron requests.

```bash
# Generate a 48-char random secret
openssl rand -hex 24
# or in PowerShell:
# [Convert]::ToHexString((1..24 | ForEach-Object { Get-Random -Max 256 }))
```

Add to both `.env.local` AND Vercel (Settings → Environment Variables, Production scope):

```
CRON_SECRET=<paste the random hex>
```

Redeploy Vercel after adding env vars.

## 3. Schedule the cron with an EXTERNAL service (not Vercel)

> ⚠️ **Vercel Hobby plan limits crons to once per day.** Our `*/15 * * * *`
> schedule is Pro-only, so we schedule the reminder job from an external
> service instead. The endpoint is auth-gated by `CRON_SECRET` and works
> with any caller — Vercel, GitHub Actions, cron-job.org, etc.

### Recommended: cron-job.org (free, 5-min minimum interval)

1. Sign up at https://cron-job.org (email + password, no credit card)
2. Click **Create cronjob**
3. Configure:
   - **Title**: `DA scheduling reminders`
   - **URL**: `https://digitalalchemy.dev/api/scheduling/reminders`
   - **Schedule**: Every 15 minutes (preset, or `*/15 * * * *` in advanced mode)
4. Expand **Advanced** → **Headers** → add header:
   - Name: `Authorization`
   - Value: `Bearer <paste your CRON_SECRET here>`
5. Save. It will start firing immediately.
6. The **History** tab shows every invocation with the HTTP status + response body. Look for `200 OK` with a `[reminder cron]`-style JSON body.

### Alternative: GitHub Actions (free for public repos)

Create `.github/workflows/scheduling-reminders.yml`:

```yaml
name: Scheduling reminders
on:
  schedule:
    - cron: "*/15 * * * *"
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://digitalalchemy.dev/api/scheduling/reminders
```

Then add `CRON_SECRET` as a GitHub Actions secret (Settings → Secrets and variables → Actions).

### Why not Vercel's built-in cron?

Every deploy with `"crons": [{ "schedule": "*/15 * * * *" }]` in `vercel.json` fails validation on Hobby plan with "Hobby accounts are limited to daily cron jobs." Rather than downgrade to a useless daily schedule (which would break the 1h reminder entirely) or pay $20/mo for Pro, we use an external scheduler. `vercel.json` is kept minimal so deployment always succeeds.

## 4. Test the cron manually

Before waiting for Vercel's scheduler:

```bash
# Replace <CRON_SECRET> with your actual secret
curl -H "Authorization: Bearer <CRON_SECRET>" \
     https://digitalalchemy.dev/api/scheduling/reminders
```

Expected response:

```json
{
  "ok": true,
  "durationMs": 42,
  "results": [
    { "kind": "24h", "attempted": 0, "sent": 0, "failed": 0 },
    { "kind": "1h",  "attempted": 0, "sent": 0, "failed": 0 }
  ],
  "at": "2026-04-08T21:15:00.000Z"
}
```

Without the header, you should get `401 unauthorized` — confirm that too.

## 5. End-to-end reminder test

1. Book a slot for ~1h from now (use the admin `/admin/scheduling` to temporarily lower `min_notice_hours` to 0 if needed, then raise it back)
2. Wait up to 15 minutes for the cron tick (or curl it manually from Step 4)
3. Check: invitee email inbox for a `Starting soon: ...` email
4. Check: in Supabase, the row's `reminder_1h_sent_at` column is populated
5. Re-run the cron manually — the same booking should NOT get a second email (the `IS NULL` guard + the populated column prevent it)

Same flow works for the 24h reminder — book a slot ~24h out, then curl the endpoint.

## 6. Embeddable widget usage

On any **internal** Digital Alchemy page (e.g. `/work-with-me`, an MDX post), use:

```tsx
import { BookingWidget } from "@/components/scheduling/BookingWidget";

<BookingWidget slug="discovery-call" height={880} />
```

On **third-party** sites (Squarespace, WordPress, raw HTML), copy-paste:

```html
<iframe
  src="https://digitalalchemy.dev/embed/discovery-call"
  width="100%"
  height="880"
  style="border:0;border-radius:12px;background:#0a0f1e;"
  title="Book a session with Digital Alchemy"
  loading="lazy"
></iframe>
```

`/embed/*` is served with `Content-Security-Policy: frame-ancestors *` so any origin may iframe it. To restrict to specific partner sites later, edit `next.config.ts` and change the header to `frame-ancestors 'self' https://partner.example.com`.

## 7. Verify the embed page

- [ ] Visit `https://digitalalchemy.dev/embed/<slug>` directly in a browser — you should see ONLY the booking flow, no navbar, no footer, no grain, no Convai widget
- [ ] Open DevTools → Network → check response headers on the HTML document — `Content-Security-Policy: frame-ancestors *`, no `X-Frame-Options: DENY`
- [ ] Drop the iframe snippet above into a free Glitch/CodePen page and confirm it loads without a browser console error about "refused to display"

## Troubleshooting

- **Cron runs but sends nothing** — check the response JSON's `attempted` count. If `0`, no bookings are inside the window. The windows are intentionally wide (23–25h, 30–90min) to absorb missed ticks, but `start_time` still has to fall inside. Double-check the booking's `start_time` vs `now()` in Supabase.
- **"unauthorized" from curl** — `CRON_SECRET` is unset in Vercel, or the `Authorization: Bearer ...` header doesn't match exactly. The endpoint uses timing-safe comparison.
- **Embed iframe shows navbar/footer** — the `ChromeHider` `<style>` selector drift. Check that `src/components/layout/Navbar.tsx` still renders inside a `<header>` and Footer is still a `<footer>` — selectors are `header:has(nav)` and `footer`.
- **Embed iframe is blank (CSP refused)** — confirm the `/embed/:path*` headers rule in `next.config.ts` is BEFORE or instead of the default `X-Frame-Options: DENY` rule. The default source now uses a negative lookahead `/((?!embed).*)` so it shouldn't match `/embed/*`. If it does, check the deployed version actually picked up the new config.
- **Reminder sent but column not marked** — the email succeeded but the UPDATE failed. Check Supabase logs for the service-role write. The booking will get a duplicate reminder on the next cron tick.

---

# Telegram booking alerts (optional)

Get a push notification on your phone the moment someone books, cancels,
or 15 minutes before any booking starts. Free, no SMS provider needed —
uses a personal Telegram bot you create with @BotFather.

If the env vars below are unset, the booking flow silently skips Telegram
(you'll see `[telegram] skipping alert — ... not set` in Vercel logs).

## 1. Create the bot

1. Open Telegram, search for **@BotFather**, start a chat
2. Send `/newbot`
3. Pick a name (display name — e.g. `DA Bookings`)
4. Pick a username (must end in `bot` — e.g. `dadigitalalchemybot`)
5. BotFather replies with a token like `1234567890:AAH-xxxxxxxxxxxxxxxxxx`
6. Save the token — that's `TELEGRAM_BOT_TOKEN`

## 2. Run the migration

In Supabase SQL Editor, run:

```bash
supabase/migrations/20260512_admin_15m_reminder.sql
```

Adds the `admin_reminder_15m_sent_at` column + index so the 15-min admin
reminder doesn't double-fire. Idempotent — safe to re-run.

## 3. Get your chat ID

The bot only knows about chats AFTER you've messaged it once.

1. Open your new bot's chat in Telegram (search the username from step 1)
2. Send any message ("hi")
3. Put the token in `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:AAH-xxxxxxxxxxxxxxxxxx
   ```
4. Run the chat ID fetcher:
   ```bash
   npx tsx --env-file=.env.local scripts/telegram-setup.ts
   ```
5. The script prints every chat your bot has seen. Copy your numeric chat ID
6. Paste into `.env.local`:
   ```
   TELEGRAM_CHAT_ID=987654321
   ```

## 4. Add to Vercel

In Vercel → Project Settings → Environment Variables, add both for
**Production** (and Preview if you want preview deploys to alert too):

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Redeploy.

## 5. Verify

Make a test booking on `/book/<slug>` (use a 5-min event type with
`min_notice_hours=0` if needed). Within a few seconds you should get a
Telegram message:

```
NEW BOOKING
Test Name — Discovery Call
Mon May 12, 5:00 PM CT
test@example.com
View in admin → ...
```

Then cancel via the invitee email link → second message:

```
CANCELLED (by invitee)
Test Name — Discovery Call
Was: Mon May 12, 5:00 PM CT
```

To verify the 15-min reminder, book a slot ~20 min from now. The next
cron tick (within 15 min) should send:

```
STARTING IN ~15 MIN
Test Name — Discovery Call
Mon May 12, 5:00 PM CT
test@example.com
Join Google Meet → ...
```

## Troubleshooting

- **`scripts/telegram-setup.ts` prints "no chats yet"** — you skipped step 3.2. Open the bot in Telegram and send any message, then re-run.
- **Bookings save but no Telegram message** — check Vercel logs for `[telegram] skipping alert` or `[telegram] sendMessage` errors. Most common: chat ID was pasted with a leading minus sign (group chats use negative IDs but your personal chat is positive), or the bot was blocked from your account.
- **15-min reminder fires more than once** — the column update probably failed; check Supabase logs for the service-role write on `scheduling_bookings.admin_reminder_15m_sent_at`.
- **Reminder fires for past bookings** — the cron window is `now + 7m` to `now + 23m`. If your bookings have wrong timezones in `start_time`, they could land outside this window. Sanity-check `start_time` is a UTC ISO string.
