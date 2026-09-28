"use client";

import { useEffect, useState } from "react";
import { ApiError, improveText } from "@/lib/api";
import { useLanguages } from "@/lib/use-languages";
import LanguageSelect from "@/components/LanguageSelect";
import CopyButton from "@/components/CopyButton";

export const TOOL_PREFILL_KEY = "polytranslate_tool_prefill";

export default function GrammarClient() {
  const { languages, loading: langsLoading } = useLanguages();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill when arriving from the translator's "Improve" button.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(TOOL_PREFILL_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { text?: string; language?: string };
        if (p.text) setText(p.text);
        if (p.language) setLanguage(p.language);
        window.sessionStorage.removeItem(TOOL_PREFILL_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const run = async () => {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await improveText(text.trim(), language);
      setResult(res.improved_text);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Grammar correction failed. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="grammar-input" className="mb-1.5 block text-sm font-medium text-slate-700">
        Your text
      </label>
      <textarea
        id="grammar-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        maxLength={10000}
        placeholder="Type or paste text with grammar mistakes…"
        className="w-full resize-y rounded-xl border border-slate-300 p-4 text-base leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="w-56">
          <LanguageSelect
            id="grammar-lang"
            label="Language"
            value={language}
            onChange={setLanguage}
            languages={languages}
            loading={langsLoading}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-slate-500">{text.length.toLocaleString()} chars</span>
          <button
            type="button"
            onClick={run}
            disabled={loading || !text.trim()}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {loading ? "Correcting…" : "Correct grammar"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Corrected text</h2>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-900 leading-relaxed">{result}</p>
          <div className="mt-3">
            <CopyButton text={result} />
          </div>
        </div>
      )}
    </div>
  );
}
