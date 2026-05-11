import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { renderSequenceEmail } from "@/lib/email/templates/sequence";

const WELCOME_SEQUENCE_KEY = "welcome";
const DEFAULT_BATCH_LIMIT = 25;
const RETRY_DELAY_MS = 60 * 60 * 1000;

interface SequenceRow {
  id: string;
  key: string;
  status: "active" | "inactive";
}

interface SequenceStepRow {
  id: string;
  sequence_id: string;
  step_order: number;
  subject: string;
  preview_text: string;
  body_html: string;
  body_text: string;
  delay_hours: number;
}

interface SubscriberRow {
  id: string;
  email: string;
  confirmed: boolean;
  unsubscribe_token: string;
}

interface DueEnrollmentRow {
  id: string;
  sequence_id: string;
  subscriber_id: string;
  current_step_order: number;
  subscribers: SubscriberRow | SubscriberRow[] | null;
  email_sequences: SequenceRow | SequenceRow[] | null;
}

export interface SequenceRunnerSummary {
  ok: true;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  completed: number;
  cancelled: number;
  at: string;
}

function firstOrNull<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function addHours(date: Date, hours: number): string {
  return new Date(date.getTime() + hours * 3600_000).toISOString();
}

function applyTokens(value: string, tokens: Record<string, string>): string {
  let out = value;
  for (const [key, tokenValue] of Object.entries(tokens)) {
    out = out.replaceAll(`{{${key}}}`, tokenValue);
  }
  return out;
}

async function getSequenceByKey(key: string): Promise<SequenceRow | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("email_sequences")
    .select("id,key,status")
    .eq("key", key)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error(`getSequenceByKey(${key}) error:`, error);
    return null;
  }

  return (data as SequenceRow | null) ?? null;
}

async function getStep(
  sequenceId: string,
  stepOrder: number,
): Promise<SequenceStepRow | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("email_sequence_steps")
    .select("*")
    .eq("sequence_id", sequenceId)
    .eq("step_order", stepOrder)
    .maybeSingle();

  if (error) {
    console.error(`getStep(${sequenceId}, ${stepOrder}) error:`, error);
    return null;
  }

  return (data as SequenceStepRow | null) ?? null;
}

export async function enrollSubscriberInWelcomeSequence(
  subscriberId: string,
): Promise<void> {
  const sequence = await getSequenceByKey(WELCOME_SEQUENCE_KEY);
  if (!sequence) return;

  const firstStep = await getStep(sequence.id, 1);
  if (!firstStep) return;

  const db = createServiceRoleClient();
  const { error } = await db.from("email_sequence_enrollments").upsert(
    {
      sequence_id: sequence.id,
      subscriber_id: subscriberId,
      current_step_order: 1,
      next_send_at: addHours(new Date(), firstStep.delay_hours),
      status: "active",
      last_error: null,
      completed_at: null,
      cancelled_at: null,
    },
    { onConflict: "sequence_id,subscriber_id" },
  );

  if (error) {
    throw new Error(`enrollSubscriberInWelcomeSequence: ${error.message}`);
  }
}

async function logSend(params: {
  enrollmentId: string;
  stepId: string | null;
  subscriberId: string;
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string | null;
  error?: string | null;
}): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db.from("email_sequence_sends").insert({
    enrollment_id: params.enrollmentId,
    sequence_step_id: params.stepId,
    subscriber_id: params.subscriberId,
    status: params.status,
    provider_message_id: params.providerMessageId ?? null,
    error: params.error ?? null,
  });

  if (error && params.status !== "sent") {
    console.error("email sequence send log error:", error);
  }
  if (error && params.status === "sent") {
    throw new Error(`email sequence send log error: ${error.message}`);
  }
}

async function completeEnrollment(enrollmentId: string): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db
    .from("email_sequence_enrollments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", enrollmentId);

  if (error) throw new Error(`completeEnrollment: ${error.message}`);
}

async function cancelEnrollment(
  enrollmentId: string,
  reason: string,
): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db
    .from("email_sequence_enrollments")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      last_error: reason,
    })
    .eq("id", enrollmentId);

  if (error) throw new Error(`cancelEnrollment: ${error.message}`);
}

async function advanceEnrollment(
  enrollment: DueEnrollmentRow,
  currentStep: SequenceStepRow,
): Promise<"advanced" | "completed"> {
  const nextStep = await getStep(
    enrollment.sequence_id,
    currentStep.step_order + 1,
  );
  if (!nextStep) {
    await completeEnrollment(enrollment.id);
    return "completed";
  }

  const db = createServiceRoleClient();
  const { error } = await db
    .from("email_sequence_enrollments")
    .update({
      current_step_order: nextStep.step_order,
      next_send_at: addHours(new Date(), nextStep.delay_hours),
      last_error: null,
    })
    .eq("id", enrollment.id);

  if (error) throw new Error(`advanceEnrollment: ${error.message}`);
  return "advanced";
}

async function markRetry(enrollmentId: string, errorMessage: string) {
  const db = createServiceRoleClient();
  const { error } = await db
    .from("email_sequence_enrollments")
    .update({
      last_error: errorMessage,
      next_send_at: new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
    })
    .eq("id", enrollmentId);

  if (error) {
    console.error("email sequence retry update error:", error);
  }
}

async function getDueEnrollments(limit: number): Promise<DueEnrollmentRow[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("email_sequence_enrollments")
    .select(
      `
      id,
      sequence_id,
      subscriber_id,
      current_step_order,
      subscribers (
        id,
        email,
        confirmed,
        unsubscribe_token
      ),
      email_sequences (
        id,
        key,
        status
      )
    `,
    )
    .eq("status", "active")
    .lte("next_send_at", new Date().toISOString())
    .order("next_send_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`getDueEnrollments: ${error.message}`);
  }

  return (data ?? []) as DueEnrollmentRow[];
}

async function processEnrollment(
  enrollment: DueEnrollmentRow,
): Promise<"sent" | "failed" | "skipped" | "completed" | "cancelled"> {
  const subscriber = firstOrNull(enrollment.subscribers);
  const sequence = firstOrNull(enrollment.email_sequences);

  if (!subscriber || !subscriber.confirmed) {
    await logSend({
      enrollmentId: enrollment.id,
      stepId: null,
      subscriberId: enrollment.subscriber_id,
      status: "skipped",
      error: "subscriber-not-confirmed",
    });
    await cancelEnrollment(enrollment.id, "subscriber-not-confirmed");
    return "cancelled";
  }

  if (!sequence || sequence.status !== "active") {
    await logSend({
      enrollmentId: enrollment.id,
      stepId: null,
      subscriberId: enrollment.subscriber_id,
      status: "skipped",
      error: "sequence-inactive",
    });
    await cancelEnrollment(enrollment.id, "sequence-inactive");
    return "cancelled";
  }

  const step = await getStep(enrollment.sequence_id, enrollment.current_step_order);
  if (!step) {
    await completeEnrollment(enrollment.id);
    return "completed";
  }

  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${encodeURIComponent(
    subscriber.unsubscribe_token,
  )}`;
  const tokens = { siteUrl, unsubscribeUrl };
  const bodyHtml = applyTokens(step.body_html, tokens);
  const bodyText = `${applyTokens(step.body_text, tokens)}\n\nUnsubscribe: ${unsubscribeUrl}`;

  try {
    const providerMessageId = await sendEmail({
      to: subscriber.email,
      subject: step.subject,
      html: renderSequenceEmail({
        previewText: step.preview_text,
        bodyHtml,
        unsubscribeUrl,
        siteUrl,
      }),
      text: bodyText,
    });

    await logSend({
      enrollmentId: enrollment.id,
      stepId: step.id,
      subscriberId: subscriber.id,
      status: "sent",
      providerMessageId,
    });

    const result = await advanceEnrollment(enrollment, step);
    return result === "completed" ? "completed" : "sent";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSend({
      enrollmentId: enrollment.id,
      stepId: step.id,
      subscriberId: subscriber.id,
      status: "failed",
      error: message,
    });
    await markRetry(enrollment.id, message);
    return "failed";
  }
}

export async function processDueEmailSequences(
  limit = DEFAULT_BATCH_LIMIT,
): Promise<SequenceRunnerSummary> {
  const enrollments = await getDueEnrollments(limit);
  const summary: SequenceRunnerSummary = {
    ok: true,
    attempted: enrollments.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    completed: 0,
    cancelled: 0,
    at: new Date().toISOString(),
  };

  for (const enrollment of enrollments) {
    const result = await processEnrollment(enrollment);
    summary[result]++;
  }

  return summary;
}
