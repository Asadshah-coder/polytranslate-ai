import { describe, expect, it } from "vitest";
import { PHRASES, phrasesForPair } from "../phrases";

// Non-English languages used by the 16 SEO pair pages.
const LANGS = ["ur", "ar", "es", "fr", "de", "hi", "fa", "pt", "ru", "zh", "tr"];

describe("phrase tables", () => {
  it("covers every non-English pair language", () => {
    for (const code of LANGS) {
      expect(PHRASES[code], code).toBeDefined();
      expect(PHRASES[code].length, `${code} count`).toBeGreaterThanOrEqual(6);
    }
  });

  it("has no empty phrase text", () => {
    for (const code of LANGS) {
      for (const p of PHRASES[code]) {
        expect(p.en.trim().length, `${code} en`).toBeGreaterThan(0);
        expect(p.text.trim().length, `${code} text`).toBeGreaterThan(0);
        // No one should have left template placeholders in.
        expect(p.text, `${code} placeholder`).not.toMatch(/lorem|xxx|todo/i);
      }
    }
  });

  it("returns English->X rows for forward pairs", () => {
    const rows = phrasesForPair("en", "ur");
    expect(rows.length).toBeGreaterThan(0);
    // `a` is the source-language (English) phrase, `b` the target.
    expect(rows[0].a.trim().length).toBeGreaterThan(0);
    expect(rows[0].b.trim().length).toBeGreaterThan(0);
    const hello = rows.find((r) => r.a.toLowerCase() === "hello");
    expect(hello, "hello row").toBeDefined();
  });

  it("inverts rows for reverse pairs (X->English)", () => {
    const fwd = phrasesForPair("en", "ar");
    const rev = phrasesForPair("ar", "en");
    expect(rev.length).toBe(fwd.length);
    // Inverted: source phrase is Arabic, target is English.
    const helloFwd = fwd.find((r) => r.a.toLowerCase() === "hello");
    const helloRev = rev.find((r) => r.b.toLowerCase() === "hello");
    expect(helloFwd && helloRev).toBeTruthy();
    expect(helloRev!.a).toBe(helloFwd!.b);
  });

  it("returns [] for pairs without curated phrases", () => {
    expect(phrasesForPair("en", "xx")).toEqual([]);
    expect(phrasesForPair("fr", "de")).toEqual([]);
  });
});
