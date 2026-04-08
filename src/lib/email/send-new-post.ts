import "server-only";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireResend, serverEnv } from "@/lib/env";
import { SITE } from "@/lib/constants";
import { renderNewPostEmail } from "./templates/new-post";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image: string | null;
}

// Fans out a new-post announcement to all confirmed subscribers.
// Chunks by 100 recipients per Resend batch call.
export async function sendNewPostEmail(post: PostRow): Promise<void> {
  const { apiKey, fromEmail } = requireResend();
  const db = createServiceRoleClient();

  const { data: subs, error } = await db
    .from("subscribers")
    .select("email, unsubscribe_token")
    .eq("confirmed", true);

  if (error) throw new Error(`Failed to load subscribers: ${error.message}`);
  if (!subs || subs.length === 0) return;

  const resend = new Resend(apiKey);
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  // Resend batch endpoint takes up to 100 messages per call.
  const CHUNK = 100;
  for (let i = 0; i < subs.length; i += CHUNK) {
    const chunk = subs.slice(i, i + CHUNK);
    const messages = chunk.map((s) => {
      const unsubUrl = `${siteUrl}/api/unsubscribe?token=${encodeURIComponent(s.unsubscribe_token)}`;
      return {
        from: `${SITE.name} <${fromEmail}>`,
        to: [s.email],
        subject: `New post: ${post.title}`,
        html: renderNewPostEmail({
          title: post.title,
          description: post.description,
          url: postUrl,
          coverImage: post.cover_image,
          unsubscribeUrl: unsubUrl,
        }),
      };
    });
    await resend.batch.send(messages);
  }
}
