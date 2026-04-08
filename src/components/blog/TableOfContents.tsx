"use client";

import { useEffect, useState } from "react";

// Extracts H2/H3 headings from the rendered post DOM and displays them as a
// sticky sidebar TOC with active-section highlighting via IntersectionObserver.
// Pure client-side — no dependency on the MDX AST, so it works with any
// rendered article.
interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    const nodes = Array.from(article.querySelectorAll("h2, h3"));
    const items: Heading[] = nodes
      .filter((n): n is HTMLElement => n instanceof HTMLElement && !!n.id)
      .map((n) => ({
        id: n.id,
        text: n.textContent ?? "",
        level: n.tagName === "H2" ? 2 : 3,
      }));
    setHeadings(items);

    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-da-muted">
        On this page
      </p>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${h.id}`}
              className={`block border-l-2 py-1 pl-3 transition-colors ${
                activeId === h.id
                  ? "border-da-indigo text-da-indigo"
                  : "border-da-border text-da-muted hover:text-da-text"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
