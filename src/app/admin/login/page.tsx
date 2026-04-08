"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

// Magic-link login. Only the ADMIN_EMAIL address can actually get in —
// the middleware enforces that after the callback — but we also pre-check
// here to give a clearer error and reduce noise in the Supabase dashboard.
const ADMIN_EMAIL = "desibaker54@gmail.com";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
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
            Check your inbox. The link expires in 1 hour.
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
