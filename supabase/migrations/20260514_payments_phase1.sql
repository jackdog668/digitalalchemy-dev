-- Payments Phase 1 — PayPal checkout for Bootcamp + Portfolio Building.
-- Idempotent: safe to re-run.
--
-- Security posture (per CLAUDE.md non-negotiables):
--   - RLS enabled, deny-all default
--   - REVOKE from public/anon/authenticated; GRANT only to service_role
--   - paypal_capture_id is UNIQUE → idempotent webhook + return-flow inserts
--
-- After running this, the /api/payments/* routes can record captured orders.
-- An admin dashboard to view + mark-fulfilled rides on top in Phase 2.

-- =========================
-- payment_orders
-- =========================
create table if not exists public.payment_orders (
  id                   uuid primary key default gen_random_uuid(),

  -- Product snapshot. Slug is the source-of-truth lookup key; name + amount
  -- are captured at sale time so renames or price changes don't rewrite
  -- historical receipts.
  product_slug         text not null
                         check (product_slug in ('bootcamp', 'portfolio-building')),
  product_name         text not null,
  amount_cents         integer not null check (amount_cents > 0),
  currency             text not null default 'USD',

  -- Buyer identity captured from PayPal payer details. We do NOT trust any
  -- field that came from the client beyond the product_slug.
  customer_email       text not null,
  customer_name        text,

  -- PayPal handles. order_id is the v2 Orders API resource; capture_id is
  -- the actual money-movement event. capture_id is unique → re-running the
  -- capture call or receiving a duplicate webhook becomes a no-op INSERT.
  paypal_order_id      text not null,
  paypal_capture_id    text unique not null,
  paypal_payer_id      text,

  -- Lifecycle. 'created' is reserved for future use (e.g. pending-capture
  -- flows); Phase 1 only writes 'captured' rows from the happy path.
  status               text not null
                         check (status in ('created','captured','refunded','failed')),

  -- Fulfillment is manual in Phase 1. Desi will mark rows fulfilled once
  -- the buyer is added to Skool/cohort. Phase 2 admin UI will write here.
  fulfilled_at         timestamptz,

  -- Raw PayPal capture payload + any side metadata, kept for debugging.
  metadata             jsonb not null default '{}'::jsonb,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists payment_orders_email_idx
  on public.payment_orders(customer_email);
create index if not exists payment_orders_status_idx
  on public.payment_orders(status);
create index if not exists payment_orders_created_idx
  on public.payment_orders(created_at desc);

-- Reuse the shared updated_at trigger if it exists (created in earlier
-- migrations). Wrapped in a do-block so this migration is independently
-- runnable if reapplied out of order.
do $$
begin
  if exists (
    select 1 from pg_proc where proname = 'set_updated_at'
  ) then
    drop trigger if exists payment_orders_set_updated_at on public.payment_orders;
    create trigger payment_orders_set_updated_at
      before update on public.payment_orders
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- RLS deny-all. All access flows through service_role (server-side only).
alter table public.payment_orders enable row level security;

revoke all on public.payment_orders from public;
revoke all on public.payment_orders from anon;
revoke all on public.payment_orders from authenticated;
grant all on public.payment_orders to service_role;

-- =========================
-- payment_webhook_events
-- =========================
-- Webhook deduplication ledger. PayPal can re-deliver events at any time;
-- we log the event_id on first successful processing and reject duplicates.
-- Separate from payment_orders so we can dedup non-capture events too
-- (e.g. refunds, disputes) without bloating the orders table.
create table if not exists public.payment_webhook_events (
  id                   uuid primary key default gen_random_uuid(),
  paypal_event_id      text unique not null,
  event_type           text not null,
  resource_id          text,            -- capture_id, order_id, etc.
  payload              jsonb not null,
  received_at          timestamptz not null default now(),
  processed_at         timestamptz
);

create index if not exists payment_webhook_events_type_idx
  on public.payment_webhook_events(event_type);
create index if not exists payment_webhook_events_received_idx
  on public.payment_webhook_events(received_at desc);

alter table public.payment_webhook_events enable row level security;

revoke all on public.payment_webhook_events from public;
revoke all on public.payment_webhook_events from anon;
revoke all on public.payment_webhook_events from authenticated;
grant all on public.payment_webhook_events to service_role;
