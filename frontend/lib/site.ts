/** Canonical public site URL, used for sitemaps, canonicals, and JSON-LD. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export function canonical(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "PolyTranslate AI";
export const SITE_TAGLINE = "Translate Anything. Understand Everyone.";
