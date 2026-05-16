// Client-safe env vars. Only NEXT_PUBLIC_* allowed — Next inlines these at
// build time. Keep in a separate file from server env so client bundles
// don't drag in the server schema.

export const clientEnv = {
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalalchemy.dev",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  // PayPal client_id is safe to expose — the JS SDK needs it in the
  // browser to render Smart Buttons. The SECRET stays server-side.
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
};
