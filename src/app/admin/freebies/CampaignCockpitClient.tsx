"use client";

import { useState, useEffect } from "react";
import { listFreebies, type FreebieProduct } from "@/lib/freebies";

interface CampaignCockpitClientProps {
  activeCatalog: readonly FreebieProduct[];
}

export default function CampaignCockpitClient({ activeCatalog }: CampaignCockpitClientProps) {
  const [subject, setSubject] = useState("Guide: How to purchase your first domain");
  const [bodyHtml, setBodyHtml] = useState(
    "Hey {{first_name}},\n\n" +
    "Thanks for claiming your copy of the visual guide! As promised, here is your direct unlocked copy:\n\n" +
    "{{download_url}}\n\n" +
    "In this interactive handbook, we break down registrars, explain how to wire A records and CNAMEs, and get your custom site ready to deploy in under 5 minutes.\n\n" +
    "If you ever hit a block while building or coding, just reply straight to this email—I personally read and answer every message.\n\n" +
    "Let's cook!\n\n" +
    "Desi\nDigital Alchemy Academy"
  );
  const [testEmail, setTestEmail] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Quick Merge Tag Inserter
  const insertTag = (tag: string) => {
    const textarea = document.getElementById("email-body-input") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const updated = val.substring(0, start) + tag + val.substring(end);
    setBodyHtml(updated);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  // Compile Merge Tags for Live Sandbox Preview
  const compileLivePreview = (text: string) => {
    const mockFirstName = "Alchemist";
    const mockEmail = "subscriber@example.com";
    const mockDownload = "https://digitalalchemy.dev/downloads/domain-purchase-guide.html";
    const mockUnsubscribe = "https://digitalalchemy.dev/unsubscribe?email=subscriber%40example.com";
    const mockSite = "https://digitalalchemy.dev";

    const substituted = text
      .replace(/\{\{email\}\}/g, mockEmail)
      .replace(/\{\{first_name\}\}/g, mockFirstName)
      .replace(/\{\{download_url\}\}/g, mockDownload)
      .replace(/\{\{unsubscribe_url\}\}/g, mockUnsubscribe)
      .replace(/\{\{site_url\}\}/g, mockSite);

    // Convert line breaks to paragraphs/breaks
    return substituted
      .split(/\n{2,}/)
      .map((p, idx) => {
        const trimmed = p.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          return `<div key=${idx} style="margin: 20px 0; text-align: center;"><a href="${trimmed}" target="_blank" style="background: #6366f1; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">Open Visual Guide ↗</a></div>`;
        }
        return `<p key=${idx} style="margin: 0 0 16px 0; line-height: 1.6; color: #94a3b8; font-size: 15px;">${trimmed.replace(/\n/g, "<br />")}</p>`;
      })
      .join("");
  };

  const previewSubject = subject
    .replace(/\{\{email\}\}/g, "subscriber@example.com")
    .replace(/\{\{first_name\}\}/g, "Alchemist");

  // Send Test Preview
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      setStatus({ type: "error", message: "Please enter a test email address first." });
      return;
    }
    setTestLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/freebies/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          bodyHtml,
          testEmail,
          freebieSlug: audienceFilter !== "all" ? audienceFilter : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email");

      setStatus({ type: "success", message: `Test preview successfully sent to ${testEmail}!` });
    } catch (err) {
      setStatus({ type: "error", message: (err as Error).message });
    } finally {
      setTestLoading(false);
    }
  };

  // Launch Bulk Broadcast
  const handleLaunchBroadcast = async () => {
    const confirmSend = window.confirm(
      `Are you absolutely sure you want to blast this personalized email campaign to all subscribers in the selected filter?`
    );
    if (!confirmSend) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/freebies/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          bodyHtml,
          freebieSlug: audienceFilter !== "all" ? audienceFilter : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Campaign broadcast failed");

      setStatus({
        type: "success",
        message: `Campaign blast finished! Successfully personalized and sent ${data.sentCount} email(s) ${
          data.failedCount > 0 ? `(${data.failedCount} failed)` : ""
        }.`,
      });
    } catch (err) {
      setStatus({ type: "error", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT: Composer Workspace */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold">Campaign Editor</h2>
          <p className="text-sm text-da-muted mt-1">
            Write your message. Dynamic merge tags are fully supported and will parse one-to-one for each subscriber.
          </p>
        </div>

        {/* Dynamic Status Notification */}
        {status && (
          <div
            className={`p-4 rounded-xl border text-sm ${
              status.type === "success"
                ? "bg-[#40FF78]/10 border-[#40FF78]/30 text-[#40FF78]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="space-y-4">
          {/* Target Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-da-muted font-mono mb-2">Target Audience</label>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="w-full rounded-lg border border-da-border bg-da-dark px-3 py-2.5 text-sm text-da-text focus:outline-none focus:border-da-indigo"
            >
              <option value="all">All Captured Leads (Deduplicated)</option>
              {activeCatalog.map((item) => (
                <option key={item.slug} value={item.slug}>
                  Filter: Claimed /{item.slug}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-da-muted font-mono mb-2">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Guide: How to purchase your first domain"
              className="w-full rounded-lg border border-da-border bg-da-dark px-3 py-2.5 text-sm text-da-text focus:outline-none focus:border-da-indigo"
            />
          </div>

          {/* Body Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider text-da-muted font-mono">Email Body Content</label>
              <span className="text-[10px] text-da-muted font-mono">HTML or Plaintext supported</span>
            </div>
            
            {/* Merge Tag Inserter Row */}
            <div className="flex flex-wrap gap-2 mb-3 bg-da-dark/40 p-2.5 rounded-lg border border-da-border">
              <span className="text-xs text-da-muted flex items-center mr-1">Insert Tag:</span>
              <button
                type="button"
                onClick={() => insertTag("{{first_name}}")}
                className="px-2 py-1 text-xs rounded border border-da-border hover:bg-da-surface/50 text-da-cyan font-mono transition-colors"
                title="Inserts capitalized first name prefix derived from email"
              >
                + First Name
              </button>
              <button
                type="button"
                onClick={() => insertTag("{{email}}")}
                className="px-2 py-1 text-xs rounded border border-da-border hover:bg-da-surface/50 text-da-cyan font-mono transition-colors"
                title="Inserts subscriber's exact email address"
              >
                + Email
              </button>
              <button
                type="button"
                onClick={() => insertTag("{{download_url}}")}
                className="px-2 py-1 text-xs rounded border border-da-border hover:bg-da-surface/50 text-da-cyan font-mono transition-colors"
                title="Inserts active freebie download Visual Guide URL"
              >
                + Download URL
              </button>
              <button
                type="button"
                onClick={() => insertTag("{{unsubscribe_url}}")}
                className="px-2 py-1 text-xs rounded border border-da-border hover:bg-da-surface/50 text-da-cyan font-mono transition-colors"
                title="Inserts direct unsubscribing link"
              >
                + Unsubscribe
              </button>
            </div>

            <textarea
              id="email-body-input"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-da-border bg-da-dark p-3 text-sm text-da-text focus:outline-none focus:border-da-indigo font-sans resize-y"
            />
          </div>
        </div>

        {/* Action Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-da-border/60 pt-6">
          {/* Action 1: Send Test Preview */}
          <form onSubmit={handleSendTest} className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-da-muted font-mono">Test Dispatcher</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="developer@gmail.com"
                className="flex-1 rounded-lg border border-da-border bg-da-dark px-3 py-1.5 text-xs text-da-text focus:outline-none focus:border-da-indigo"
              />
              <button
                type="submit"
                disabled={testLoading || loading}
                className="rounded-lg border border-da-border bg-da-surface hover:bg-da-surface/50 px-3 py-1.5 text-xs font-semibold text-da-text transition-colors disabled:opacity-50"
              >
                {testLoading ? "Sending..." : "Send Test"}
              </button>
            </div>
          </form>

          {/* Action 2: Send Full Blast */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleLaunchBroadcast}
              disabled={loading || testLoading}
              className="w-full text-center rounded-lg bg-gradient-to-r from-da-indigo to-da-purple hover:opacity-90 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-da-indigo/20 transition-all disabled:opacity-50 font-mono tracking-wider uppercase"
            >
              {loading ? "Launching Campaign Blast..." : "🚀 Launch Campaign Blast"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Live Sandbox Preview */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold">Dynamic Live Sandbox</h2>
          <p className="text-sm text-da-muted mt-1">
            Visual sandbox simulating exactly how the finalized responsive dark email compiles.
          </p>
        </div>

        {/* The Sandboxed Email Shell Mock */}
        <div className="rounded-xl border border-da-border bg-[#0a0f1e] overflow-hidden shadow-2xl">
          {/* Header Block */}
          <div className="border-b border-da-border/60 bg-da-surface/40 p-4">
            <div className="flex items-center gap-2 text-xs text-da-muted font-mono">
              <span className="w-12 text-right">From:</span>
              <span className="text-da-cyan">Digital Alchemy &lt;desi@digitalalchemy.dev&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-da-muted font-mono mt-1.5">
              <span className="w-12 text-right">To:</span>
              <span>subscriber@example.com</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-da-muted font-mono mt-1.5">
              <span className="w-12 text-right">Subject:</span>
              <span className="text-da-text font-bold font-sans">{previewSubject || "(Empty Subject)"}</span>
            </div>
          </div>

          {/* Rendered Email Body Block */}
          <div className="p-8 text-left bg-[#0a0f1e]">
            <div className="max-w-xl mx-auto bg-[#1e293b] border border-[#334155] rounded-2xl p-8">
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00D4FF", fontWeight: 700, fontFamily: "monospace" }}>
                Digital Alchemy Broadcast
              </p>
              <h1 style={{ margin: "0 0 24px 0", fontSize: "22px", lineHeight: "1.2", color: "#f8fafc", fontWeight: "bold" }}>
                {previewSubject}
              </h1>

              {/* Dynamic Sandbox Interpolations */}
              <div 
                className="prose prose-invert max-w-none text-sm text-[#94a3b8]"
                dangerouslySetInnerHTML={{ __html: compileLivePreview(bodyHtml) }}
              />

              <hr style={{ margin: "32px 0 20px 0", border: "none", borderTop: "1px solid #334155" }} />
              <p style={{ margin: "0", fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>
                digitalalchemy.dev · Chicago, IL <br />
                Sent to subscriber@example.com. If you no longer want to receive these, you can <span className="text-[#6366f1] underline cursor-pointer">unsubscribe</span> instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
