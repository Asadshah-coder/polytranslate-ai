import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { POSTS, getPost } from "@/lib/blog";
import { canonical, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};
  const url = canonical(`/blog/${post.slug}`);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.excerpt, url, type: "article" },
    twitter: { card: "summary", title: post.title, description: post.excerpt },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const url = canonical(`/blog/${post.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          url,
          datePublished: post.date,
          inLanguage: "en",
          author: { "@type": "Organization", name: "PolyTranslate AI", url: SITE_URL },
          publisher: { "@type": "Organization", name: "PolyTranslate AI", url: SITE_URL },
        }}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-indigo-700">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-indigo-700">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate font-medium text-slate-800">{post.title}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <time dateTime={post.date}>
            {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
          <span aria-hidden="true">·</span>
          <span>{post.readMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>By PolyTranslate AI</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{t}</span>
          ))}
        </div>

        <div className="mt-8 space-y-8">
          {post.sections.map((section, i) => (
            <section key={i} aria-labelledby={`sec-${i}`}>
              <h2 id={`sec-${i}`} className="text-xl font-bold text-slate-900">{section.heading}</h2>
              <div className="mt-3 space-y-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="leading-relaxed text-slate-700">{p}</p>
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
                  {section.bullets.map((b, j) => (
                    <li key={j} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-indigo-50 p-6 text-center ring-1 ring-indigo-100">
          <h2 className="text-lg font-bold text-slate-900">Put it into practice</h2>
          <p className="mt-1 text-sm text-slate-600">Try the translator with tone and style controls.</p>
          <Link
            href="/#translator"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Open the translator
          </Link>
        </div>

        <nav aria-label="More articles" className="mt-10 border-t border-slate-200 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">More from the blog</h2>
          <ul className="mt-3 space-y-2">
            {POSTS.filter((p) => p.slug !== post.slug).map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </>
  );
}
