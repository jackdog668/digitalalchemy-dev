"use client";

import { useState, useTransition } from "react";
import {
  createEventType,
  updateEventType,
  type EventTypeInput,
} from "@/app/admin/scheduling/_actions";
import {
  LOCATION_TYPES,
  LOCATION_LABELS,
  CUSTOM_QUESTION_TYPES,
  type CustomQuestion,
  type LocationType,
} from "@/lib/scheduling-constants";

interface Props {
  initial?: Partial<EventTypeInput> & { id?: string };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const inputCls =
  "w-full rounded-lg border border-da-border bg-da-dark px-4 py-3 text-da-text outline-none focus:border-da-indigo";

export function EventTypeEditor({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<EventTypeInput>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    durationMinutes: initial?.durationMinutes ?? 30,
    color: initial?.color ?? "#6366f1",
    locationType: (initial?.locationType ?? "google_meet") as LocationType,
    locationDetails: initial?.locationDetails ?? "",
    priceCents: initial?.priceCents ?? 0,
    currency: initial?.currency ?? "usd",
    bufferBeforeMinutes: initial?.bufferBeforeMinutes ?? 0,
    bufferAfterMinutes: initial?.bufferAfterMinutes ?? 0,
    minNoticeHours: initial?.minNoticeHours ?? 4,
    maxPerDay: initial?.maxPerDay ?? null,
    maxAdvanceDays: initial?.maxAdvanceDays ?? 60,
    status: initial?.status ?? "active",
    customQuestions: initial?.customQuestions ?? [],
  });

  // Price is edited in dollars for humans, stored as cents
  const [priceDollars, setPriceDollars] = useState(
    ((initial?.priceCents ?? 0) / 100).toString(),
  );

  function onTitleChange(v: string) {
    setForm((f) => ({
      ...f,
      title: v,
      slug: f.slug || slugify(v),
    }));
  }

  function setQuestion(idx: number, patch: Partial<CustomQuestion>) {
    setForm((f) => ({
      ...f,
      customQuestions: f.customQuestions.map((q, i) =>
        i === idx ? { ...q, ...patch } : q,
      ),
    }));
  }
  function addQuestion() {
    setForm((f) => ({
      ...f,
      customQuestions: [
        ...f.customQuestions,
        { label: "", type: "short_text", required: false },
      ],
    }));
  }
  function removeQuestion(idx: number) {
    setForm((f) => ({
      ...f,
      customQuestions: f.customQuestions.filter((_, i) => i !== idx),
    }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const dollars = parseFloat(priceDollars || "0");
    const payload: EventTypeInput = {
      ...form,
      priceCents: Math.round(dollars * 100),
    };

    startTransition(async () => {
      try {
        if (initial?.id) {
          await updateEventType(initial.id, payload);
        } else {
          await createEventType(payload);
        }
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

      <div>
        <label className="mb-1 block text-sm text-da-muted">Title</label>
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="30-min Intro Call"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">Slug</label>
        <input
          className={inputCls}
          value={form.slug}
          onChange={(e) =>
            setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
          }
          placeholder="intro"
          required
        />
        <p className="mt-1 text-xs text-da-muted">
          Booking URL: digitalalchemy.dev/book/<strong>{form.slug || "slug"}</strong>
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">Description</label>
        <textarea
          className={`${inputCls} min-h-[100px]`}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="What visitors see on the booking page."
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Duration (minutes)
          </label>
          <input
            className={inputCls}
            type="number"
            min={5}
            max={600}
            value={form.durationMinutes}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                durationMinutes: parseInt(e.target.value || "0", 10),
              }))
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-da-muted">Price (USD)</label>
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min={0}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            placeholder="0 for free"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Accent color
          </label>
          <input
            className={`${inputCls} h-[50px]`}
            type="color"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">
          Location type
        </label>
        <select
          className={inputCls}
          value={form.locationType}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              locationType: e.target.value as LocationType,
            }))
          }
        >
          {LOCATION_TYPES.map((lt) => (
            <option key={lt} value={lt}>
              {LOCATION_LABELS[lt]}
            </option>
          ))}
        </select>
        {form.locationType !== "google_meet" && (
          <input
            className={`${inputCls} mt-3`}
            value={form.locationDetails}
            onChange={(e) =>
              setForm((f) => ({ ...f, locationDetails: e.target.value }))
            }
            placeholder={
              form.locationType === "zoom"
                ? "Your Zoom personal meeting link"
                : form.locationType === "phone"
                  ? "Your phone number (or 'I'll call you')"
                  : form.locationType === "in_person"
                    ? "Address"
                    : "Custom instructions"
            }
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Buffer before (min)
          </label>
          <input
            className={inputCls}
            type="number"
            min={0}
            max={120}
            value={form.bufferBeforeMinutes}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                bufferBeforeMinutes: parseInt(e.target.value || "0", 10),
              }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Buffer after (min)
          </label>
          <input
            className={inputCls}
            type="number"
            min={0}
            max={120}
            value={form.bufferAfterMinutes}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                bufferAfterMinutes: parseInt(e.target.value || "0", 10),
              }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Min notice (hrs)
          </label>
          <input
            className={inputCls}
            type="number"
            min={0}
            max={720}
            value={form.minNoticeHours}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minNoticeHours: parseInt(e.target.value || "0", 10),
              }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Max advance (days)
          </label>
          <input
            className={inputCls}
            type="number"
            min={1}
            max={365}
            value={form.maxAdvanceDays}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maxAdvanceDays: parseInt(e.target.value || "0", 10),
              }))
            }
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">
          Max per day (optional)
        </label>
        <input
          className={inputCls}
          type="number"
          min={1}
          max={100}
          value={form.maxPerDay ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              maxPerDay: e.target.value ? parseInt(e.target.value, 10) : null,
            }))
          }
          placeholder="Unlimited"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">Status</label>
        <select
          className={inputCls}
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              status: e.target.value as EventTypeInput["status"],
            }))
          }
        >
          <option value="active">Active (visible on public booking page)</option>
          <option value="inactive">Inactive (hidden)</option>
        </select>
      </div>

      {/* Custom questions */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm text-da-muted">
            Custom questions (shown on the booking form)
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="text-sm text-da-indigo hover:text-da-cyan"
          >
            + Add question
          </button>
        </div>
        {form.customQuestions.length === 0 ? (
          <p className="text-xs text-da-muted">
            No custom questions. Name + email are always required.
          </p>
        ) : (
          <div className="space-y-3">
            {form.customQuestions.map((q, idx) => (
              <div
                key={idx}
                className="grid gap-3 rounded-lg border border-da-border bg-da-dark/50 p-3 sm:grid-cols-[1fr_160px_100px_auto]"
              >
                <input
                  className={inputCls}
                  placeholder="Question label"
                  value={q.label}
                  onChange={(e) => setQuestion(idx, { label: e.target.value })}
                />
                <select
                  className={inputCls}
                  value={q.type}
                  onChange={(e) =>
                    setQuestion(idx, {
                      type: e.target.value as CustomQuestion["type"],
                    })
                  }
                >
                  {CUSTOM_QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "short_text"
                        ? "Short text"
                        : t === "long_text"
                          ? "Long text"
                          : "Phone"}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-da-muted">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      setQuestion(idx, { required: e.target.checked })
                    }
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-da-indigo px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : initial?.id
              ? "Update event type"
              : "Create event type"}
        </button>
      </div>
    </form>
  );
}
