interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Renders JSON-LD structured data. Only used with genuine on-page content. */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes `<` as \u003c to keep the script tag safe.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
