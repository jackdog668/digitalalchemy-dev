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
}

interface ResendSendResult {
  data?: {
    id?: string;
  } | null;
  error?: {
    message?: string;
  } | null;
}

export async function sendEmail(input: SendEmailInput): Promise<string | null> {
  const { apiKey, fromEmail } = requireResend();
  const resend = new Resend(apiKey);

  const result = (await resend.emails.send({
    from: `${SITE.name} <${fromEmail}>`,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  })) as ResendSendResult;

  if (result.error) {
    throw new Error(result.error.message ?? "Email send failed");
  }

  return result.data?.id ?? null;
}
