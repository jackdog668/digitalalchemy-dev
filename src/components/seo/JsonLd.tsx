// Renders a JSON-LD <script> tag for structured data (schema.org).
// Uses children (not dangerouslySetInnerHTML) — React server components
// allow raw text children inside <script>. We still escape any "</" sequence
// to prevent the JSON payload from prematurely closing the script tag.

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json">{json}</script>;
}
