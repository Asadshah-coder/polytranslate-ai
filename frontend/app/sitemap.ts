import type { MetadataRoute } from "next";
import { PAIR_SLUGS } from "@/lib/seo";
import { POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  "",
  "/languages",
  "/blog",
  "/tools/grammar",
  "/tools/paraphrase",
  "/tools/summarize",
  "/tools/back-translate",
  "/tools/documents",
  "/tools/speech",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route || "/"}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  for (const slug of PAIR_SLUGS) {
    entries.push({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  for (const post of POSTS) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
