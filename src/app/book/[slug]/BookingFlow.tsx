"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventType } from "@/lib/scheduling-constants";
import {
  formatDuration,
  formatPrice,
  POPULAR_TIMEZONES,
} from "@/lib/scheduling-constants";
import { CalendarPicker } from "./_components/CalendarPicker";
import { TimeSlotColumn } from "./_components/TimeSlotColumn";
import { BookingForm } from "./_components/BookingForm";
import type { Slot } from "./_components/types";

interface Props {
  eventType: EventType;
}

type Step = "pickDate" | "pickTime" | "fillForm";

function detectTimezone(): string {
  if (typeof Intl === "undefined") return "America/Chicago";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
  } catch {
    return "America/Chicago";
  }
}

function ymdInTz(d: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${day}`;
}

export function BookingFlow({ eventType }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pickDate");
  const [timezone, setTimezone] = useState<string>("America/Chicago");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [monthSlots, setMonthSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  // Detect TZ on mount. Must run as an effect (not lazy useState) so SSR
  // and the client's first render agree on "America/Chicago" — otherwise
  // the timezone would mismatch and React would tear the hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimezone(detectTimezone());
  }, []);

  // Fetch slots for the visible month whenever it changes
  useEffect(() => {
    let cancelled = false;
    const from = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const to = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/scheduling/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: eventType.slug,
        viewerTz: timezone,
        fromDate: from.toISOString(),
        toDate: to.toISOString(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setMonthSlots(data.slots ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setMonthSlots([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentMonth, timezone, eventType.slug]);

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    for (const s of monthSlots) {
      set.add(ymdInTz(new Date(s.startUtc), timezone));
    }
    return set;
  }, [monthSlots, timezone]);

  const dateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return monthSlots.filter(
      (s) => ymdInTz(new Date(s.startUtc), timezone) === selectedDate,
    );
  }, [monthSlots, selectedDate, timezone]);

  function onSelectDate(ymd: string) {
    setSelectedDate(ymd);
    setSelectedSlot(null);
    setStep("pickTime");
  }

  function onSelectSlot(slot: Slot) {
    setSelectedSlot(slot);
    setStep("fillForm");
  }

  function onBackToSlots() {
    setStep("pickTime");
  }

  function onBookingSuccess(cancelToken: string) {
    router.push(
      `/book/${eventType.slug}/confirmed?token=${encodeURIComponent(cancelToken)}`,
    );
  }

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Event header */}
      <div className="mb-8 rounded-xl border border-da-border bg-da-surface p-6">
        <h1 className="font-display text-2xl font-bold">{eventType.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-da-muted">
          <span>{formatDuration(eventType.durationMinutes)}</span>
          <span className="h-1 w-1 rounded-full bg-da-muted" />
          <span>{formatPrice(eventType.priceCents, eventType.currency)}</span>
          {eventType.priceCents > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-da-muted" />
              <span className="text-da-cyan">Invoice sent after booking</span>
            </>
          )}
        </div>
        <p className="mt-4 text-da-muted">{eventType.description}</p>
      </div>

      {/* TZ switcher */}
      <div className="mb-4 flex items-center justify-end gap-2 text-sm text-da-muted">
        <span>Timezone:</span>
        <select
          className="rounded-lg border border-da-border bg-da-dark px-3 py-1.5 text-sm text-da-text outline-none focus:border-da-indigo"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {POPULAR_TIMEZONES.includes(
            timezone as (typeof POPULAR_TIMEZONES)[number],
          ) ? null : (
            <option value={timezone}>{timezone} (detected)</option>
          )}
          {POPULAR_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {step !== "fillForm" && (
        <div className="grid gap-8 rounded-xl border border-da-border bg-da-surface p-6 lg:grid-cols-[1fr_280px]">
          <div>
            <CalendarPicker
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              availableDates={availableDates}
              maxAdvanceDays={eventType.maxAdvanceDays}
              minNoticeHours={eventType.minNoticeHours}
            />
          </div>
          <div className="border-t border-da-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <TimeSlotColumn
              slots={dateSlots}
              selectedSlot={selectedSlot}
              onSelect={onSelectSlot}
              loading={loading}
              selectedDateLabel={selectedDateLabel}
            />
          </div>
        </div>
      )}

      {step === "fillForm" && selectedSlot && (
        <div className="rounded-xl border border-da-border bg-da-surface p-6">
          <BookingForm
            slug={eventType.slug}
            slot={selectedSlot}
            timezone={timezone}
            customQuestions={eventType.customQuestions}
            onBack={onBackToSlots}
            onSuccess={onBookingSuccess}
          />
        </div>
      )}
    </div>
  );
}
