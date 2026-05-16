-- Index gaps spotted during the whole-site security/perf audit (2026-05-15).
-- Idempotent: every statement uses IF NOT EXISTS so re-running is a no-op.
--
-- These tables (subscribers, posts) predate the migrations folder — they
-- were created in the Supabase dashboard before we adopted SQL migrations.
-- Adding indexes here doesn't require knowing the original schema; the
-- columns we're indexing are read in `src/lib/email/send-new-post.ts`
-- and `src/app/admin/page.tsx` and will exist on any production schema.

-- 1) subscribers.confirmed
-- Filter on every newsletter fan-out (`select ... where confirmed = true`).
-- Without this index, every fan-out scans the whole table. Partial index
-- on `confirmed = true` keeps it tiny (only confirmed rows are indexed).
create index if not exists subscribers_confirmed_idx
  on public.subscribers(created_at desc)
  where confirmed = true;

-- 2) posts.updated_at
-- Admin posts list orders by `updated_at desc`. As soon as the table grows
-- past a few hundred rows the missing index turns a sub-ms query into a
-- sort+scan. Cheap to add now.
create index if not exists posts_updated_at_idx
  on public.posts(updated_at desc);

-- 3) posts.status, posts.category
-- Filtering blog index pages and admin category views. Composite index
-- ordered status -> category -> updated_at to support both single-filter
-- and combined queries.
create index if not exists posts_status_category_idx
  on public.posts(status, category, updated_at desc);
