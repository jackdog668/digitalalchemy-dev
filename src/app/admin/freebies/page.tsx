import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { listFreebies } from "@/lib/freebies";
import FreebiesCockpitClient from "./FreebiesCockpitClient";

export const dynamic = "force-dynamic";

interface LeadRow {
  id: string;
  email: string;
  freebie_slug: string;
  created_at: string;
}

export default async function FreebiesAdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-lg border border-da-border bg-da-surface p-6">
        <h1 className="font-display text-2xl font-bold">Supabase not configured</h1>
        <p className="mt-2 text-sm text-da-muted">
          Set the Supabase env vars in <code>.env.local</code> and restart the dev server.
        </p>
      </div>
    );
  }

  const db = createServiceRoleClient();
  
  // 1. Fetch leads count and recent lead capture records
  const { data: leads, error: leadsError } = await db
    .from("freebie_captures")
    .select("id, email, freebie_slug, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (leadsError) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        <h1 className="font-display text-2xl font-bold">Error Loading Leads</h1>
        <p className="mt-2 text-sm">
          {leadsError.message}
        </p>
      </div>
    );
  }

  // Calculate unique metrics
  const activeCatalog = listFreebies();
  const leadsCount = leads?.length ?? 0;

  // Breakdown counts by slug
  const slugCounts: Record<string, number> = {};
  for (const lead of leads ?? []) {
    slugCounts[lead.freebie_slug] = (slugCounts[lead.freebie_slug] ?? 0) + 1;
  }

  return (
    <FreebiesCockpitClient
      leads={leads as LeadRow[]}
      activeCatalog={activeCatalog}
      leadsCount={leadsCount}
      slugCounts={slugCounts}
    />
  );
}
