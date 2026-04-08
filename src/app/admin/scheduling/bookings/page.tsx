import Link from "next/link";
import { listAllBookings, getAllEventTypes } from "@/lib/scheduling";
import { formatPrice } from "@/lib/scheduling-constants";

export const dynamic = "force-dynamic";

export default async function BookingsListPage() {
  const [bookings, eventTypes] = await Promise.all([
    listAllBookings(),
    getAllEventTypes(),
  ]);
  const eventTypeMap = new Map(eventTypes.map((e) => [e.id, e]));

  return (
    <div>
      <Link
        href="/admin/scheduling"
        className="text-sm text-da-muted hover:text-da-text"
      >
        ← Scheduling
      </Link>
      <h1 className="mb-6 mt-1 font-display text-3xl font-bold">Bookings</h1>

      <div className="overflow-hidden rounded-lg border border-da-border">
        <table className="w-full text-sm">
          <thead className="bg-da-surface text-left text-xs uppercase tracking-wider text-da-muted">
            <tr>
              <th className="px-4 py-3">Invitee</th>
              <th className="px-4 py-3">Event type</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-da-border">
            {bookings.map((b) => {
              const et = eventTypeMap.get(b.eventTypeId);
              const when = new Date(b.startTime).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: "America/Chicago",
                timeZoneName: "short",
              });
              return (
                <tr key={b.id} className="bg-da-dark hover:bg-da-surface/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/scheduling/bookings/${b.id}`}
                      className="font-medium hover:text-da-indigo"
                    >
                      {b.inviteeName}
                    </Link>
                    <div className="text-xs text-da-muted">
                      {b.inviteeEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-da-muted">
                    {et?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-da-muted">{when}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-da-muted">
                    {et ? formatPrice(et.priceCents, et.currency) : "—"}
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-da-muted"
                >
                  No bookings yet.
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
    confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
    rescheduled: "bg-da-cyan/10 text-da-cyan border-da-cyan/30",
    completed: "bg-da-indigo/10 text-da-indigo border-da-indigo/30",
    no_show: "bg-da-muted/10 text-da-muted border-da-border",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${styles[status] ?? styles.no_show}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
