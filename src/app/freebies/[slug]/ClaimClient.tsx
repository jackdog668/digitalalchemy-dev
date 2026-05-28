"use client";

import { useState } from "react";

interface ClaimClientProps {
  freebieSlug: string;
  freebieName: string;
}

export function ClaimClient({ freebieSlug, freebieName }: ClaimClientProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    try {
      const res = await fetch("/api/freebies/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), slug: freebieSlug }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setStatus("sent");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please verify your connection and try again.");
    }
  }

  // --- Success State Delivery Screen (Slick and Premium!) ---
  if (status === "sent") {
    return (
      <div className="text-center py-6 animate-fade-in">
        {/* Onomatopoeia Badge */}
        <div className="inline-block rounded-md border border-[#40FF78]/30 bg-[#40FF78]/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-[#40FF78] uppercase">
          Boom!!! Unlocked
        </div>

        <h3 className="mt-6 text-2xl font-bold font-display text-da-text">
          Your Guide is Ready!
        </h3>
        
        <p className="mt-3 text-sm text-da-muted leading-relaxed max-w-md mx-auto">
          We just fired a copy straight to your inbox at <strong className="text-da-text">{email}</strong> (check your spam/promotions folder if it doesn&apos;t arrive in 2 minutes).
        </p>
        
        <p className="mt-2 text-sm text-da-muted">
          Or cut the waiting and open the visual guide directly:
        </p>

        {/* Dynamic Glowing Download Action Button */}
        <div className="mt-8">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-xl bg-[#40FF78] px-6 py-4 text-sm font-bold text-[#0A0B0D] uppercase tracking-wider transition-all duration-300 hover:bg-[#40FF78]/90 hover:scale-[1.02] shadow-[0_0_30px_rgba(64,255,120,0.3)] hover:shadow-[0_0_40px_rgba(64,255,120,0.55)]"
          >
            Open Visual Guide ↗
          </a>
        </div>
      </div>
    );
  }

  // --- Input Form Screen ---
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
      <div className="relative">
        <input
          type="email"
          required
          disabled={status === "sending"}
          placeholder="Enter your email to claim..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          className="w-full rounded-xl border border-da-border bg-da-surface/60 px-5 py-4 text-sm text-da-text outline-none backdrop-blur-md transition-all placeholder-da-muted focus:border-da-indigo focus:ring-1 focus:ring-da-indigo/30 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-da-indigo py-4 text-sm font-bold text-white uppercase tracking-wider transition-all duration-300 hover:opacity-90 disabled:opacity-50 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
      >
        {status === "sending" ? "Securing access..." : "Get Free Guide ⚗️"}
      </button>

      {msg && (
        <p className="text-xs text-red-400 text-center font-mono" role="alert">
          {msg}
        </p>
      )}
    </form>
  );
}
