import "server-only";

import { Resend } from "resend";
import { requireResend } from "@/lib/env";
import { SITE } from "@/lib/constants";

interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  /** Hard cap on the Resend SDK call. Defaults to 10s. */
  timeoutMs?: number;
}

interface ResendSendResult {
  data?: {
    id?: string;
  } | null;
  error?: {
    message?: string;
  } | null;
}

/**
 * Hard timeout on the Resend SDK call. The SDK itself has no timeout —
 * a slow/hanging SMTP relay would otherwise pin a Next.js request handler
 * for as long as Resend kept the socket open. 10s matches Resend's own
 * server-side budget; longer than that and they'll have already failed.
 */
const DEFAULT_TIMEOUT_MS = 10_000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function sendEmail(input: SendEmailInput): Promise<string | null> {
  const { apiKey, fromEmail } = requireResend();
  const resend = new Resend(apiKey);

  const send = resend.emails.send({
    from: `${SITE.name} <${fromEmail}>`,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  }) as Promise<ResendSendResult>;

  const result = await withTimeout(
    send,
    input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    "resend.emails.send",
  );

  if (result.error) {
    throw new Error(result.error.message ?? "Email send failed");
  }

  return result.data?.id ?? null;
}
