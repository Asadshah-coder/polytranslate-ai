import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Translator from "@/components/Translator";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import { PAIR_SLUGS, getPair } from "@/lib/seo";
import { phrasesForPair } from "@/lib/phrases";
import { canonical, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return PAIR_SLUGS.map((slug) => ({ pair: slug }));
}

export async function generateMetadata({ params }: { params: { pair: string } }): Promise<Metadata> {
  const pair = getPair(params.pair);
  if (!pair) return {};
  const url = canonical(`/${pair.slug}`);
  return {
    title: pair.title,
    description: pair.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: pair.title,
      description: pair.metaDescription,
      url,
      type: "website",
      siteName: "PolyTranslate AI",
    },
    twitter: {
      card: "summary",
      title: pair.title,
      description: pair.metaDescription,
    },
  };
}

export default function PairPage({ params }: { params: { pair: string } }) {
  const pair = getPair(params.pair);
  if (!pair) notFound();

  const phrases = phrasesForPair(pair.sourceCode, pair.targetCode);
  const pageUrl = canonical(`/${pair.slug}`);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Translators", item: canonical("/languages") },
      { "@type": "ListItem", position: 3, name: pair.title, item: pageUrl },
    ],
  };

  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: pair.title,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: pair.metaDescription,
    inLanguage: [pair.sourceCode, pair.targetCode],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pair.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd, webAppLd, faqLd]} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-indigo-700">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/languages" className="hover:text-indigo-700">Translators</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-slate-800">{pair.title}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {pair.h1}
        </h1>

        <div className="mt-5 space-y-4 text-slate-600 leading-relaxed">
          {pair.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Working translator, pre-set to this pair */}
        <div className="mt-8">
          <Translator
            id={`translator-${pair.slug}`}
            initialSource={pair.sourceCode}
            initialTarget={pair.targetCode}
            fallbackDirection={pair.targetDirection}
          />
        </div>

        {/* Common phrases */}
        {phrases.length > 0 && (
          <section aria-labelledby={`${pair.slug}-phrases`} className="mt-12">
            <h2 id={`${pair.slug}-phrases`} className="text-2xl font-bold text-slate-900">
              Common {pair.sourceName} to {pair.targetName} phrases
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Everyday phrases to get you started. Translate any of them above to hear the difference tone makes.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th scope="col" className="px-4 py-3 font-semibold text-slate-700">{pair.sourceName}</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-slate-700">{pair.targetName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {phrases.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 text-slate-800">{row.a}</td>
                      <td
                        className="px-4 py-2.5 text-slate-900"
                        dir={pair.targetDirection}
                        lang={pair.targetCode}
                      >
                        {row.b}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Translation examples */}
        <section aria-labelledby={`${pair.slug}-examples`} className="mt-12">
          <h2 id={`${pair.slug}-examples`} className="text-2xl font-bold text-slate-900">
            Translation examples
          </h2>
          <div className="mt-4 space-y-4">
            {pair.examples.map((ex, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-slate-500 text-sm font-medium">{pair.sourceName}</p>
                <p className="mt-1 text-slate-900">{ex.source}</p>
                <p className="mt-3 text-slate-500 text-sm font-medium">{pair.targetName}</p>
                <p className="mt-1 text-slate-900" dir={pair.targetDirection} lang={pair.targetCode}>
                  {ex.target}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Language notes */}
        <section aria-labelledby={`${pair.slug}-notes`} className="mt-12">
          <h2 id={`${pair.slug}-notes`} className="text-2xl font-bold text-slate-900">
            About translating {pair.sourceName} to {pair.targetName}
          </h2>
          <ul className="mt-4 space-y-3">
            {pair.languageNotes.map((note, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-slate-700">
                <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-indigo-600">•</span>
                <span className="text-sm leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Tips */}
        <section aria-labelledby={`${pair.slug}-tips`} className="mt-12">
          <h2 id={`${pair.slug}-tips`} className="text-2xl font-bold text-slate-900">
            Tips for better {pair.sourceName}–{pair.targetName} translation
          </h2>
          <ol className="mt-4 list-decimal space-y-2.5 pl-6 text-slate-700">
            {pair.tips.map((tip, i) => (
              <li key={i} className="text-sm leading-relaxed">{tip}</li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section aria-labelledby={`${pair.slug}-faq`} className="mt-12">
          <h2 id={`${pair.slug}-faq`} className="text-2xl font-bold text-slate-900">
            {pair.title}: FAQs
          </h2>
          <div className="mt-4">
            <Faq items={pair.faqs} idPrefix={`${pair.slug}-faq`} />
          </div>
        </section>

        {/* Related pairs */}
        <section aria-labelledby={`${pair.slug}-related`} className="mt-12">
          <h2 id={`${pair.slug}-related`} className="text-2xl font-bold text-slate-900">
            Related translators
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pair.related.map((slug) => {
              const rel = getPair(slug);
              if (!rel) return null;
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-4 font-medium text-slate-800 transition-colors hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  {rel.title} <span aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl bg-indigo-700 px-6 py-10 text-center">
          <h2 className="text-2xl font-bold text-white">Start translating {pair.sourceName} to {pair.targetName}</h2>
          <p className="mx-auto mt-2 max-w-lg text-indigo-100">
            Free to start. Save your translations to history and pick up where you left off.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={`#translator-${pair.slug}`}
              className="rounded-xl bg-white px-6 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Translate now
            </a>
            <Link
              href="/signup"
              className="rounded-xl border border-indigo-400 px-6 py-2.5 font-semibold text-white hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Create free account
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
