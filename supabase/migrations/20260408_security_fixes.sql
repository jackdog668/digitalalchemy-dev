-- Security Advisor fixes (2026-04-08)
-- Idempotent — safe to re-run.
--
-- 1) Pin search_path on set_updated_at()
--    Prevents schema-shadowing attacks where an attacker creates objects in
--    an earlier schema to hijack identifier resolution inside the function.
--
-- 2) Add explicit deny-all policy on post_views
--    RLS was enabled with no policies, which is implicitly deny-all but the
--    Security Advisor flags it as ambiguous. Explicit policy makes intent clear.
--    Service-role bypasses RLS, so server code is unaffected.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "no public access to post_views" on public.post_views;
create policy "no public access to post_views" on public.post_views
  for all to anon, authenticated
  using (false) with check (false);
