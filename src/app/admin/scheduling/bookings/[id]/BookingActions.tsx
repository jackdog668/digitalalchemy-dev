"use client";

import { useState, useTransition } from "react";
import {
  markBookingCompleted,
  markBookingNoShow,
  cancelBookingAsAdmin,
} from "@/app/admin/scheduling/_actions";

interface Props {
  id: string;
  status: string;
}

export function BookingActions({ id, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const isFinalized = status !== "confirmed";

  function run(fn: () => Promise<void>) {
    setError("");
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    });
  }

  function onCancel() {
    const reason = prompt("Cancellation reason (optional):") ?? "";
    if (!confirm("Cancel this booking and notify the invitee?")) return;
    run(() => cancelBookingAsAdmin(id, reason));
  }

  if (isFinalized) {
    return (
      <p className="text-sm text-da-muted">
        This booking is {status.replace("_", " ")}. No further actions.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run(() => markBookingCompleted(id))}
          disabled={isPending}
          className="rounded-lg bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/30 disabled:opacity-50"
        >
          Mark completed
        </button>
        <button
          type="button"
          onClick={() => run(() => markBookingNoShow(id))}
          disabled={isPending}
          className="rounded-lg bg-da-muted/20 px-4 py-2 text-sm font-semibold text-da-muted hover:bg-da-muted/30 disabled:opacity-50"
        >
          Mark no-show
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
        >
          Cancel booking
        </button>
      </div>
    </div>
  );
}
