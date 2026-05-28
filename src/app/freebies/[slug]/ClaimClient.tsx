"use client";

import { useState } from "react";
import posthog from "posthog-js";

interface ClaimClientProps {
  freebieSlug: string;
  freebieName: string;
}

export function ClaimClient({ freebieSlug, freebieName }: ClaimClientProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const triggerDownload = async () => {
    try {
      // Telemetry: track direct file download clicked
      posthog.capture("freebie_download_clicked", { slug: freebieSlug });

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${freebieSlug}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      posthog.capture("freebie_download_success", { slug: freebieSlug });
    } catch {
      window.open(downloadUrl, "_blank");
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    const trimmedEmail = email.trim();
    try {
      const res = await fetch("/api/freebies/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          slug: freebieSlug,
          websiteUrl: honeypot // honeymoon trap for bots
        }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setSubmittedEmail(trimmedEmail);
        setStatus("sent");
        setEmail("");

        // Telemetry: capture successful human conversion lead capture
        if (!honeypot) {
          posthog.capture("freebie_claim_success", { 
            slug: freebieSlug, 
            email: trimmedEmail 
          });
        }
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
          We just fired a copy straight to your inbox at <strong className="text-da-text">{submittedEmail}</strong> (check your spam/promotions folder if it doesn&apos;t arrive in 2 minutes).
        </p>
        
        <p className="mt-4 text-sm text-da-muted">
          Or cut the waiting and download the visual guide file directly:
        </p>

        {/* Dynamic Glowing Download Action Button */}
        <div className="mt-6">
          <button
            onClick={triggerDownload}
            className="inline-block w-full rounded-xl bg-[#40FF78] px-6 py-4 text-sm font-bold text-[#0A0B0D] uppercase tracking-wider transition-all duration-300 hover:bg-[#40FF78]/90 hover:scale-[1.02] shadow-[0_0_30px_rgba(64,255,120,0.3)] hover:shadow-[0_0_40px_rgba(64,255,120,0.55)] cursor-pointer"
          >
            Download Visual Guide ↓
          </button>
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

        {/* Honeypot field - completely invisible to humans, irresistible trap to spam bots */}
        <div className="absolute opacity-0 -z-10 w-0 h-0 overflow-hidden" aria-hidden="true">
          <input
            type="text"
            name="website_url"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
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
