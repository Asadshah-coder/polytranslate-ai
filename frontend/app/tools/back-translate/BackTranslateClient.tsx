"use client";

import { useState } from "react";
import { ApiError, backTranslate } from "@/lib/api";
import { directionOf, useLanguages } from "@/lib/use-languages";
import LanguageSelect from "@/components/LanguageSelect";
import CopyButton from "@/components/CopyButton";

export default function BackTranslateClient() {
  const { languages, loading: langsLoading } = useLanguages();
  const [text, setText] = useState("");
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("ur");
  const [result, setResult] = useState<{
    original_text: string;
    translated_text: string;
    back_translated_text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }
    if (source === target) {
      setError("Source and target languages must be different.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await backTranslate(text.trim(), source, target);
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Back-translation failed. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const midDir = languages.length ? directionOf(languages, target) : "ltr";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <LanguageSelect
          id="bt-source"
          label="Source language"
          value={source}
          onChange={setSource}
          languages={languages}
          loading={langsLoading}
        />
        <LanguageSelect
          id="bt-target"
          label="Target language"
          value={target}
          onChange={setTarget}
          languages={languages}
          loading={langsLoading}
        />
      </div>
      <label htmlFor="bt-input" className="mb-1.5 mt-4 block text-sm font-medium text-slate-700">
        Original text
      </label>
      <textarea
        id="bt-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        maxLength={10000}
        placeholder="Enter text to round-trip…"
        className="w-full resize-y rounded-xl border border-slate-300 p-4 text-base leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={run}
          disabled={loading || !text.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {loading ? "Translating…" : "Back-translate"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">1 · Original</h2>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-900">
              {result.original_text}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">2 · Translated</h2>
            <p
              className="mt-2 whitespace-pre-wrap rounded-xl bg-indigo-50 p-4 leading-relaxed text-slate-900"
              dir={midDir}
              lang={target}
            >
              {result.translated_text}
            </p>
            <div className="mt-2"><CopyButton text={result.translated_text} /></div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">3 · Back-translated</h2>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-900">
              {result.back_translated_text}
            </p>
            <div className="mt-2"><CopyButton text={result.back_translated_text} label="Copy back-translation" /></div>
          </div>
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            A close match suggests the meaning survived the round trip — but back-translation is a
            consistency check, not proof of accuracy. Two wrongs can look right.
          </p>
        </div>
      )}
    </div>
  );
}
