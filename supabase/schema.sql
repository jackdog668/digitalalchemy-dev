-- Digital Alchemy — Blog + Newsletter schema
-- Run this ONCE in the Supabase SQL editor for a fresh project.
-- All writes go through service_role in server code; RLS is deny-all except
-- for one public SELECT on published posts (belt-and-suspenders).

-- =========================
-- posts
-- =========================
create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text not null,
  content        text not null, -- raw MDX source
  category       text not null,
  tags           text[] not null default '{}',
  cover_image    text,
  author         text not null default 'Desmond Baker Jr',
  status         text not null default 'draft'
                   check (status in ('draft','published','scheduled')),
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts(status, published_at desc);

create index if not exists posts_slug_idx on public.posts(slug);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- =========================
-- subscribers
-- =========================
create table if not exists public.subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique not null,
  confirmed          boolean not null default false,
  confirm_token      text,
  unsubscribe_token  text not null default gen_random_uuid()::text,
  created_at         timestamptz not null default now(),
  confirmed_at       timestamptz
);

create index if not exists subscribers_email_idx on public.subscribers(email);
create index if not exists subscribers_confirmed_idx on public.subscribers(confirmed);

-- =========================
-- post views
-- =========================
create table if not exists public.post_views (
  post_id    uuid not null references public.posts(id) on delete cascade,
  viewed_on  date not null default current_date,
  count      integer not null default 0,
  primary key (post_id, viewed_on)
);

-- =========================
-- RLS
-- =========================
alter table public.posts enable row level security;
alter table public.subscribers enable row level security;
alter table public.post_views enable row level security;

-- Public can read PUBLISHED posts only (service_role bypasses RLS anyway).
drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts" on public.posts
  for select using (status = 'published' and published_at <= now());

-- Everything else: deny-all. Server code uses service_role key.
revoke all on public.posts        from anon, authenticated;
revoke all on public.subscribers  from anon, authenticated;
revoke all on public.post_views   from anon, authenticated;

grant select on public.posts to anon, authenticated;
