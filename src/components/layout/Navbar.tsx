"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Admin has its own chrome — hide the public-site navbar on /admin/**.
  // MUST come after all hooks to satisfy the Rules of Hooks.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled
          ? "bg-void/85 backdrop-blur-xl border-b border-hairline"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo lockup — DIGITALALCHEMY with green ALCHEMY accent */}
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-ink"
          >
            DIGITAL<span className="text-neon-green">ALCHEMY</span>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative px-4 py-2 text-sm font-medium transition-colors"
            >
              <span
                className={
                  pathname === link.href
                    ? "text-neon-green"
                    : "text-ink-muted group-hover:text-ink"
                }
              >
                {link.label}
              </span>
              {/* Underline reveal — slides in from left on hover, stays on active */}
              <span
                className={`absolute bottom-0 left-4 right-4 h-0.5 bg-neon-green transition-transform duration-200 origin-left ${
                  pathname === link.href
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
          <div className="ml-4 flex items-center gap-2">
            <Button href={SITE.beaconsUrl} external variant="ghost" size="sm">
              All My Links
            </Button>
            <Button href="/book" variant="primary" size="sm">
              Book a Call
            </Button>
            <Button href={SITE.skoolUrl} external variant="accent" size="sm">
              Join Digital Alchemy
            </Button>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
        >
          <motion.span
            animate={isMobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="block h-0.5 w-6 bg-ink"
          />
          <motion.span
            animate={isMobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.15 }}
            className="block h-0.5 w-6 bg-ink"
          />
          <motion.span
            animate={
              isMobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }
            }
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="block h-0.5 w-6 bg-ink"
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-2 border-t border-hairline bg-void/95 px-6 py-4 backdrop-blur-xl">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.05,
                    type: "spring",
                    damping: 20,
                    stiffness: 150,
                  }}
                >
                  <Link
                    href={link.href}
                    className={`block rounded-da-sm px-4 py-3 text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-neon-green/10 text-neon-green"
                        : "text-ink-muted hover:bg-card/50 hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: NAV_LINKS.length * 0.05,
                  type: "spring",
                  damping: 20,
                  stiffness: 150,
                }}
                className="mt-2"
              >
                <Button href={SITE.beaconsUrl} external variant="ghost" size="md">
                  All My Links
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: (NAV_LINKS.length + 1) * 0.05,
                  type: "spring",
                  damping: 20,
                  stiffness: 150,
                }}
                className="mt-2"
              >
                <Button href="/book" variant="primary" size="md">
                  Book a Call
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: (NAV_LINKS.length + 2) * 0.05,
                  type: "spring",
                  damping: 20,
                  stiffness: 150,
                }}
                className="mt-2"
              >
                <Button href={SITE.skoolUrl} external variant="accent" size="md">
                  Join Digital Alchemy
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
