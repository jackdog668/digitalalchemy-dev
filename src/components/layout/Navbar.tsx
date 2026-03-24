"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-da-dark/80 backdrop-blur-xl border-b border-da-border/50"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-da-text hover:text-da-indigo transition-colors"
        >
          DIGITAL<span className="text-da-amber">ALCHEMY</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-da-indigo bg-da-indigo/10"
                  : "text-da-muted hover:text-da-text hover:bg-da-surface/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button
            href={SITE.skoolUrl}
            external
            variant="accent"
            size="sm"
            className="ml-4"
          >
            Join Digital Alchemy
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-da-text transition-all duration-300 ${
              isMobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-da-text transition-all duration-300 ${
              isMobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-da-text transition-all duration-300 ${
              isMobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-da-dark/95 backdrop-blur-xl border-t border-da-border/50 px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                pathname === link.href
                  ? "text-da-indigo bg-da-indigo/10"
                  : "text-da-muted hover:text-da-text hover:bg-da-surface/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button
            href={SITE.skoolUrl}
            external
            variant="accent"
            size="md"
            className="mt-2"
          >
            Join Digital Alchemy
          </Button>
        </div>
      </div>
    </header>
  );
}
