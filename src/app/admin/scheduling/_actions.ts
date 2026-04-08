"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServiceRoleClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { serverEnv, isResendConfigured } from "@/lib/env";
import {
  LOCATION_TYPES,
  EVENT_TYPE_STATUSES,
  CUSTOM_QUESTION_TYPES,
  POPULAR_TIMEZONES,
} from "@/lib/scheduling-constants";
import {
  getBookingById,
  getEventTypeById,
  cancelBookingRow,
  updateBookingStatus,
} from "@/lib/scheduling";
import { sendCancellationEmails } from "@/lib/scheduling-emails";

// ============================================================
// Admin guard (mirrors src/app/admin/_actions.ts assertAdmin)
// ============================================================
async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = serverEnv().ADMIN_EMAIL.toLowerCase();
  if (!user || user.email?.toLowerCase() !== adminEmail) {
    throw new Error("Unauthorized");
  }
  return user.email!;
}

// ============================================================
// Event type schema (Zod .strict per CLAUDE.md)
// ============================================================
const customQuestionSchema = z
  .object({
    label: z.string().min(1).max(200),
    type: z.enum(CUSTOM_QUESTION_TYPES),
    required: z.boolean(),
  })
  .strict();

const eventTypeInput = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, dashes only"),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    durationMinutes: z.number().int().min(5).max(600),
    color: z.string().regex(/^#[0-9a-f]{6}$/i, "Must be a hex color"),
    locationType: z.enum(LOCATION_TYPES),
    locationDetails: z.string().max(500).optional().or(z.literal("")),
    priceCents: z.number().int().min(0).max(1_000_000),
    currency: z.string().length(3).default("usd"),
    bufferBeforeMinutes: z.number().int().min(0).max(120),
    bufferAfterMinutes: z.number().int().min(0).max(120),
    minNoticeHours: z.number().int().min(0).max(720),
    maxPerDay: z.number().int().min(1).max(100).nullable().optional(),
    maxAdvanceDays: z.number().int().min(1).max(365),
    status: z.enum(EVENT_TYPE_STATUSES),
    customQuestions: z.array(customQuestionSchema).max(10),
  })
  .strict();

export type EventTypeInput = z.infer<typeof eventTypeInput>;

function toDbRow(input: EventTypeInput) {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    duration_minutes: input.durationMinutes,
    color: input.color,
    location_type: input.locationType,
    location_details: input.locationDetails || null,
    price_cents: input.priceCents,
    currency: input.currency.toLowerCase(),
    buffer_before_minutes: input.bufferBeforeMinutes,
    buffer_after_minutes: input.bufferAfterMinutes,
    min_notice_hours: input.minNoticeHours,
    max_per_day: input.maxPerDay ?? null,
    max_advance_days: input.maxAdvanceDays,
    status: input.status,
    custom_questions: input.customQuestions,
  };
}

function revalidateSchedulingPaths(slug?: string) {
  revalidatePath("/admin/scheduling");
  revalidatePath("/admin/scheduling/event-types");
  revalidatePath("/book");
  if (slug) revalidatePath(`/book/${slug}`);
}

export async function createEventType(raw: unknown) {
  await assertAdmin();
  const input = eventTypeInput.parse(raw);
  const db = createServiceRoleClient();

  const { data, error } = await db
    .from("scheduling_event_types")
    .insert(toDbRow(input))
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidateSchedulingPaths(data.slug);
  redirect("/admin/scheduling/event-types");
}

export async function updateEventType(id: string, raw: unknown) {
  await assertAdmin();
  const input = eventTypeInput.parse(raw);
  const db = createServiceRoleClient();

  const { data: prev } = await db
    .from("scheduling_event_types")
    .select("slug")
    .eq("id", id)
    .single();

  const { data, error } = await db
    .from("scheduling_event_types")
    .update(toDbRow(input))
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidateSchedulingPaths(data.slug);
  if (prev?.slug && prev.slug !== data.slug) {
    revalidatePath(`/book/${prev.slug}`);
  }
  redirect("/admin/scheduling/event-types");
}

export async function deleteEventType(id: string) {
  await assertAdmin();
  const db = createServiceRoleClient();
  const { data: existing } = await db
    .from("scheduling_event_types")
    .select("slug")
    .eq("id", id)
    .single();
  const { error } = await db
    .from("scheduling_event_types")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateSchedulingPaths(existing?.slug);
  redirect("/admin/scheduling/event-types");
}

// ============================================================
// Availability rules
// ============================================================
const availabilityRuleInput = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM required"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM required"),
    timezone: z.enum(POPULAR_TIMEZONES),
  })
  .strict()
  .refine((r) => r.startTime < r.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

const upsertAvailabilityInput = z
  .object({
    rules: z.array(availabilityRuleInput).max(50),
  })
  .strict();

export async function upsertAvailabilityRules(raw: unknown) {
  await assertAdmin();
  const { rules } = upsertAvailabilityInput.parse(raw);
  const db = createServiceRoleClient();

  // Simple strategy: wipe all rules and re-insert. Table is tiny (<50 rows)
  // and the admin edits the full weekly schedule at once, so diffing would
  // add complexity for zero benefit.
  const { error: deleteErr } = await db
    .from("scheduling_availability_rules")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteErr) throw new Error(deleteErr.message);

  if (rules.length > 0) {
    const { error: insertErr } = await db
      .from("scheduling_availability_rules")
      .insert(
        rules.map((r) => ({
          day_of_week: r.dayOfWeek,
          start_time: r.startTime,
          end_time: r.endTime,
          timezone: r.timezone,
        })),
      );
    if (insertErr) throw new Error(insertErr.message);
  }

  revalidatePath("/admin/scheduling/availability");
  revalidatePath("/admin/scheduling");
}

// ============================================================
// Booking actions (admin-side)
// ============================================================
function revalidateBookingPaths(bookingId?: string) {
  revalidatePath("/admin/scheduling");
  revalidatePath("/admin/scheduling/bookings");
  if (bookingId) revalidatePath(`/admin/scheduling/bookings/${bookingId}`);
}

export async function markBookingCompleted(id: string) {
  await assertAdmin();
  await updateBookingStatus(id, "completed");
  revalidateBookingPaths(id);
}

export async function markBookingNoShow(id: string) {
  await assertAdmin();
  await updateBookingStatus(id, "no_show");
  revalidateBookingPaths(id);
}

export async function cancelBookingAsAdmin(id: string, reason: string) {
  await assertAdmin();
  const existing = await getBookingById(id);
  if (!existing) throw new Error("Booking not found");
  const eventType = await getEventTypeById(existing.eventTypeId);
  if (!eventType) throw new Error("Event type missing");

  const cancelled = await cancelBookingRow(id, reason || null);

  if (isResendConfigured()) {
    try {
      await sendCancellationEmails(cancelled, eventType, "admin");
    } catch (err) {
      console.error("Admin cancel email failed:", err);
    }
  }

  revalidateBookingPaths(id);
}
