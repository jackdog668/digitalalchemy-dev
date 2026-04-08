"use client";

import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env-client";

// Browser Supabase client — anon key only. Used for magic-link sign-in.
// All other reads/writes go through server code.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
