-- Adds a per-booking timestamp column tracking when the 15-min-before
-- admin Telegram reminder fired, so the cron tick doesn't double-fire.
-- Mirrors the existing reminder_24h_sent_at / reminder_1h_sent_at columns
-- added in 20260408_scheduling_phase4_reminders.sql.

ALTER TABLE scheduling_bookings
  ADD COLUMN IF NOT EXISTS admin_reminder_15m_sent_at timestamptz;

-- Partial index for the cron's hot path: it only ever needs confirmed
-- bookings whose admin reminder has not yet fired.
CREATE INDEX IF NOT EXISTS idx_scheduling_bookings_admin_reminder_15m
  ON scheduling_bookings (start_time)
  WHERE admin_reminder_15m_sent_at IS NULL AND status = 'confirmed';
