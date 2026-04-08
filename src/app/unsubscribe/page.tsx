import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const ok = params.ok === "1";

  return (
    <section className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">
        {ok ? "You're unsubscribed" : "Something went wrong"}
      </h1>
      <p className="mt-4 text-da-muted">
        {ok
          ? "You won't receive any more emails from Digital Alchemy. You can always resubscribe from the blog."
          : "The link may be invalid or expired. If this keeps happening, reply to any of our emails."}
      </p>
    </section>
  );
}
