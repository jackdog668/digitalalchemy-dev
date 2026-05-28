"use client";

import { useState } from "react";
import Link from "next/link";
import { type FreebieProduct, getFreebie } from "@/lib/freebies";
import CampaignCockpitClient from "./CampaignCockpitClient";

interface LeadRow {
  id: string;
  email: string;
  freebie_slug: string;
  created_at: string;
}

interface FreebiesCockpitClientProps {
  leads: LeadRow[];
  activeCatalog: readonly FreebieProduct[];
  leadsCount: number;
  slugCounts: Record<string, number>;
}

export default function FreebiesCockpitClient({
  leads,
  activeCatalog,
  leadsCount,
  slugCounts,
}: FreebiesCockpitClientProps) {
  const [activeTab, setActiveTab] = useState<"ledger" | "campaign">("ledger");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-da-border/60 pb-6 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Freebies Cockpit</h1>
          <p className="mt-1 text-sm text-da-muted">
            Manage your digital freebies, view captured subscriber emails, and send personalized campaigns.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-da-dark p-1 rounded-xl border border-da-border self-start sm:self-center">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "ledger"
                ? "bg-da-surface border border-da-border text-da-cyan shadow"
                : "text-da-muted hover:text-da-text"
            }`}
          >
            📊 Leads Ledger
          </button>
          <button
            onClick={() => setActiveTab("campaign")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "campaign"
                ? "bg-da-surface border border-da-border text-da-cyan shadow"
                : "text-da-muted hover:text-da-text"
            }`}
          >
            ✉️ Campaign Blast
          </button>
        </div>
      </div>

      {activeTab === "ledger" && (
        <div className="space-y-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-da-border bg-da-surface/30 p-6 backdrop-blur-md">
              <span className="text-xs uppercase tracking-wider text-da-muted font-mono">Total Captured Leads</span>
              <span className="block mt-2 font-display text-4xl font-extrabold text-[#40FF78]">
                {leadsCount}
              </span>
              <span className="block mt-1 text-[10px] text-da-muted font-mono">bypassing monthly caps</span>
            </div>

            <div className="rounded-xl border border-da-border bg-da-surface/30 p-6 backdrop-blur-md">
              <span className="text-xs uppercase tracking-wider text-da-muted font-mono">Active Freebie Files</span>
              <span className="block mt-2 font-display text-4xl font-extrabold text-da-cyan">
                {activeCatalog.length}
              </span>
              <span className="block mt-1 text-[10px] text-da-muted font-mono">serving off Next.js CDN</span>
            </div>

            <div className="rounded-xl border border-da-border bg-da-surface/30 p-6 backdrop-blur-md">
              <span className="text-xs uppercase tracking-wider text-da-muted font-mono">Popular Resource</span>
              <span className="block mt-2 font-display text-lg font-bold text-da-text truncate">
                {activeCatalog[0]?.name ?? "None"}
              </span>
              <span className="block mt-1 text-[10px] text-da-muted font-mono">
                {slugCounts[activeCatalog[0]?.slug ?? ""] ?? 0} claims recorded
              </span>
            </div>
          </div>

          {/* Leads Table Section */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Lead Capture Database Log</h2>
            <div className="overflow-hidden rounded-xl border border-da-border bg-da-surface/10">
              <table className="w-full text-sm">
                <thead className="bg-da-surface/60 text-left text-xs uppercase tracking-wider text-da-muted font-mono border-b border-da-border">
                  <tr>
                    <th className="px-4 py-3">Subscriber Email</th>
                    <th className="px-4 py-3">Resource Claimed</th>
                    <th className="px-4 py-3">Date Claimed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-da-border bg-[#12131A]/30">
                  {leads.map((lead) => {
                    const product = getFreebie(lead.freebie_slug);
                    return (
                      <tr key={lead.id} className="hover:bg-da-surface/20">
                        <td className="px-4 py-4 font-medium text-da-text">{lead.email}</td>
                        <td className="px-4 py-4">
                          <span className="inline-block rounded-full border border-da-border bg-da-dark px-2.5 py-0.5 text-xs font-semibold text-da-text uppercase">
                            {product?.name ?? lead.freebie_slug}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-da-muted">
                          {new Date(lead.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {leadsCount === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-da-muted">
                        No leads captured yet. Your lead-gen forms are active and ready!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Catalog Section */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Active Catalogue Manager</h2>
            <div className="space-y-4">
              {activeCatalog.map((item) => (
                <div key={item.slug} className="rounded-xl border border-da-border bg-da-surface/20 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-block rounded border border-da-border bg-da-dark px-1.5 py-0.5 text-[10px] text-da-muted font-mono">
                      Slug: /{item.slug}
                    </span>
                    <h3 className="text-lg font-bold text-da-text">{item.name}</h3>
                    <p className="text-sm text-da-muted max-w-xl">{item.blurb}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg border border-da-border bg-da-dark hover:bg-da-surface/50 px-4 py-2.5 text-xs font-semibold text-da-text transition-colors"
                    >
                      View File ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "campaign" && (
        <div className="rounded-xl border border-da-border bg-da-surface/10 p-6 sm:p-8">
          <CampaignCockpitClient activeCatalog={activeCatalog} />
        </div>
      )}
    </div>
  );
}
