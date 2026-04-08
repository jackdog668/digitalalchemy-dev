import Link from "next/link";
import { getAllEventTypes } from "@/lib/scheduling";
import { formatDuration, formatPrice } from "@/lib/scheduling-constants";
import { DeleteEventTypeButton } from "../_components/DeleteEventTypeButton";

export const dynamic = "force-dynamic";

export default async function EventTypesListPage() {
  const eventTypes = await getAllEventTypes();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/scheduling"
            className="text-sm text-da-muted hover:text-da-text"
          >
            ← Scheduling
          </Link>
          <h1 className="mt-1 font-display text-3xl font-bold">Event types</h1>
        </div>
        <Link
          href="/admin/scheduling/event-types/new"
          className="rounded-lg bg-da-indigo px-4 py-2 text-sm font-semibold text-white"
        >
          + New event type
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-da-border">
        <table className="w-full text-sm">
          <thead className="bg-da-surface text-left text-xs uppercase tracking-wider text-da-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-da-border">
            {eventTypes.map((et) => (
              <tr key={et.id} className="bg-da-dark hover:bg-da-surface/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/scheduling/event-types/${et.id}/edit`}
                    className="font-medium hover:text-da-indigo"
                  >
                    {et.title}
                  </Link>
                  <div className="text-xs text-da-muted">/book/{et.slug}</div>
                </td>
                <td className="px-4 py-3 text-da-muted">
                  {formatDuration(et.durationMinutes)}
                </td>
                <td className="px-4 py-3 text-da-muted">
                  {formatPrice(et.priceCents, et.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={et.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteEventTypeButton id={et.id} title={et.title} />
                </td>
              </tr>
            ))}
            {eventTypes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-da-muted"
                >
                  No event types yet. Click &ldquo;New event type&rdquo; to
                  create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/30",
    inactive: "bg-da-muted/10 text-da-muted border-da-border",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${styles[status] ?? styles.inactive}`}
    >
      {status}
    </span>
  );
}
