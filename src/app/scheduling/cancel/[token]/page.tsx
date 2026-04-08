import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBookingByCancelToken,
  getEventTypeById,
} from "@/lib/scheduling";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { CancelBookingForm } from "./CancelBookingForm";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Cancel booking",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CancelBookingPage({ params }: PageProps) {
  const { token } = await params;
  const booking = await getBookingByCancelToken(token);
  if (!booking) notFound();
  const eventType = await getEventTypeById(booking.eventTypeId);
  if (!eventType) notFound();

  const whenLocal = new Date(booking.startTime).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: booking.timezone,
    timeZoneName: "short",
  });

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-32 pb-12">
        <GlowOrb color="purple" size="lg" className="-left-20 top-10" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Cancel your booking
          </h1>
        </div>
      </section>

      <ShimmerLine />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-xl rounded-xl border border-da-border bg-da-surface p-8">
          <h2 className="font-display text-xl font-semibold">
            {eventType.title}
          </h2>
          <p className="mt-1 text-da-muted">{whenLocal}</p>
          <p className="mt-1 text-sm text-da-muted">
            Booked for {booking.inviteeName}
          </p>

          <div className="mt-6">
            <CancelBookingForm
              token={token}
              alreadyCancelled={booking.status === "cancelled"}
            />
          </div>
        </div>
      </section>
    </>
  );
}
