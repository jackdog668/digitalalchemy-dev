"use client";

import type { Slot } from "./types";

interface Props {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
  loading: boolean;
  selectedDateLabel: string | null;
}

function timeOnly(s: Slot, tz: string): string {
  const d = new Date(s.startUtc);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
}

export function TimeSlotColumn({
  slots,
  selectedSlot,
  onSelect,
  loading,
  selectedDateLabel,
}: Props) {
  if (!selectedDateLabel) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-da-muted">
        Pick a date to see available times
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-da-muted">
        Loading...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div>
        <h3 className="mb-4 font-display text-lg font-semibold">
          {selectedDateLabel}
        </h3>
        <p className="text-sm text-da-muted">
          No slots available on this day. Try another date.
        </p>
      </div>
    );
  }

  // Detect viewer TZ from the browser for the small time label
  const viewerTz =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-semibold">
        {selectedDateLabel}
      </h3>
      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-2">
        {slots.map((slot) => {
          const selected = selectedSlot?.startUtc === slot.startUtc;
          return (
            <button
              key={slot.startUtc}
              type="button"
              onClick={() => onSelect(slot)}
              className={[
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                selected
                  ? "border-da-indigo bg-da-indigo/20 text-da-text"
                  : "border-da-border bg-da-dark text-da-text hover:border-da-indigo",
              ].join(" ")}
            >
              {timeOnly(slot, viewerTz)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
