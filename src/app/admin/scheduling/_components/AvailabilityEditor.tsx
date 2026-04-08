"use client";

import { useState, useTransition } from "react";
import { upsertAvailabilityRules } from "@/app/admin/scheduling/_actions";
import {
  DAYS_OF_WEEK,
  POPULAR_TIMEZONES,
  type AvailabilityRule,
} from "@/lib/scheduling-constants";

interface Props {
  initialRules: AvailabilityRule[];
  initialTimezone?: string;
}

interface EditorRange {
  startTime: string;
  endTime: string;
}

// Client-side shape: each day is either "closed" or has 0+ time ranges.
type WeeklySchedule = Record<number, EditorRange[]>;

const DEFAULT_RANGE: EditorRange = { startTime: "10:00", endTime: "18:00" };
const inputCls =
  "rounded-lg border border-da-border bg-da-dark px-3 py-2 text-sm text-da-text outline-none focus:border-da-indigo";

function rulesToSchedule(rules: AvailabilityRule[]): WeeklySchedule {
  const schedule: WeeklySchedule = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const r of rules) {
    schedule[r.dayOfWeek].push({ startTime: r.startTime, endTime: r.endTime });
  }
  return schedule;
}

export function AvailabilityEditor({
  initialRules,
  initialTimezone = "America/Chicago",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [schedule, setSchedule] = useState<WeeklySchedule>(() =>
    rulesToSchedule(initialRules),
  );

  function addRange(day: number) {
    setSchedule((s) => ({
      ...s,
      [day]: [...(s[day] ?? []), { ...DEFAULT_RANGE }],
    }));
  }

  function removeRange(day: number, idx: number) {
    setSchedule((s) => ({
      ...s,
      [day]: (s[day] ?? []).filter((_, i) => i !== idx),
    }));
  }

  function updateRange(
    day: number,
    idx: number,
    patch: Partial<EditorRange>,
  ) {
    setSchedule((s) => ({
      ...s,
      [day]: (s[day] ?? []).map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);

    // Flatten weekly schedule into rule rows
    const rules = Object.entries(schedule).flatMap(([dayStr, ranges]) =>
      ranges.map((r) => ({
        dayOfWeek: parseInt(dayStr, 10),
        startTime: r.startTime,
        endTime: r.endTime,
        timezone,
      })),
    );

    // Client-side pre-check: no overlapping ranges within a single day
    for (const day of Object.keys(schedule).map(Number)) {
      const sorted = [...(schedule[day] ?? [])].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].startTime < sorted[i - 1].endTime) {
          setError(
            `${DAYS_OF_WEEK[day]}: overlapping time ranges. Please fix before saving.`,
          );
          return;
        }
      }
      for (const r of schedule[day] ?? []) {
        if (r.startTime >= r.endTime) {
          setError(
            `${DAYS_OF_WEEK[day]}: end time must be after start time.`,
          );
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        await upsertAvailabilityRules({ rules });
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
          Availability saved.
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-da-muted">Timezone</label>
        <select
          className={`${inputCls} w-full max-w-sm`}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {POPULAR_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-da-border">
        {DAYS_OF_WEEK.map((dayLabel, dayIdx) => {
          const ranges = schedule[dayIdx] ?? [];
          const isOpen = ranges.length > 0;
          return (
            <div
              key={dayIdx}
              className="flex flex-col gap-3 border-b border-da-border px-4 py-4 last:border-b-0 sm:flex-row sm:items-start"
            >
              <div className="w-28 flex-shrink-0 pt-2">
                <span className="font-semibold">{dayLabel}</span>
              </div>

              <div className="flex-1">
                {!isOpen ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-da-muted">Unavailable</span>
                    <button
                      type="button"
                      onClick={() => addRange(dayIdx)}
                      className="text-sm text-da-indigo hover:text-da-cyan"
                    >
                      + Add time range
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ranges.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          className={inputCls}
                          value={r.startTime}
                          onChange={(e) =>
                            updateRange(dayIdx, idx, {
                              startTime: e.target.value,
                            })
                          }
                          required
                        />
                        <span className="text-da-muted">–</span>
                        <input
                          type="time"
                          className={inputCls}
                          value={r.endTime}
                          onChange={(e) =>
                            updateRange(dayIdx, idx, {
                              endTime: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeRange(dayIdx, idx)}
                          aria-label="Remove range"
                          className="text-da-muted hover:text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRange(dayIdx)}
                      className="text-sm text-da-indigo hover:text-da-cyan"
                    >
                      + Add another range
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-da-indigo px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save availability"}
        </button>
      </div>
    </form>
  );
}
