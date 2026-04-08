import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventTypeById } from "@/lib/scheduling";
import { EventTypeEditor } from "../../../_components/EventTypeEditor";

export const dynamic = "force-dynamic";

export default async function EditEventTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const et = await getEventTypeById(id);
  if (!et) notFound();

  return (
    <div>
      <Link
        href="/admin/scheduling/event-types"
        className="text-sm text-da-muted hover:text-da-text"
      >
        ← Event types
      </Link>
      <h1 className="mb-6 mt-1 font-display text-3xl font-bold">
        Edit event type
      </h1>
      <EventTypeEditor
        initial={{
          id: et.id,
          slug: et.slug,
          title: et.title,
          description: et.description,
          durationMinutes: et.durationMinutes,
          color: et.color,
          locationType: et.locationType,
          locationDetails: et.locationDetails ?? "",
          priceCents: et.priceCents,
          currency: et.currency,
          bufferBeforeMinutes: et.bufferBeforeMinutes,
          bufferAfterMinutes: et.bufferAfterMinutes,
          minNoticeHours: et.minNoticeHours,
          maxPerDay: et.maxPerDay,
          maxAdvanceDays: et.maxAdvanceDays,
          status: et.status,
          customQuestions: et.customQuestions,
        }}
      />
    </div>
  );
}
