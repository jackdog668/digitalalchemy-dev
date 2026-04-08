"use client";

import { useTransition } from "react";
import { deleteEventType } from "@/app/admin/scheduling/_actions";

export function DeleteEventTypeButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        `Delete "${title}"? This cannot be undone.\n\nExisting bookings for this event type will block deletion.`,
      )
    )
      return;
    startTransition(async () => {
      try {
        await deleteEventType(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
