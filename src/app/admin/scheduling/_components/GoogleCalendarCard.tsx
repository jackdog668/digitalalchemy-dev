import { isGoogleOAuthConfigured, serverEnv } from "@/lib/env";
import { isConnected } from "@/lib/google/tokens";

// Server component — reads connection state on every render, no client JS.
// Shows one of three states: not configured, configured but disconnected,
// or connected (with disconnect form).
export async function GoogleCalendarCard({
  statusFlag,
}: {
  statusFlag?: string;
}) {
  const configured = isGoogleOAuthConfigured();
  const adminEmail = serverEnv().ADMIN_EMAIL;
  const connected = configured ? await isConnected(adminEmail) : false;

  const statusMessage = statusFlag
    ? (
        {
          connected: "✓ Connected successfully.",
          disconnected: "Disconnected.",
          denied: "Consent was denied. Try again?",
          missing: "OAuth response was missing code or state.",
          badstate: "CSRF state mismatch. Try reconnecting.",
          exchangefailed:
            "Token exchange failed. Revoke at myaccount.google.com/permissions and retry.",
          notconfigured:
            "Google OAuth env vars not set. See SETUP.md.",
        } as Record<string, string>
      )[statusFlag]
    : null;

  return (
    <div className="rounded-xl border border-da-indigo/20 bg-da-surface p-6">
      <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-da-cyan to-da-indigo" />
      <h3 className="font-display text-xl font-semibold">Google Calendar</h3>
      <p className="mt-2 text-sm text-da-muted">
        Sync bookings with your Google Calendar and auto-generate Meet links.
      </p>

      {statusMessage && (
        <div className="mt-4 rounded-lg border border-da-border bg-da-dark p-3 text-sm">
          {statusMessage}
        </div>
      )}

      <div className="mt-6">
        {!configured ? (
          <p className="text-sm text-da-muted">
            Not set up yet. Set <code>GOOGLE_OAUTH_CLIENT_ID</code> and{" "}
            <code>GOOGLE_OAUTH_CLIENT_SECRET</code> in{" "}
            <code>.env.local</code>. See <code>SETUP.md</code> for the
            Google Cloud Console walkthrough.
          </p>
        ) : connected ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <span className="text-green-400">✓ Connected</span> as{" "}
              <code>{adminEmail}</code>
            </p>
            <form
              action="/api/scheduling/google/disconnect"
              method="post"
            >
              <button
                type="submit"
                className="rounded-lg border border-da-border px-4 py-2 text-sm text-da-muted hover:border-red-500/40 hover:text-red-300"
              >
                Disconnect
              </button>
            </form>
          </div>
        ) : (
          <a
            href="/api/scheduling/google/connect"
            className="inline-block rounded-lg bg-da-indigo px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Connect Google Calendar
          </a>
        )}
      </div>
    </div>
  );
}
