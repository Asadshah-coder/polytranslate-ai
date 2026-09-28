import { describe, expect, it } from "vitest";
import { PAIR_SLUGS, PAIRS, getPair } from "../seo";

const EXPECTED_SLUGS = [
  "english-to-urdu",
  "urdu-to-english",
  "english-to-arabic",
  "arabic-to-english",
  "english-to-spanish",
  "spanish-to-english",
  "english-to-french",
  "french-to-english",
  "english-to-german",
  "english-to-hindi",
  "hindi-to-english",
  "english-to-persian",
  "english-to-portuguese",
  "english-to-russian",
  "english-to-chinese",
  "english-to-turkish",
];

describe("SEO pair data", () => {
  it("defines exactly the 16 expected pair slugs", () => {
    expect(PAIR_SLUGS).toEqual(EXPECTED_SLUGS);
  });

  it("has metadata for every slug and getPair resolves them", () => {
    for (const slug of EXPECTED_SLUGS) {
      const pair = getPair(slug);
      expect(pair, slug).toBeDefined();
      expect(PAIRS[slug].slug).toBe(slug);
    }
    expect(getPair("klingon-to-elvish")).toBeUndefined();
  });

  it("gives every page a unique title and meta description", () => {
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const slug of EXPECTED_SLUGS) {
      const p = PAIRS[slug];
      expect(p.title.length, `${slug} title`).toBeGreaterThan(5);
      expect(p.metaDescription.length, `${slug} meta`).toBeGreaterThan(50);
      expect(p.metaDescription.length, `${slug} meta max`).toBeLessThanOrEqual(200);
      expect(p.h1.length, `${slug} h1`).toBeGreaterThan(5);
      titles.add(p.title);
      descs.add(p.metaDescription);
    }
    expect(titles.size).toBe(EXPECTED_SLUGS.length);
    expect(descs.size).toBe(EXPECTED_SLUGS.length);
  });

  it("has real language codes and a valid text direction per pair", () => {
    const codeRe = /^[a-z]{2}$/;
    for (const slug of EXPECTED_SLUGS) {
      const p = PAIRS[slug];
      expect(p.sourceCode, `${slug} sourceCode`).toMatch(codeRe);
      expect(p.targetCode, `${slug} targetCode`).toMatch(codeRe);
      expect(p.sourceCode).not.toBe(p.targetCode);
      expect(["ltr", "rtl"]).toContain(p.targetDirection);
    }
    // RTL sanity for known right-to-left targets
    expect(PAIRS["english-to-urdu"].targetDirection).toBe("rtl");
    expect(PAIRS["english-to-arabic"].targetDirection).toBe("rtl");
    expect(PAIRS["english-to-persian"].targetDirection).toBe("rtl");
  });

  it("provides genuine body content: intro, notes, examples, FAQs, tips", () => {
    for (const slug of EXPECTED_SLUGS) {
      const p = PAIRS[slug];
      expect(p.intro.length, `${slug} intro`).toBeGreaterThanOrEqual(2);
      expect(p.languageNotes.length, `${slug} notes`).toBeGreaterThanOrEqual(3);
      expect(p.examples.length, `${slug} examples`).toBeGreaterThanOrEqual(3);
      for (const ex of p.examples) {
        expect(ex.source.trim().length, `${slug} example source`).toBeGreaterThan(0);
        expect(ex.target.trim().length, `${slug} example target`).toBeGreaterThan(0);
      }
      expect(p.faqs.length, `${slug} faqs`).toBeGreaterThanOrEqual(5);
      for (const f of p.faqs) {
        expect(f.q.trim().length, `${slug} faq q`).toBeGreaterThan(10);
        expect(f.a.trim().length, `${slug} faq a`).toBeGreaterThan(30);
      }
      expect(p.tips.length, `${slug} tips`).toBeGreaterThanOrEqual(4);
    }
  });

  it("links only to valid related pair slugs", () => {
    const valid = new Set(EXPECTED_SLUGS);
    for (const slug of EXPECTED_SLUGS) {
      const p = PAIRS[slug];
      expect(p.related.length, `${slug} related`).toBeGreaterThan(0);
      for (const r of p.related) {
        expect(valid.has(r), `${slug} related ${r}`).toBe(true);
        expect(r, `${slug} self-related`).not.toBe(slug);
      }
    }
  });

  it("keeps intros unique across pages (no copy-paste boilerplate)", () => {
    const firstParas = EXPECTED_SLUGS.map((s) => PAIRS[s].intro[0]);
    expect(new Set(firstParas).size).toBe(EXPECTED_SLUGS.length);
  });
});
