import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of PolyTranslate AI — acceptable use, limits, and liability.",
  alternates: { canonical: canonical("/terms") },
};

const SECTIONS = [
  {
    h: "The service",
    body: [
      "PolyTranslate AI provides AI-powered translation, writing assistance, document translation, and speech features. The service is provided “as is”, without warranties of any kind.",
    ],
  },
  {
    h: "Machine translation is not perfect",
    body: [
      "AI translation can be fluent and useful, but it can also be wrong — especially with idioms, low-resource languages, and specialized terminology. Do not rely on it alone for legal, medical, financial, or safety-critical content. Have such translations reviewed by a qualified human professional. You are responsible for how you use the output.",
    ],
  },
  {
    h: "Acceptable use",
    body: [
      "You agree not to: violate any law; translate content you have no right to use; attempt to access other users' data; abuse rate limits or circumvent usage caps; upload malware or excessively large files; or use the service to generate spam, misinformation, or harassing content. We may suspend accounts that abuse the service.",
    ],
  },
  {
    h: "Accounts and plans",
    body: [
      "You are responsible for keeping your credentials secret. Free accounts include a monthly character allowance; paid plans raise those limits. Usage is measured in characters processed. Exceeding your plan's limit temporarily blocks further AI requests until the next cycle or an upgrade.",
    ],
  },
  {
    h: "Your content",
    body: [
      "You retain ownership of text, documents, and audio you submit. You grant us the limited right to process it to provide the service (including transmitting it to our AI providers). See the Privacy Policy for what is stored and how to delete it.",
    ],
  },
  {
    h: "Liability",
    body: [
      "To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service — including damages from inaccurate translations. Our total liability is limited to the amount you paid us in the twelve months before the claim (or $0 for free accounts).",
    ],
  },
  {
    h: "Changes",
    body: [
      "We may update these terms as the service evolves. Material changes will be reflected in the “last updated” date below, and continued use after changes means you accept them.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: September 28, 2026</p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-bold text-slate-900">{s.h}</h2>
            <div className="mt-2 space-y-3">
              {s.body.map((p, i) => (
                <p key={i} className="leading-relaxed text-slate-700">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 ring-1 ring-slate-200">
        Related: <Link href="/privacy" className="text-indigo-600 underline">Privacy Policy</Link>
      </p>
    </div>
  );
}
