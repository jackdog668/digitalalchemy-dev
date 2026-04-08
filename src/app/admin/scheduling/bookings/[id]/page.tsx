import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBookingById,
  getEventTypeById,
} from "@/lib/scheduling";
import { formatPrice, formatDuration } from "@/lib/scheduling-constants";
import { BookingActions } from "./BookingActions";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();
  const eventType = await getEventTypeById(booking.eventTypeId);
  if (!eventType) notFound();

  const fmt = (iso: string, tz: string) =>
    new Date(iso).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
      timeZoneName: "short",
    });

  return (
    <div>
      <Link
        href="/admin/scheduling/bookings"
        className="text-sm text-da-muted hover:text-da-text"
      >
        ← Bookings
      </Link>
      <h1 className="mb-6 mt-1 font-display text-3xl font-bold">
        {booking.inviteeName}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-da-border bg-da-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Booking</h2>
          <Field label="Event type" value={eventType.title} />
          <Field
            label="Duration"
            value={formatDuration(eventType.durationMinutes)}
          />
          <Field
            label="Price"
            value={formatPrice(eventType.priceCents, eventType.currency)}
          />
          <Field
            label="Your time (CT)"
            value={fmt(booking.startTime, "America/Chicago")}
          />
          <Field
            label="Invitee's time"
            value={`${fmt(booking.startTime, booking.timezone)}`}
          />
          <Field label="Status" value={booking.status} />
          {booking.cancellationReason && (
            <Field
              label="Cancellation reason"
              value={booking.cancellationReason}
            />
          )}
        </div>

        <div className="rounded-lg border border-da-border bg-da-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Invitee</h2>
          <Field label="Name" value={booking.inviteeName} />
          <Field label="Email" value={booking.inviteeEmail} />
          {booking.inviteeNotes && (
            <Field label="Notes" value={booking.inviteeNotes} />
          )}
          {Object.entries(booking.customAnswers).map(([q, a]) => (
            <Field key={q} label={q} value={a} />
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-da-border bg-da-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Actions</h2>
        <BookingActions
          id={booking.id}
          status={booking.status}
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <div className="text-xs uppercase tracking-wider text-da-muted">
        {label}
      </div>
      <div className="mt-1 text-sm text-da-text whitespace-pre-wrap">{value}</div>
    </div>
  );
}
