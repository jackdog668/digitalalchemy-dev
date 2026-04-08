import Link from "next/link";
import { getAvailabilityRules } from "@/lib/scheduling";
import { AvailabilityEditor } from "../_components/AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const rules = await getAvailabilityRules();
  const initialTimezone = rules[0]?.timezone ?? "America/Chicago";

  return (
    <div>
      <Link
        href="/admin/scheduling"
        className="text-sm text-da-muted hover:text-da-text"
      >
        ← Scheduling
      </Link>
      <h1 className="mb-2 mt-1 font-display text-3xl font-bold">
        Weekly availability
      </h1>
      <p className="mb-8 text-sm text-da-muted">
        Set the hours each week when you&apos;re available for bookings. Visitors
        will only see time slots that fall inside these windows (minus your
        buffer times and anything already booked).
      </p>
      <AvailabilityEditor
        initialRules={rules}
        initialTimezone={initialTimezone}
      />
    </div>
  );
}
