import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="border-t border-da-border bg-da-darker">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight"
            >
              DIGITAL<span className="text-da-amber">ALCHEMY</span>
            </Link>
            <p className="mt-4 text-sm text-da-muted leading-relaxed max-w-xs">
              Transform from scattered AI consumer to asset-owning creator.
              Build systems. Own everything. Become the Alchemist.
            </p>
            <Button
              href={SITE.skoolUrl}
              external
              variant="accent"
              size="sm"
              className="mt-6"
            >
              Become an Alchemist
            </Button>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-da-muted">
              Navigate
            </h3>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-da-muted hover:text-da-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The Creed (abbreviated) */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-da-muted">
              The Alchemist Creed
            </h3>
            <blockquote className="mt-4 text-sm text-da-muted leading-relaxed italic border-l-2 border-da-indigo/40 pl-4">
              I am not a consumer. I am a creator.
              <br />I don&apos;t collect courses. I build systems.
              <br />I don&apos;t hope for clarity. I architect outcomes.
            </blockquote>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-da-border pt-8 sm:flex-row">
          <p className="text-xs text-da-muted">
            &copy; {new Date().getFullYear()} Digital Alchemy / DB Creations
            LLC. All rights reserved.
          </p>
          <p className="text-xs text-da-muted">
            Built by{" "}
            <span className="text-da-indigo">{SITE.founder}</span> &mdash;{" "}
            {SITE.credential}
          </p>
        </div>
      </div>
    </footer>
  );
}
