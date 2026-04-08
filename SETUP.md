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

## 4. Start the site

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
