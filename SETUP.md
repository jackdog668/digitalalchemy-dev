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
