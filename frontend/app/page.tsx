import Link from "next/link";
import Translator from "@/components/Translator";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import PricingTeaser from "@/components/PricingTeaser";
import { SITE_URL, SITE_TAGLINE } from "@/lib/site";

const FEATURES = [
  {
    title: "Context-aware AI translation",
    body: "Full-sentence understanding with selectable tone and style — never naive word-by-word substitution. Names, numbers, dates, and URLs are preserved.",
    href: "/#translator",
    cta: "Try the translator",
  },
  {
    title: "100+ languages, proper RTL",
    body: "From Spanish to Urdu, Arabic to Chinese. Right-to-left languages render correctly, with native names and locale data from the language registry.",
    href: "/languages",
    cta: "Browse languages",
  },
  {
    title: "AI writing tools",
    body: "Grammar correction, paraphrasing in four styles, and three summary formats — separate tools built on the same provider abstraction.",
    href: "/tools/grammar",
    cta: "Fix my grammar",
  },
  {
    title: "Document translation",
    body: "Upload TXT, DOCX, or PDF and get a translated document back. Text is extracted, chunked, translated, and reconstructed.",
    href: "/tools/documents",
    cta: "Translate a document",
  },
  {
    title: "Speech translation",
    body: "Record your voice or upload audio: speech-to-text, translation, then text-to-speech playback with real device voices.",
    href: "/tools/speech",
    cta: "Speak & translate",
  },
  {
    title: "History & usage dashboard",
    body: "Searchable translation history with one-click reuse, plus a dashboard showing real usage against your plan limits.",
    href: "/signup",
    cta: "Create free account",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Enter text & pick languages",
    body: "Type or paste up to 10,000 characters. Leave the source on auto-detect and the app identifies the language for you.",
  },
  {
    n: "2",
    title: "Choose tone & style",
    body: "Formal or casual? Natural or concise? Pick from seven tones and four styles to match your audience.",
  },
  {
    n: "3",
    title: "Translate, listen & download",
    body: "Get the result with timing and character counts. Copy it, hear it spoken aloud, or download it as a text file.",
  },
];

const TONES = ["General", "Formal", "Casual", "Professional", "Academic", "Marketing", "Technical"];
const STYLES = ["Natural", "Literal", "Professional", "Concise"];

const FAQ = [
  {
    q: "Is PolyTranslate AI free to use?",
    a: "Yes. The Free plan covers everyday translation needs with a monthly character allowance, AI writing tools, and browser history. Paid plans raise the limits and add document translation priority. See the pricing section above for current plans.",
  },
  {
    q: "Which languages can I translate between?",
    a: "Over 100 languages, including Urdu, Arabic, Persian, Hindi, Spanish, French, German, Portuguese, Russian, Chinese, and Turkish. The full list with native names and RTL markers is on the Languages page, and popular pairs like English to Urdu have dedicated pages.",
  },
  {
    q: "How accurate is the AI translation?",
    a: "For everyday, business, and creative text it's fluent and context-aware — far beyond word-by-word translation. But no machine translation is perfect: idioms, low-resource languages, and highly specialized text can suffer. Always have legal, medical, or safety-critical translations reviewed by a qualified human.",
  },
  {
    q: "Do you store my translations?",
    a: "If you're signed in, translations are saved to your private history so you can search, reuse, or delete them — you can clear everything at any time. If you're not signed in, recent translations are kept only in your own browser's local storage. We never sell your data. Details are on the privacy page.",
  },
  {
    q: "Can I translate documents and speech?",
    a: "Yes. Upload TXT, DOCX, or PDF files to get translated documents back, and use the speech tool to record or upload audio for transcription, translation, and spoken playback.",
  },
  {
    q: "Which AI providers power the translations?",
    a: "The backend uses a provider abstraction supporting OpenAI and Gemini models, selected via server configuration. API keys live only on the server and are never exposed to the browser.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PolyTranslate AI",
          url: SITE_URL,
          description:
            "Fast, natural, context-aware AI translation for people, businesses, students, and creators.",
          inLanguage: "en",
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
              AI-powered · 100+ languages · Free to start
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Translate Anything. <span className="text-indigo-600">Understand Everyone.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              Fast, natural, context-aware AI translation for people, businesses, students, and
              creators.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#translator"
                className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
              >
                Start Translating
              </a>
              <Link
                href="/languages"
                className="w-full rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
              >
                Explore Languages
              </Link>
            </div>
          </div>

          {/* Working translator on the homepage */}
          <div className="mx-auto mt-10 max-w-4xl">
            <Translator id="translator" />
            <p className="mt-3 text-center text-xs text-slate-400">
              Anonymous translations stay in your browser ·{" "}
              <Link href="/signup" className="underline hover:text-indigo-600">
                Sign up free
              </Link>{" "}
              for synced history
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features-h" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 id="features-h" className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Everything you need to work across languages
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          One platform for translation, writing, documents, and speech — built on a modular AI
          provider architecture.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{f.body}</p>
              <Link
                href={f.href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {f.cta} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-h" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 id="how-h" className="text-center text-3xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <ol className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white"
                >
                  {s.n}
                </p>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tone & style showcase */}
      <section aria-labelledby="tone-h" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 id="tone-h" className="text-center text-3xl font-bold tracking-tight text-slate-900">
          The right voice for every audience
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          The same sentence, translated seven ways. Pick a tone and style before you translate —
          the AI adapts wording, formality, and sentence structure.
        </p>
        <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">7 tones</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TONES.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-800 ring-1 ring-indigo-100"
                >
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-slate-500">
              From casual chat to academic papers and marketing copy.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">4 styles</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <li
                  key={s}
                  className="rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-slate-500">
              Natural fluency, literal fidelity, professional polish, or concise brevity.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section aria-labelledby="pricing-h" id="pricing" className="scroll-mt-20 border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 id="pricing-h" className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Simple pricing
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Start free. Upgrade when your words do. Billing is architected for subscriptions —
            plans below are live from the API.
          </p>
          <div className="mx-auto mt-10 max-w-5xl">
            <PricingTeaser />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-h" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 id="faq-h" className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Frequently asked questions
        </h2>
        <div className="mt-8">
          <Faq items={FAQ} idPrefix="home-faq" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-indigo-700 px-6 py-14 text-center shadow-xl sm:px-12">
          <h2 className="text-3xl font-bold text-white">{SITE_TAGLINE}</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Join free and get 100+ languages, AI writing tools, and your own translation history.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#translator"
              className="rounded-xl bg-white px-8 py-3 font-semibold text-indigo-700 shadow transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Start Translating
            </a>
            <Link
              href="/signup"
              className="rounded-xl border border-indigo-400 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
