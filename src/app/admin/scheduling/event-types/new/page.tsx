import Link from "next/link";
import { EventTypeEditor } from "../../_components/EventTypeEditor";

export default function NewEventTypePage() {
  return (
    <div>
      <Link
        href="/admin/scheduling/event-types"
        className="text-sm text-da-muted hover:text-da-text"
      >
        ← Event types
      </Link>
      <h1 className="mb-6 mt-1 font-display text-3xl font-bold">
        New event type
      </h1>
      <EventTypeEditor />
    </div>
  );
}
