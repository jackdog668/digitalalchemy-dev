-- Security Advisor fix: public.subscribers had RLS enabled with no policies.
-- Same deny-all pattern as post_views. Idempotent — safe to re-run.
-- Service-role bypasses RLS, so /api/subscribe and admin code are unaffected.

drop policy if exists "no public access to subscribers" on public.subscribers;
create policy "no public access to subscribers" on public.subscribers
  for all to anon, authenticated
  using (false) with check (false);
