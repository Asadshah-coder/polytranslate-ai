import { describe, expect, it } from "vitest";
import { POSTS, getPost } from "../blog";

const EXPECTED = [
  { slug: "how-ai-translation-works", title: "How AI Translation Works: From Neural Networks to LLMs" },
  { slug: "english-to-urdu-grammar-differences", title: "English to Urdu Translation: Key Grammar Differences" },
  { slug: "translate-english-to-urdu-guide", title: "How to Translate English to Urdu Accurately: A Practical Guide" },
  { slug: "business-translation-best-practices", title: "Business Translation Best Practices for Global Teams" },
  { slug: "common-arabic-translation-mistakes", title: "Common Arabic Translation Mistakes and How to Avoid Them" },
];

function wordCount(post: (typeof POSTS)[number]): number {
  return post.sections
    .flatMap((s) => [...s.paragraphs, ...(s.bullets ?? [])])
    .join(" ")
    .split(/\s+/).length;
}

describe("blog content", () => {
  it("publishes exactly the 5 required articles", () => {
    expect(POSTS.length).toBe(5);
    for (const e of EXPECTED) {
      const post = getPost(e.slug);
      expect(post, e.slug).toBeDefined();
      expect(post!.title).toBe(e.title);
    }
    expect(getPost("nope")).toBeUndefined();
  });

  it("has unique slugs, excerpts, and valid dates", () => {
    const slugs = new Set(POSTS.map((p) => p.slug));
    expect(slugs.size).toBe(5);
    for (const p of POSTS) {
      expect(p.excerpt.length).toBeGreaterThan(30);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.readMinutes).toBeGreaterThan(2);
      expect(p.tags.length).toBeGreaterThan(0);
      expect(p.sections.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("each article is genuinely long-form (800+ words)", () => {
    for (const p of POSTS) {
      expect(wordCount(p), `${p.slug} words`).toBeGreaterThanOrEqual(800);
    }
  });

  it("has no filler placeholders", () => {
    const all = POSTS.flatMap((p) => p.sections.flatMap((s) => [...s.paragraphs, s.heading, ...(s.bullets ?? [])])).join("\n");
    expect(all).not.toMatch(/lorem ipsum|\[TODO\]|xxx/i);
  });
});
