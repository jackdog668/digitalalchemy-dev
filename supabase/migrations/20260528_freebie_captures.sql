-- Create table for logging freebie lead email captures
create table if not exists public.freebie_captures (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  freebie_slug text not null,
  created_at   timestamptz not null default now()
);

-- Indexing for lightning-fast queries
create index if not exists freebie_captures_email_idx on public.freebie_captures(email);
create index if not exists freebie_captures_slug_idx on public.freebie_captures(freebie_slug);

-- Enable Row Level Security (RLS) to lock public API access
alter table public.freebie_captures enable row level security;

-- Default deny-all policy for public/anon/authenticated roles (service_role bypasses RLS)
drop policy if exists "no public access to freebie_captures" on public.freebie_captures;
create policy "no public access to freebie_captures" on public.freebie_captures
  for all to anon, authenticated using (false) with check (false);

-- Revoke all permissions from public roles
revoke all on public.freebie_captures from anon, authenticated;
