-- New subscriber autoresponder
--
-- Adds a lightweight email sequence system for confirmed newsletter
-- subscribers. The first seeded sequence is a three-email welcome flow.
--
-- Idempotent - safe to re-run.

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
  id                 uuid primary key default gen_random_uuid(),
  enrollment_id      uuid references public.email_sequence_enrollments(id) on delete set null,
  sequence_step_id   uuid references public.email_sequence_steps(id) on delete set null,
  subscriber_id      uuid references public.subscribers(id) on delete set null,
  status             text not null check (status in ('sent','failed','skipped')),
  provider_message_id text,
  error              text,
  sent_at            timestamptz not null default now(),
  created_at         timestamptz not null default now()
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
