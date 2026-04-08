import Link from "next/link";
import {
  getAllEventTypes,
  getAvailabilityRules,
  countBookings,
} from "@/lib/scheduling";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SchedulingDashboard() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-lg border border-da-border bg-da-surface p-6">
        <h1 className="font-display text-2xl font-bold">
          Supabase not configured
        </h1>
        <p className="mt-2 text-sm text-da-muted">
          Set Supabase env vars and restart. See <code>SETUP.md</code>.
        </p>
      </div>
    );
  }

  const [eventTypes, rules, bookingsCount] = await Promise.all([
    getAllEventTypes(),
    getAvailabilityRules(),
    countBookings(),
  ]);

  const activeCount = eventTypes.filter((e) => e.status === "active").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Scheduling</h1>
        <p className="mt-2 text-sm text-da-muted">
          Manage your booking system — event types, availability, and bookings.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Event types"
          value={eventTypes.length}
          sub={`${activeCount} active`}
        />
        <StatCard
          label="Weekly time blocks"
          value={rules.length}
          sub={rules.length === 0 ? "Not set" : "Across all days"}
        />
        <StatCard
          label="Bookings"
          value={bookingsCount}
          sub={bookingsCount === 0 ? "No bookings yet" : "Total lifetime"}
        />
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard
          title="Event Types"
          description="Create the consultations, intro calls, and workshops visitors can book."
          href="/admin/scheduling/event-types"
          cta="Manage event types →"
          accent="from-da-indigo to-da-purple"
        />
        <DashboardCard
          title="Availability"
          description="Set your weekly hours. Booking slots are derived from these rules."
          href="/admin/scheduling/availability"
          cta="Set availability →"
          accent="from-da-purple to-da-cyan"
        />
        <DashboardCard
          title="Bookings"
          description="Upcoming and past bookings. Public booking page arrives in Phase 2."
          href="#"
          cta="Coming soon"
          accent="from-da-cyan to-da-indigo"
          disabled
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-da-border bg-da-surface p-5">
      <div className="text-xs uppercase tracking-wider text-da-muted">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-da-muted">{sub}</div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  cta,
  accent,
  disabled,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`group h-full rounded-xl border bg-da-surface p-6 transition-[border-color,transform] ${
        disabled
          ? "cursor-not-allowed border-da-border opacity-60"
          : "cursor-pointer border-da-indigo/20 hover:-translate-y-1 hover:border-da-indigo/50"
      }`}
    >
      <div className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${accent}`} />
      <h3 className="font-display text-xl font-semibold transition-colors group-hover:text-da-indigo">
        {title}
      </h3>
      <p className="mt-2 text-sm text-da-muted">{description}</p>
      <span className="mt-4 inline-block text-sm text-da-indigo">{cta}</span>
    </div>
  );

  if (disabled) return inner;
  return <Link href={href}>{inner}</Link>;
}
