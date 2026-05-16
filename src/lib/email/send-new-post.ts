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
// Pages the subscribers table in batches of PAGE_SIZE so memory stays
// constant regardless of list size — we no longer load every subscriber
// into Node memory at once. Each page's recipients are then fanned out
// through Resend's batch endpoint in CHUNK-sized HTTP calls.
const PAGE_SIZE = 1000; // Supabase select page size (rows pulled per HTTP call)
const CHUNK = 100; // Resend batch send size (messages per Resend HTTP call)

export async function sendNewPostEmail(post: PostRow): Promise<void> {
  const { apiKey, fromEmail } = requireResend();
  const db = createServiceRoleClient();

  const resend = new Resend(apiKey);
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  let offset = 0;
  // Loop until a page returns fewer rows than PAGE_SIZE — that's the last page.
  // Bounded at 1M subscribers (1000 pages of 1000) as a sanity safety net
  // against accidentally tight-looping on a Supabase quirk.
  for (let page = 0; page < 1000; page++) {
    const { data: subs, error } = await db
      .from("subscribers")
      .select("email, unsubscribe_token")
      .eq("confirmed", true)
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load subscribers: ${error.message}`);
    if (!subs || subs.length === 0) return;

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

    if (subs.length < PAGE_SIZE) return; // last page — we're done
    offset += PAGE_SIZE;
  }
}
