"use client";

import { useState } from "react";
import { ApiError, paraphrase, type ParaphraseStyle } from "@/lib/api";
import CopyButton from "@/components/CopyButton";

const STYLES: { value: ParaphraseStyle; label: string; hint: string }[] = [
  { value: "simple", label: "Simple", hint: "Plain, easy-to-read wording" },
  { value: "professional", label: "Professional", hint: "Polished business tone" },
  { value: "academic", label: "Academic", hint: "Formal, scholarly phrasing" },
  { value: "creative", label: "Creative", hint: "Fresh, expressive rewording" },
];

export default function ParaphraseClient() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<ParaphraseStyle>("professional");
  const [main, setMain] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await paraphrase(text.trim(), style);
      setMain(res.paraphrased_text);
      setAlternatives(res.alternatives ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Paraphrasing failed. Please try again.");
      setMain(null);
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="paraphrase-input" className="mb-1.5 block text-sm font-medium text-slate-700">
        Your text
      </label>
      <textarea
        id="paraphrase-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        maxLength={10000}
        placeholder="Enter the text you want to restate…"
        className="w-full resize-y rounded-xl border border-slate-300 p-4 text-base leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-slate-700">Paraphrasing style</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STYLES.map((s) => (
            <label
              key={s.value}
              className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors focus-within:outline-2 focus-within:outline-indigo-600 ${
                style === s.value ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paraphrase-style"
                value={s.value}
                checked={style === s.value}
                onChange={() => setStyle(s.value)}
                className="sr-only"
              />
              <span className="font-semibold text-slate-900">{s.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{s.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex items-center justify-end gap-3">
        <span className="text-xs tabular-nums text-slate-500">{text.length.toLocaleString()} chars</span>
        <button
          type="button"
          onClick={run}
          disabled={loading || !text.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {loading ? "Rewriting…" : "Paraphrase"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {main && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paraphrased</h2>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-900">{main}</p>
          <div className="mt-3"><CopyButton text={main} /></div>
          {alternatives.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Alternatives</h3>
              <ul className="mt-2 space-y-2">
                {alternatives.map((alt, i) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{alt}</p>
                    <div className="mt-2"><CopyButton text={alt} label="Copy alternative" /></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
