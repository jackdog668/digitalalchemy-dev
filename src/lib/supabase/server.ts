import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabase } from "@/lib/env";

// Service-role client — bypasses RLS. NEVER import from client components.
// Use for admin mutations, migration scripts, privileged reads.
export function createServiceRoleClient() {
  const { url, serviceRoleKey } = requireSupabase();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Server-side Supabase client bound to the current request's cookies —
// used for session reads inside server components / server actions / route
// handlers. Respects RLS.
export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabase();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `set` is only available in Server Actions / Route Handlers.
          // Safe to ignore in server components.
        }
      },
    },
  });
}
