import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { POSTS } from "@/lib/blog";
import { canonical, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical guides on AI translation, language pair grammar, and business localization — written to be genuinely useful.",
  alternates: { canonical: canonical("/blog") },
  openGraph: {
    title: "PolyTranslate AI Blog",
    description: "Practical guides on AI translation and language learning.",
    url: canonical("/blog"),
    type: "website",
  },
};

export default function BlogIndexPage() {
  const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "PolyTranslate AI Blog",
          url: canonical("/blog"),
          description: "Practical guides on AI translation, grammar, and localization.",
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Blog</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          In-depth, practical writing on how AI translation works, language-pair grammar, and
          localization — no filler, no content-mill spam.
        </p>
        <div className="mt-8 grid gap-6">
          {sorted.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <time dateTime={post.date}>
                  {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span aria-hidden="true">·</span>
                <span>{post.readMinutes} min read</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-slate-600">{post.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Read article <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
