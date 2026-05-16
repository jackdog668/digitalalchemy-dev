-- Payments Phase 1 — webhook handler error tracking.
-- Idempotent: safe to re-run.
--
-- The webhook route returns 200 to PayPal even when handlers throw (so
-- PayPal doesn't infinite-retry a deterministic bug). That's the right
-- call for delivery, but it means a broken handler can silently eat real
-- events without surfacing in any dashboard.
--
-- These columns let us see at a glance which events had handler failures
-- and how many times we re-tried them when the same event id came in again.

alter table public.payment_webhook_events
  add column if not exists handler_error_count int not null default 0;

alter table public.payment_webhook_events
  add column if not exists handler_error_message text;

-- Partial index for the "show me handler failures" query — only indexes
-- rows that actually had an error, so the index stays tiny.
create index if not exists payment_webhook_events_handler_error_idx
  on public.payment_webhook_events(received_at desc)
  where handler_error_count > 0;
