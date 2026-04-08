"use client";

import { useMemo } from "react";

// Month calendar. Dates with any available slots are clickable; others are
// dimmed. Prev/next month nav respects `maxAdvanceDays`.

interface Props {
  currentMonth: Date; // first day of the shown month (local TZ)
  onMonthChange: (d: Date) => void;
  selectedDate: string | null; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  availableDates: Set<string>; // YYYY-MM-DD strings
  maxAdvanceDays: number;
  minNoticeHours: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtMonth(d: Date): string {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CalendarPicker({
  currentMonth,
  onMonthChange,
  selectedDate,
  onSelectDate,
  availableDates,
  maxAdvanceDays,
  minNoticeHours,
}: Props) {
  const grid = useMemo(() => {
    const first = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const startPadding = first.getDay(); // Sunday = 0
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startPadding; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d),
      );
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  const now = new Date();
  const minBookable = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);
  const maxBookable = new Date(
    now.getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000,
  );

  function prevMonth() {
    const p = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    // Don't allow navigating to months entirely in the past
    const endOfP = new Date(p.getFullYear(), p.getMonth() + 1, 0);
    if (endOfP < minBookable) return;
    onMonthChange(p);
  }
  function nextMonth() {
    const n = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (n > maxBookable) return;
    onMonthChange(n);
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg border border-da-border px-3 py-1.5 text-sm hover:border-da-indigo"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="font-display text-xl font-semibold">
          {fmtMonth(currentMonth)}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg border border-da-border px-3 py-1.5 text-sm hover:border-da-indigo"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-da-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const ymd = toYmd(date);
          const available = availableDates.has(ymd);
          const isPast = date < minBookable && !isSameYmd(date, minBookable);
          const tooFar = date > maxBookable;
          const disabled = isPast || tooFar || !available;
          const selected = selectedDate === ymd;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(ymd)}
              className={[
                "aspect-square rounded-lg text-sm transition-colors",
                selected
                  ? "bg-da-indigo text-white"
                  : disabled
                    ? "cursor-not-allowed text-da-muted/40"
                    : "bg-da-dark text-da-text hover:bg-da-indigo/20",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isSameYmd(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
