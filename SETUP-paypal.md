# PayPal Checkout Setup

Walkthrough for wiring sandbox + live PayPal credentials into this site. After completing the sandbox section, the **Bootcamp ($147)** and **Portfolio Building ($500)** checkout flows work end-to-end.

> Architecture summary: see [supabase/migrations/20260514_payments_phase1.sql](supabase/migrations/20260514_payments_phase1.sql), [src/lib/paypal.ts](src/lib/paypal.ts), [src/lib/payments.ts](src/lib/payments.ts), and the three routes under `src/app/api/payments/`.

---

## 1. Install dependencies

```bash
npm install
```

This pulls in `@paypal/paypal-server-sdk` (held for future use; the current implementation hits the REST API directly via `lib/paypal.ts`) and `@paypal/react-paypal-js` (the Smart Buttons React wrapper).

## 2. Run the migration

The migration creates `payment_orders` and `payment_webhook_events` tables with RLS deny-all and `service_role`-only grants.

```bash
# Apply to local/dev Supabase project
supabase db push

# Or run it directly via psql against your Supabase connection string
psql "$DATABASE_URL" -f supabase/migrations/20260514_payments_phase1.sql
```

Confirm in the Supabase dashboard → Table Editor that both tables exist with RLS enabled.

## 3. Create the sandbox app

1. Go to **developer.paypal.com** and log in with the DB Creations PayPal Business account.
2. **Apps & Credentials** → **Sandbox** tab → **Create App**.
3. Name it `Digital Alchemy Dev`. Pick "Merchant" as the app type.
4. After creation, copy the **Client ID** and **Secret** — you'll paste them in step 5.
5. Scroll down to **Sandbox Account** → create or note a personal (buyer) test account. You'll use this to actually click "Pay $147" in dev.

## 4. Generate a webhook path token

This token lives in the webhook URL so the path itself is unguessable. PayPal still verifies the signature — this is defense in depth.

```bash
# 32 random hex chars
openssl rand -hex 32
```

Copy the output — you'll paste it in step 5.

## 5. Fill `.env.local`

Open `.env.local` and add:

```env
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=<the sandbox client_id from step 3>
PAYPAL_CLIENT_SECRET=<the sandbox secret from step 3>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<same as PAYPAL_CLIENT_ID>
PAYPAL_WEBHOOK_PATH_TOKEN=<the 32-char hex string from step 4>
PAYPAL_WEBHOOK_ID=          # filled in step 6
```

`NEXT_PUBLIC_PAYPAL_CLIENT_ID` is intentionally the same value as `PAYPAL_CLIENT_ID` — the JS SDK needs it in the browser, and per PayPal's docs the client_id is safe to expose (the secret is what stays server-side).

## 6. Register the sandbox webhook

You can't register a webhook URL until you have a public-facing URL for the dev server. Pick one:

**Option A: ngrok (recommended for local dev)**

```bash
ngrok http 3000
# Note the https URL it gives you, e.g. https://ab12cd34.ngrok-free.app
```

**Option B: Deploy to Vercel preview**

Push the branch; use the preview deployment URL.

Then in the PayPal developer dashboard:

1. Sandbox app you created in step 3 → scroll to **Webhooks** → **Add Webhook**.
2. URL: `https://<your-ngrok-or-preview>/api/payments/webhook/<the path token from step 4>`
   Example: `https://ab12cd34.ngrok-free.app/api/payments/webhook/9f3a2b1...etc`
3. Event types — subscribe to **at minimum**:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
4. Save. PayPal hands back a **Webhook ID** — paste it into `.env.local` as `PAYPAL_WEBHOOK_ID`.

Restart the dev server so the new env vars are picked up.

## 7. End-to-end sandbox smoke test

```bash
npm run dev
```

1. Visit `http://localhost:3000/checkout/bootcamp`.
2. Click the blue PayPal button.
3. Log in with your **sandbox buyer** account (NOT your real PayPal account).
4. Approve the $147 payment.
5. You should redirect to `/checkout/success?product=bootcamp&order=...`.
6. Check `payment_orders` in Supabase — there should be a fresh row with `status='captured'`.
7. Check your inbox (the one matching `ADMIN_EMAIL` in `.env.local`) — you should see the admin notification.
8. If `TELEGRAM_BOT_TOKEN` is set, you should also see the Telegram alert.

### Webhook test (independent of return-flow)

In the PayPal developer dashboard → **Webhooks Simulator**:

1. Pick your sandbox app.
2. Choose event type `PAYMENT.CAPTURE.COMPLETED`.
3. Set the webhook URL to your full webhook path (including the token).
4. Send. Confirm:
   - A new row appears in `payment_webhook_events` (status 200 from your server).
   - **No duplicate** row appears in `payment_orders` if the return-flow already recorded it (idempotency on `paypal_capture_id`).

### Failure-mode checks

| Test | Expected |
|---|---|
| Hit `/api/payments/webhook/wrong-token` | 404 |
| POST `/api/payments/create-order` with `{"amount": 1}` extra field | 400 (Zod `.strict()`) |
| POST `/api/payments/create-order` with unknown product_slug | 404 |
| Sandbox decline card | PayPal error UI, no DB row |
| Close PayPal popup mid-flow | redirect to `/checkout/cancel`, no DB row |
| Refund a sandbox payment via the PayPal dashboard | `payment_orders.status` flips to `refunded`, webhook event logged |

## 8. Production cutover — LIVE CHECKLIST

**Do these steps in order. Don't skip ahead. Each one is a separate failure mode.** Most live-payment outages happen because someone half-flipped — live creds in but webhook still pointed at sandbox, or new path token in `.env.local` but old one registered with PayPal. The checkbox order below makes that impossible.

### Phase A — Provision live PayPal app

- [ ] **A1.** developer.paypal.com → top toggle from **Sandbox** to **Live** → **Apps & Credentials** → **Create App** (name it `Digital Alchemy — Production`). Pick "Merchant" app type.
- [ ] **A2.** From the new live app, copy **Client ID** to a scratch buffer (NOT a chat, NOT a doc — your password manager or terminal scrollback).
- [ ] **A3.** Click **Show** next to **Secret**, copy to scratch buffer.

### Phase B — Generate fresh live path token

> ⚠️ **Don't reuse the sandbox `PAYPAL_WEBHOOK_PATH_TOKEN`.** Live and sandbox webhooks must live at different URLs so a sandbox replay can't trigger live processing.

- [ ] **B1.** Generate a fresh 32-byte hex token:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Copy the output to scratch buffer.

### Phase C — Register live webhook

- [ ] **C1.** In the live PayPal app (developer.paypal.com → Live tab → your app) scroll to **Webhooks** → **Add Webhook**.
- [ ] **C2.** URL: `https://digitalalchemy.dev/api/payments/webhook/<the live path token from B1>`
  Double-check: starts with `https://`, the path token matches B1 *exactly*, no trailing slash.
- [ ] **C3.** Event types — subscribe to **exactly these two**:
  - `PAYMENT.CAPTURE.COMPLETED`
  - `PAYMENT.CAPTURE.REFUNDED`
- [ ] **C4.** Save. Copy the **Webhook ID** PayPal shows you to scratch buffer.

### Phase D — Set Vercel env vars (Production only — NOT Preview)

> ⚠️ **Set scope to "Production" for every var.** If you set them on Preview too, every PR preview deploy will be wired to live PayPal — real cards in test pages. Bad.

In Vercel → Project Settings → Environment Variables, add or update:

- [ ] **D1.** `PAYPAL_ENV` = `live` (scope: Production)
- [ ] **D2.** `PAYPAL_CLIENT_ID` = `<live client_id from A2>` (scope: Production)
- [ ] **D3.** `PAYPAL_CLIENT_SECRET` = `<live secret from A3>` (scope: Production)
- [ ] **D4.** `NEXT_PUBLIC_PAYPAL_CLIENT_ID` = `<same value as D2>` (scope: Production)
- [ ] **D5.** `PAYPAL_WEBHOOK_ID` = `<webhook id from C4>` (scope: Production)
- [ ] **D6.** `PAYPAL_WEBHOOK_PATH_TOKEN` = `<live token from B1>` (scope: Production)

### Phase E — Deploy + smoke test

- [ ] **E1.** Redeploy production (Vercel dashboard → Deployments → ... → Redeploy, or push an empty commit).
- [ ] **E2.** Wait for green checkmark. Hit `https://digitalalchemy.dev/checkout/bootcamp` — page should render. Open DevTools → Network → filter "paypal". Confirm the SDK request includes `env=live` in the URL (not `env=sandbox`).
- [ ] **E3.** **Real-money smoke test.** Buy the Bootcamp at $147 from a real PayPal account (or a real credit card via the guest checkout). Approve.
- [ ] **E4.** Confirm:
  - Browser lands on `/checkout/success?product=bootcamp&order=...`
  - Resend sends the buyer a receipt (check inbox)
  - You get the admin email + Telegram ping
  - Supabase `payment_orders` row shows `status='captured'` with the live capture_id
- [ ] **E5.** **Immediate refund.** developer.paypal.com → Activity → find the transaction → Refund. (Or use the merchant dashboard at paypal.com if Activity is sparse.)
- [ ] **E6.** Confirm the refund webhook fires:
  - New row in `payment_webhook_events` with `event_type='PAYMENT.CAPTURE.REFUNDED'`
  - `payment_orders.status` flips to `'refunded'`
  - If neither happened, your webhook isn't actually wired — go back to C2 and verify the URL matches what's in `PAYPAL_WEBHOOK_PATH_TOKEN`.

### Phase F — Lockdown after green

- [ ] **F1.** Scrub the scratch buffer (clear terminal scrollback / password manager note).
- [ ] **F2.** In Vercel → Project Settings → Environment Variables, verify the 6 PayPal vars are **Production-only**. Toggle off Preview/Development if accidentally set.
- [ ] **F3.** **Do NOT** delete the sandbox env vars from `.env.local`. Keep them so you can keep testing on localhost without touching live.

### If anything in Phase E fails

- **`PAYPAL_ENV=live` but SDK loads with `env=sandbox`** → Vercel cache. Force a hard refresh (Ctrl+Shift+R) or wait for CDN propagation (~30s).
- **401 on token fetch** → live client_id/secret mismatch. Re-copy from PayPal dashboard. Did you accidentally paste the sandbox client_id into the live var?
- **Webhook never fires after capture** → URL token mismatch. The token in your Vercel env MUST exactly equal the token in the PayPal-registered URL. One char off = 404.
- **Webhook fires but signature verification fails** → `PAYPAL_WEBHOOK_ID` is the sandbox webhook id, not the live one. Update D5 with the value from C4.

## 9. Manual fulfillment workflow

Phase 1 ships with **manual fulfillment** by design. When you get a `💰 PAYMENT` Telegram ping or admin email:

1. Pull up the order email — it has the buyer name, email, product, and PayPal capture ID.
2. Add the buyer to Skool (Bootcamp) or send the Portfolio Building scheduling link.
3. Optionally: mark the row fulfilled in Supabase manually (`update payment_orders set fulfilled_at = now() where id = '...'`). A real admin UI for this lands in Phase 2.

---

## 10. Webhook dedup replay test

Before flipping to live, confirm the dedup ledger actually blocks PayPal replays. The script `scripts/test-paypal-webhook-replay.ts` POSTs a captured sandbox webhook payload twice and asserts the second response is `{ ok: true, dedup: "replay" }`.

### Setup

1. Grab a real sandbox event payload + headers from PayPal's webhook simulator (developer.paypal.com → Webhooks Simulator → `PAYMENT.CAPTURE.COMPLETED` → send to your dev URL → inspect the incoming request).
2. Save the payload + headers as `scripts/test-webhook-fixture.json` (already gitignored). Shape:

   ```json
   {
     "body": {
       "id": "WH-EVENT-ID-FROM-SANDBOX",
       "event_type": "PAYMENT.CAPTURE.COMPLETED",
       "resource": {
         "id": "CAPTURE-ID-FROM-SANDBOX",
         "custom_id": "bootcamp",
         "amount": { "value": "147.00", "currency_code": "USD" }
       }
     },
     "headers": {
       "PAYPAL-AUTH-ALGO": "...",
       "PAYPAL-CERT-URL": "...",
       "PAYPAL-TRANSMISSION-ID": "...",
       "PAYPAL-TRANSMISSION-SIG": "...",
       "PAYPAL-TRANSMISSION-TIME": "..."
     }
   }
   ```

### Run

```powershell
# Terminal 1
npm run dev
# Terminal 2
npx tsx --env-file=.env.local scripts/test-paypal-webhook-replay.ts
```

Expected output:

```
✓ First POST recorded as fresh event
✓ Second POST short-circuited via dedup ledger
✓ Ledger has exactly 1 row for event_id (UNIQUE constraint held)

All checks passed.
```

If the first POST returns 401, the signature verification rejected the request — either capture real PayPal sig headers OR temporarily comment out the verify block for local-only testing (never deploy that commented out).

---

## 11. Sandbox → Live Cutover Checklist

Run after the security hardening PR is merged. Every checkbox is a hard gate.

### Pre-flip (sandbox)

- [ ] `/api/health` returns `paypalEnv: "sandbox"` in prod
- [ ] Supabase project is on Pro tier (auto backups) OR weekly `pg_dump` cron is set
- [ ] Trigger an uncaught error in a page → global error boundary renders, not white screen
- [ ] If `SENTRY_DSN` set: error appears in Sentry within 30s
- [ ] Replay test (section 10) passes
- [ ] Force an amount mismatch (temporarily edit `capture/route.ts:97` → wrong expected amount → redeploy → try to buy):
  - 500 to client
  - Telegram `🚨 PAYMENTS SECURITY` alert
  - Sentry event tagged `area=payments, kind=amount-mismatch` (if DSN set)
  - **Revert before continuing.**
- [ ] After a sandbox success: `select id, product_slug, amount_cents, status, paypal_capture_id from payment_orders order by created_at desc limit 1;` matches the PayPal dashboard
- [ ] Tamper test 1: DevTools intercept `/api/payments/create-order` body → add `amount_cents: 1` → 400
- [ ] Tamper test 2: `curl https://digitalalchemy.dev/api/payments/webhook/wrongtoken` → 404
- [ ] Tamper test 3: `curl -X POST -d '{}' https://digitalalchemy.dev/api/payments/webhook/<correct>` → 401
- [ ] Tamper test 4: 4 rapid `/api/payments/create-order` calls → 4th returns 429

### The flip

- [ ] Generate NEW path token: `openssl rand -hex 32`. **Do not reuse sandbox token.**
- [ ] PayPal live dashboard → create webhook at `https://digitalalchemy.dev/api/payments/webhook/<new-hex>`. Subscribe to `PAYMENT.CAPTURE.COMPLETED` + `PAYMENT.CAPTURE.REFUNDED` only.
- [ ] Copy live webhook ID.
- [ ] Vercel **Production** env (not preview):
  - `PAYPAL_ENV=live`
  - `PAYPAL_CLIENT_ID` (live)
  - `PAYPAL_CLIENT_SECRET` (live)
  - `PAYPAL_WEBHOOK_ID` (live)
  - `PAYPAL_WEBHOOK_PATH_TOKEN` (new hex)
  - `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (live)
- [ ] Redeploy
- [ ] `/api/health` echoes `paypalEnv: "live"`
- [ ] `/checkout/portfolio-building` → PayPal popup shows LIVE branding

### First real charge

- [ ] Buy `portfolio-building` ($297) yourself. Confirm all five:
  - [ ] PayPal email receipt from `service@paypal.com`
  - [ ] Resend buyer receipt
  - [ ] Resend admin email
  - [ ] Telegram `💰 PAYMENT`
  - [ ] `payment_orders` row with correct amount, your email, status `captured`
- [ ] Refund yourself in PayPal dashboard. Confirm:
  - [ ] `PAYMENT.CAPTURE.REFUNDED` row in `payment_webhook_events`
  - [ ] `payment_orders.status` flips to `refunded`

Both happy path + refund verified → cutover complete.

---

## Files this setup touches

- [package.json](package.json) — adds `@paypal/paypal-server-sdk` and `@paypal/react-paypal-js`
- [.env.example](.env.example) — documents the six PayPal env vars
- [src/lib/env.ts](src/lib/env.ts) — Zod schema + `requirePayPal()` / `requirePayPalWebhook()` / `verifyPayPalPathToken()`
- [src/lib/paypal.ts](src/lib/paypal.ts) — PRODUCTS allowlist + REST client + webhook signature verification
- [src/lib/payments.ts](src/lib/payments.ts) — `recordCapturedOrder()`, `markOrderRefunded()`, `recordWebhookEvent()`, `notifyCapturedOrder()`
- [src/lib/email/templates/payment-receipt.ts](src/lib/email/templates/payment-receipt.ts) — buyer + admin email templates
- [src/app/api/payments/create-order/route.ts](src/app/api/payments/create-order/route.ts)
- [src/app/api/payments/capture/route.ts](src/app/api/payments/capture/route.ts)
- [src/app/api/payments/webhook/[token]/route.ts](src/app/api/payments/webhook/[token]/route.ts)
- [src/app/checkout/[product]/page.tsx](src/app/checkout/[product]/page.tsx) — server-rendered checkout shell
- [src/app/checkout/[product]/CheckoutClient.tsx](src/app/checkout/[product]/CheckoutClient.tsx) — PayPal Smart Buttons
- [src/app/checkout/success/page.tsx](src/app/checkout/success/page.tsx)
- [src/app/checkout/cancel/page.tsx](src/app/checkout/cancel/page.tsx)
- [supabase/migrations/20260514_payments_phase1.sql](supabase/migrations/20260514_payments_phase1.sql)
