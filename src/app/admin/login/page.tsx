"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { clientEnv } from "@/lib/env-client";

// Magic-link login. Only the ADMIN_EMAIL address can actually get in —
// the middleware enforces that after the callback — but we also pre-check
// here to give a clearer error and reduce noise in the Supabase dashboard.
// NEXT_PUBLIC_ADMIN_EMAIL is inlined at build time; must match the
// server-side ADMIN_EMAIL or legit admins get rejected here.
const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "desibaker54@gmail.com"
).toLowerCase();

// Map ?error=<code> from the callback into a human sentence so failures
// after the email round-trip don't look like a silent loop.
function errorMessageFor(code: string | null): string {
  switch (code) {
    case "unauthorized":
      return "That email isn't authorized for admin access.";
    case "callback_failed":
      return "Magic link expired or already used. Request a new one.";
    case "missing_code":
      return "Magic link was malformed. Request a new one.";
    default:
      return "";
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  // Only honor internal paths to avoid open-redirect; falls back to /admin.
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/admin";
  const initialErrorMsg = errorMessageFor(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    initialErrorMsg ? "error" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState(initialErrorMsg);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setStatus("error");
      setErrorMsg("This email is not authorized.");
      return;
    }

    setStatus("sending");
    try {
      const supabase = createSupabaseBrowserClient();
      // Always build the callback off the configured site URL so cookies
      // get set on the right host (apex), regardless of where login was
      // opened from. Falls back to current origin if the env var is empty.
      const redirectBase =
        clientEnv.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const callback = new URL(`${redirectBase}/admin/auth/callback`);
      callback.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: callback.toString(),
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-da-border bg-da-surface p-8 shadow-[0_0_60px_rgba(99,102,241,0.08)]">
        <h1 className="font-display text-2xl font-bold">Admin Login</h1>
        <p className="mt-2 text-sm text-da-muted">
          Enter your admin email — we&apos;ll send you a magic sign-in link.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-lg border border-da-indigo/30 bg-da-indigo/5 p-4 text-sm">
            Check your inbox. The link expires in 1 hour. Open it on the
            same device you want to be signed in on.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-da-border bg-da-dark px-4 py-3 text-da-text outline-none focus:border-da-indigo"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-da-indigo px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send magic link"}
            </button>
            {errorMsg && (
              <p className="text-sm text-red-400" role="alert">
                {errorMsg}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
