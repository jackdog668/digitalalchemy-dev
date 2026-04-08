-- Scheduling Phase 1 — event types, availability rules, bookings, oauth tokens
-- Idempotent: safe to re-run. Reuses public.set_updated_at() from the blog migration.
--
-- After running this, the admin can create event types and set weekly availability
-- via /admin/scheduling. Public booking pages arrive in Phase 2.

-- =========================
-- scheduling_event_types
-- =========================
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

-- =========================
-- scheduling_availability_rules
-- =========================
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

-- =========================
-- scheduling_bookings
-- =========================
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

-- =========================
-- scheduling_google_oauth_tokens
-- =========================
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

-- =========================
-- Triggers (reuses public.set_updated_at())
-- =========================
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

-- =========================
-- RLS
-- =========================
alter table public.scheduling_event_types        enable row level security;
alter table public.scheduling_availability_rules enable row level security;
alter table public.scheduling_bookings           enable row level security;
alter table public.scheduling_google_oauth_tokens enable row level security;

-- Public can read active event types (so /book/[slug] renders in Phase 2).
drop policy if exists "public read active event types" on public.scheduling_event_types;
create policy "public read active event types" on public.scheduling_event_types
  for select using (status = 'active');

-- Everything else: explicit deny-all (service-role bypasses).
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
