"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getLanguages, type Language } from "@/lib/api";
import { PAIR_SLUGS } from "@/lib/seo";

const CODE_TO_SLUG_NAME: Record<string, string> = {
  ur: "urdu", ar: "arabic", es: "spanish", fr: "french", de: "german",
  hi: "hindi", fa: "persian", pt: "portuguese", ru: "russian", zh: "chinese", tr: "turkish",
};

/** Link a language to a dedicated pair page when one exists. */
function pairLinkFor(code: string): string | null {
  if (code === "en") return "/english-to-spanish";
  const name = CODE_TO_SLUG_NAME[code];
  if (!name) return null;
  const slug = PAIR_SLUGS.find((s) => s === `english-to-${name}` || s === `${name}-to-english`);
  return slug ? `/${slug}` : null;
}

export default function LanguagesClient() {
  const [languages, setLanguages] = useState<Language[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getLanguages()
      .then((r) => setLanguages(r.languages))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load languages."));
  }, []);

  const filtered = useMemo(() => {
    if (!languages) return [];
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native_name.toLowerCase().includes(q) ||
        l.code.toLowerCase() === q,
    );
  }, [languages, query]);

  if (error) {
    return (
      <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-800">Couldn&apos;t load the language list</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="lang-search" className="sr-only">Search languages</label>
        <input
          id="lang-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, native name, or code…"
          className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <p className="text-sm text-slate-500" aria-live="polite">
          {languages ? `${filtered.length} of ${languages.length} languages` : "Loading…"}
        </p>
      </div>

      {!languages ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading languages">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">No languages match “{query}”.</p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => {
            const link = pairLinkFor(l.code);
            const card = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{l.name}</p>
                    <p className="text-lg text-slate-700" lang={l.code} dir={l.direction}>
                      {l.native_name}
                    </p>
                  </div>
                  {l.direction === "rtl" && (
                    <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                      RTL
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {l.code} · {l.locale}
                </p>
              </>
            );
            return (
              <li
                key={l.code}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {link ? (
                  <Link href={link} className="block focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-xl">
                    {card}
                    <span className="mt-2 inline-block text-xs font-semibold text-indigo-600">
                      Open translator →
                    </span>
                  </Link>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
