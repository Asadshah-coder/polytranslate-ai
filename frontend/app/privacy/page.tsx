import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PolyTranslate AI handles your data: what is processed, what is stored, what you can delete, and which third-party AI providers are involved.",
  alternates: { canonical: canonical("/privacy") },
};

const SECTIONS = [
  {
    h: "What we process",
    body: [
      "To translate your text, we send it to the configured AI provider (OpenAI or Gemini, depending on server configuration) along with your chosen tone and style. The provider returns a translation; we don't send anything else about you.",
      "Uploaded documents are parsed to extract their text, which is then translated the same way. Uploaded audio is sent to the speech provider for transcription when one is configured.",
    ],
  },
  {
    h: "What we store — and for whom",
    body: [
      "If you are signed in: every successful translation is saved to your private history (source text, translation, languages, tone, style, timestamp) so you can search, reuse, or delete it. We also store aggregate usage counters (characters translated, documents, speech requests) to enforce plan limits, plus your account details (name, email, hashed password, plan).",
      "If you are not signed in: we do not create a server-side history for you. Your recent translations are kept only in your own browser's local storage, which you can clear at any time from your browser settings.",
    ],
  },
  {
    h: "What you can delete",
    body: [
      "Signed-in users can delete individual history entries or wipe their entire history from the History page — deletions are permanent. Deleting your history does not delete aggregate usage counters for the current billing period, which we keep to enforce limits.",
      "If you want your account deleted entirely, contact us and we will remove your account, history, and usage records.",
    ],
  },
  {
    h: "Third-party AI providers",
    body: [
      "Translations, grammar correction, paraphrasing, summarization, transcription, and speech synthesis are performed by third-party AI providers configured by the server operator (currently OpenAI and/or Gemini). Your text is transmitted to them over encrypted connections for processing. We do not control their data-retention policies — review the provider's own policy if this matters to you.",
      "API keys for these providers live only on the server and are never exposed to your browser.",
    ],
  },
  {
    h: "Documents and audio",
    body: [
      "Uploaded files are processed to perform the translation you requested. We don't publish, share, or sell your files. Document translations made while signed in create history entries like text translations; the original uploaded file is not kept as a downloadable copy on our side beyond processing.",
    ],
  },
  {
    h: "What we don't do",
    body: [
      "We don't sell your personal data. We don't show you ads based on your translations. We don't claim to be anonymous when you're signed in — your history is tied to your account by design, so you can manage it.",
    ],
  },
  {
    h: "Security",
    body: [
      "Passwords are hashed with bcrypt and never stored in plain text. Access tokens expire, and authenticated endpoints require a valid token. Rate limiting protects the service from abuse. That said, no internet service is perfectly secure — don't translate text you wouldn't trust to a third-party AI provider.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: September 28, 2026</p>
      <p className="mt-4 leading-relaxed text-slate-700">
        Plain-language summary: your translations go to an AI provider to be translated. If you
        have an account, they&apos;re also saved to your private history, which you fully control. We
        don&apos;t sell your data — but we also don&apos;t pretend we store nothing.
      </p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.h} aria-labelledby={s.h.replace(/\W+/g, "-").toLowerCase()}>
            <h2 id={s.h.replace(/\W+/g, "-").toLowerCase()} className="text-xl font-bold text-slate-900">
              {s.h}
            </h2>
            <div className="mt-2 space-y-3">
              {s.body.map((p, i) => (
                <p key={i} className="leading-relaxed text-slate-700">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 ring-1 ring-slate-200">
        Questions about your data? See <Link href="/terms" className="text-indigo-600 underline">Terms of Service</Link> or
        manage your history on the <Link href="/history" className="text-indigo-600 underline">History page</Link>.
      </p>
    </div>
  );
}
