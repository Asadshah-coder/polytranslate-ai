import Link from "next/link";

const PAIR_LINKS = [
  { href: "/english-to-urdu", label: "English to Urdu" },
  { href: "/urdu-to-english", label: "Urdu to English" },
  { href: "/english-to-arabic", label: "English to Arabic" },
  { href: "/english-to-spanish", label: "English to Spanish" },
  { href: "/english-to-french", label: "English to French" },
  { href: "/english-to-hindi", label: "English to Hindi" },
];

const TOOL_LINKS = [
  { href: "/tools/grammar", label: "Grammar Corrector" },
  { href: "/tools/paraphrase", label: "Paraphraser" },
  { href: "/tools/summarize", label: "Summarizer" },
  { href: "/tools/back-translate", label: "Back Translation" },
  { href: "/tools/documents", label: "Document Translation" },
  { href: "/tools/speech", label: "Speech Translation" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-slate-900">
            PolyTranslate <span className="text-indigo-600">AI</span>
          </p>
          <p className="mt-2 text-sm text-slate-600">Translate Anything. Understand Everyone.</p>
          <p className="mt-3 text-sm text-slate-500">
            Context-aware AI translation across 100+ languages, with writing tools, documents, and speech.
          </p>
        </div>
        <nav aria-label="Popular translations">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Popular pairs</p>
          <ul className="space-y-2 text-sm">
            {PAIR_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600">
                  {l.label} translator
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Tools">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Tools</p>
          <ul className="space-y-2 text-sm">
            {TOOL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Company</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/languages" className="text-slate-600 hover:text-indigo-700">All languages</Link></li>
            <li><Link href="/blog" className="text-slate-600 hover:text-indigo-700">Blog</Link></li>
            <li><Link href="/#pricing" className="text-slate-600 hover:text-indigo-700">Pricing</Link></li>
            <li><Link href="/privacy" className="text-slate-600 hover:text-indigo-700">Privacy policy</Link></li>
            <li><Link href="/terms" className="text-slate-600 hover:text-indigo-700">Terms of service</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PolyTranslate AI. All rights reserved.</p>
          <p>Machine translation is an aid, not a substitute for professional review of legal or medical text.</p>
        </div>
      </div>
    </footer>
  );
}
