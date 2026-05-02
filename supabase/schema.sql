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
-- search_path is pinned to empty: only references `new` (trigger pseudo-record)
-- and `now()` (lives in pg_catalog, always implicitly searched). Pinning
-- prevents schema-shadowing attacks flagged by Supabase Security Advisor.
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

-- Explicit deny-all on post_views so the Security Advisor stops flagging
-- "RLS enabled, no policies." Service-role bypasses RLS, so server code
-- (which is the only writer/reader anyway) is unaffected.
drop policy if exists "no public access to post_views" on public.post_views;
create policy "no public access to post_views" on public.post_views
  for all to anon, authenticated
  using (false) with check (false);

-- Same deny-all pattern for subscribers. All subscribe/confirm/unsubscribe
-- operations go through server routes using service_role, which bypasses RLS.
drop policy if exists "no public access to subscribers" on public.subscribers;
create policy "no public access to subscribers" on public.subscribers
  for all to anon, authenticated
  using (false) with check (false);

-- =========================================================================
-- SCHEDULING (Phase 1) — event types, availability, bookings, oauth tokens
-- =========================================================================

create table if not exists public.scheduling_event_types (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text unique not null,
  title                  text not null,
  description            text not null,
  duration_minutes       integer not null check (duration_minutes > 0),
  color                  text not null default '#6366f1',
  location_type          text not null default 'google_meet'
                           check (location_type in ('google_meet','zoom','phone','in_person','custom')),
  location_details       text,
  price_cents            integer not null default 0,
  currency               text not null default 'usd',
  buffer_before_minutes  integer not null default 0,
  buffer_after_minutes   integer not null default 0,
  min_notice_hours       integer not null default 4,
  max_per_day            integer,
  max_advance_days       integer not null default 60,
  status                 text not null default 'active'
                           check (status in ('active','inactive')),
  custom_questions       jsonb not null default '[]'::jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists scheduling_event_types_status_idx
  on public.scheduling_event_types(status);

create table if not exists public.scheduling_availability_rules (
  id            uuid primary key default gen_random_uuid(),
  day_of_week   smallint not null check (day_of_week between 0 and 6),
  start_time    time not null,
  end_time      time not null check (end_time > start_time),
  timezone      text not null default 'America/Chicago',
  created_at    timestamptz not null default now()
);
create index if not exists scheduling_availability_rules_day_idx
  on public.scheduling_availability_rules(day_of_week);

create table if not exists public.scheduling_bookings (
  id                        uuid primary key default gen_random_uuid(),
  event_type_id             uuid not null references public.scheduling_event_types(id) on delete restrict,
  invitee_name              text not null,
  invitee_email             text not null,
  invitee_notes             text,
  custom_answers            jsonb not null default '{}'::jsonb,
  start_time                timestamptz not null,
  end_time                  timestamptz not null,
  timezone                  text not null,
  status                    text not null default 'confirmed'
                              check (status in ('confirmed','cancelled','rescheduled','completed','no_show')),
  cancel_token              text not null default gen_random_uuid()::text,
  reschedule_token          text not null default gen_random_uuid()::text,
  cancellation_reason       text,
  cancelled_at              timestamptz,
  google_calendar_event_id  text,
  google_meet_url           text,
  stripe_payment_intent_id  text,
  amount_paid_cents         integer,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index if not exists scheduling_bookings_event_start_idx
  on public.scheduling_bookings(event_type_id, start_time);
create index if not exists scheduling_bookings_email_idx
  on public.scheduling_bookings(invitee_email);
create index if not exists scheduling_bookings_status_start_idx
  on public.scheduling_bookings(status, start_time);

create table if not exists public.scheduling_google_oauth_tokens (
  id             uuid primary key default gen_random_uuid(),
  admin_email    text unique not null,
  access_token   text not null,
  refresh_token  text not null,
  expires_at     timestamptz not null,
  scope          text not null,
  calendar_id    text default 'primary',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists scheduling_event_types_set_updated_at on public.scheduling_event_types;
create trigger scheduling_event_types_set_updated_at
  before update on public.scheduling_event_types
  for each row execute function public.set_updated_at();

drop trigger if exists scheduling_bookings_set_updated_at on public.scheduling_bookings;
create trigger scheduling_bookings_set_updated_at
  before update on public.scheduling_bookings
  for each row execute function public.set_updated_at();

drop trigger if exists scheduling_google_oauth_tokens_set_updated_at on public.scheduling_google_oauth_tokens;
create trigger scheduling_google_oauth_tokens_set_updated_at
  before update on public.scheduling_google_oauth_tokens
  for each row execute function public.set_updated_at();

alter table public.scheduling_event_types        enable row level security;
alter table public.scheduling_availability_rules enable row level security;
alter table public.scheduling_bookings           enable row level security;
alter table public.scheduling_google_oauth_tokens enable row level security;

drop policy if exists "public read active event types" on public.scheduling_event_types;
create policy "public read active event types" on public.scheduling_event_types
  for select using (status = 'active');

drop policy if exists "no public access to availability_rules" on public.scheduling_availability_rules;
create policy "no public access to availability_rules" on public.scheduling_availability_rules
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "no public access to scheduling_bookings" on public.scheduling_bookings;
create policy "no public access to scheduling_bookings" on public.scheduling_bookings
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "no public access to oauth tokens" on public.scheduling_google_oauth_tokens;
create policy "no public access to oauth tokens" on public.scheduling_google_oauth_tokens
  for all to anon, authenticated using (false) with check (false);

revoke all on public.scheduling_event_types         from anon, authenticated;
revoke all on public.scheduling_availability_rules  from anon, authenticated;
revoke all on public.scheduling_bookings            from anon, authenticated;
revoke all on public.scheduling_google_oauth_tokens from anon, authenticated;
grant select on public.scheduling_event_types to anon, authenticated;

-- =========================================================================
-- EMAIL AUTORESPONDER - subscriber welcome sequence
-- =========================================================================

create table if not exists public.email_sequences (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  name        text not null,
  status      text not null default 'active'
                check (status in ('active','inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.email_sequence_steps (
  id            uuid primary key default gen_random_uuid(),
  sequence_id   uuid not null references public.email_sequences(id) on delete cascade,
  step_order    integer not null check (step_order > 0),
  subject       text not null,
  preview_text  text not null default '',
  body_html     text not null,
  body_text     text not null,
  delay_hours   integer not null default 0 check (delay_hours >= 0),
  created_at    timestamptz not null default now(),
  unique (sequence_id, step_order)
);

create table if not exists public.email_sequence_enrollments (
  id                  uuid primary key default gen_random_uuid(),
  sequence_id         uuid not null references public.email_sequences(id) on delete cascade,
  subscriber_id       uuid not null references public.subscribers(id) on delete cascade,
  current_step_order  integer not null default 1 check (current_step_order > 0),
  next_send_at        timestamptz not null,
  status              text not null default 'active'
                        check (status in ('active','completed','cancelled')),
  last_error          text,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  cancelled_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (sequence_id, subscriber_id)
);

create table if not exists public.email_sequence_sends (
  id                  uuid primary key default gen_random_uuid(),
  enrollment_id       uuid references public.email_sequence_enrollments(id) on delete set null,
  sequence_step_id    uuid references public.email_sequence_steps(id) on delete set null,
  subscriber_id       uuid references public.subscribers(id) on delete set null,
  status              text not null check (status in ('sent','failed','skipped')),
  provider_message_id text,
  error               text,
  sent_at             timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index if not exists email_sequence_enrollments_due_idx
  on public.email_sequence_enrollments(next_send_at)
  where status = 'active';

create index if not exists email_sequence_sends_enrollment_idx
  on public.email_sequence_sends(enrollment_id, sent_at desc);

create unique index if not exists email_sequence_sends_sent_once_idx
  on public.email_sequence_sends(enrollment_id, sequence_step_id)
  where status = 'sent';

drop trigger if exists email_sequences_set_updated_at on public.email_sequences;
create trigger email_sequences_set_updated_at
  before update on public.email_sequences
  for each row execute function public.set_updated_at();

drop trigger if exists email_sequence_enrollments_set_updated_at on public.email_sequence_enrollments;
create trigger email_sequence_enrollments_set_updated_at
  before update on public.email_sequence_enrollments
  for each row execute function public.set_updated_at();

alter table public.email_sequences enable row level security;
alter table public.email_sequence_steps enable row level security;
alter table public.email_sequence_enrollments enable row level security;
alter table public.email_sequence_sends enable row level security;

drop policy if exists "no public access to email_sequences" on public.email_sequences;
create policy "no public access to email_sequences" on public.email_sequences
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "no public access to email_sequence_steps" on public.email_sequence_steps;
create policy "no public access to email_sequence_steps" on public.email_sequence_steps
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "no public access to email_sequence_enrollments" on public.email_sequence_enrollments;
create policy "no public access to email_sequence_enrollments" on public.email_sequence_enrollments
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "no public access to email_sequence_sends" on public.email_sequence_sends;
create policy "no public access to email_sequence_sends" on public.email_sequence_sends
  for all to anon, authenticated using (false) with check (false);

revoke all on public.email_sequences from anon, authenticated;
revoke all on public.email_sequence_steps from anon, authenticated;
revoke all on public.email_sequence_enrollments from anon, authenticated;
revoke all on public.email_sequence_sends from anon, authenticated;

insert into public.email_sequences (key, name, status)
values ('welcome', 'New subscriber welcome sequence', 'active')
on conflict (key) do update
set name = excluded.name,
    status = excluded.status;

with welcome as (
  select id from public.email_sequences where key = 'welcome'
)
insert into public.email_sequence_steps (
  sequence_id,
  step_order,
  subject,
  preview_text,
  body_html,
  body_text,
  delay_hours
)
select
  welcome.id,
  step.step_order,
  step.subject,
  step.preview_text,
  step.body_html,
  step.body_text,
  step.delay_hours
from welcome
cross join (
  values
    (
      1,
      'Welcome to Digital Alchemy',
      'You are in. Here is the best place to start.',
      '<p>Welcome to Digital Alchemy.</p><p>You are now on the list for practical notes on building with AI, vibe coding, creative systems, and turning those skills into useful projects.</p><p>Start here: <a href="{{siteUrl}}/blog/what-is-vibe-coding">What is vibe coding?</a></p>',
      E'Welcome to Digital Alchemy.\n\nYou are now on the list for practical notes on building with AI, vibe coding, creative systems, and turning those skills into useful projects.\n\nStart here: {{siteUrl}}/blog/what-is-vibe-coding',
      0
    ),
    (
      2,
      'A quick way to think about AI projects',
      'Start with the outcome, then let the toolchain follow.',
      '<p>Quick win: before you open a tool, write one plain sentence that describes the outcome you want.</p><p>Example: "I want a booking page that captures leads, confirms the appointment, and reminds people before the call."</p><p>That sentence becomes the spec. From there, AI can help you turn it into screens, data, and automation without guessing what matters.</p>',
      E'Quick win: before you open a tool, write one plain sentence that describes the outcome you want.\n\nExample: "I want a booking page that captures leads, confirms the appointment, and reminds people before the call."\n\nThat sentence becomes the spec. From there, AI can help you turn it into screens, data, and automation without guessing what matters.',
      48
    ),
    (
      3,
      'What are you building next?',
      'Reply with the project you want to bring to life.',
      '<p>By now you have seen the core idea: use AI like a creative build partner, not just a chatbot.</p><p>If you want a practical next step, reply with the project you want to build or book a call here: <a href="{{siteUrl}}/book">digitalalchemy.dev/book</a>.</p><p>I read the replies, and the best topics usually become future guides.</p>',
      E'By now you have seen the core idea: use AI like a creative build partner, not just a chatbot.\n\nIf you want a practical next step, reply with the project you want to build or book a call here: {{siteUrl}}/book\n\nI read the replies, and the best topics usually become future guides.',
      72
    )
) as step(step_order, subject, preview_text, body_html, body_text, delay_hours)
on conflict (sequence_id, step_order) do update
set subject = excluded.subject,
    preview_text = excluded.preview_text,
    body_html = excluded.body_html,
    body_text = excluded.body_text,
    delay_hours = excluded.delay_hours;
