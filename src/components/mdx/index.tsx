import type { MDXComponents } from "mdx/types";

/** Custom MDX component overrides styled to DA dark theme */
export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="font-display text-3xl font-bold text-da-text mt-10 mb-4 sm:text-4xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="font-display text-2xl font-bold text-da-text mt-8 mb-3"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="font-display text-xl font-semibold text-da-text mt-6 mb-2"
      {...props}
    />
  ),
  p: (props) => (
    <p className="text-da-muted leading-relaxed mb-4" {...props} />
  ),
  a: (props) => (
    <a
      className="text-da-cyan underline underline-offset-4 decoration-da-cyan/40 hover:decoration-da-cyan transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="list-disc list-inside text-da-muted mb-4 space-y-1" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal list-inside text-da-muted mb-4 space-y-1" {...props} />
  ),
  li: (props) => <li className="text-da-muted leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-da-indigo/40 pl-4 italic text-da-muted my-6"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-da-darker px-1.5 py-0.5 text-sm font-mono text-da-cyan"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="rounded-lg bg-da-darker border border-da-border p-4 overflow-x-auto my-6 text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="border-da-border my-8" />,
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rounded-lg my-6 w-full"
      loading="lazy"
      alt={props.alt ?? ""}
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="font-semibold text-da-text" {...props} />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm text-da-muted border-collapse" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-da-border bg-da-surface px-4 py-2 text-left font-semibold text-da-text"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-da-border px-4 py-2" {...props} />
  ),
};
