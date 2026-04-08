-- Phase 4 — Reminder email tracking
--
-- Adds two nullable timestamps to scheduling_bookings so the reminder cron
-- can mark which reminders have already been sent and never double-send.
-- Plus a partial index to make the "find upcoming bookings needing a
-- reminder" query fast even as the table grows.
--
-- Idempotent — safe to re-run.

alter table public.scheduling_bookings
  add column if not exists reminder_24h_sent_at timestamptz,
  add column if not exists reminder_1h_sent_at  timestamptz;

-- Partial index: only rows still eligible for a reminder. Cron runs every
-- 15 min and this index keeps it O(matches), not O(table size).
create index if not exists scheduling_bookings_reminder_24h_pending_idx
  on public.scheduling_bookings(start_time)
  where status = 'confirmed' and reminder_24h_sent_at is null;

create index if not exists scheduling_bookings_reminder_1h_pending_idx
  on public.scheduling_bookings(start_time)
  where status = 'confirmed' and reminder_1h_sent_at is null;
