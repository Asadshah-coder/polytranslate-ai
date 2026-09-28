"use client";

import { useState } from "react";
import { ApiError, summarize, type SummaryFormat } from "@/lib/api";
import CopyButton from "@/components/CopyButton";

const FORMATS: { value: SummaryFormat; label: string; hint: string }[] = [
  { value: "short", label: "Short", hint: "A tight 2–3 sentence summary" },
  { value: "bullets", label: "Bullets", hint: "Key points as a list" },
  { value: "detailed", label: "Detailed", hint: "A fuller structured overview" },
];

export default function SummarizeClient() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState<SummaryFormat>("short");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (text.trim().length < 50) {
      setError("Please enter at least 50 characters to summarize.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await summarize(text.trim(), format);
      setSummary(res.summary);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Summarization failed. Please try again.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const bullets =
    format === "bullets" && summary
      ? summary.split("\n").map((b) => b.replace(/^[-•*\d.)\s]+/, "").trim()).filter(Boolean)
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="summarize-input" className="mb-1.5 block text-sm font-medium text-slate-700">
        Text to summarize
      </label>
      <textarea
        id="summarize-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        maxLength={10000}
        placeholder="Paste an article, report, or long notes here…"
        className="w-full resize-y rounded-xl border border-slate-300 p-4 text-base leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-slate-700">Summary format</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {FORMATS.map((f) => (
            <label
              key={f.value}
              className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors focus-within:outline-2 focus-within:outline-indigo-600 ${
                format === f.value ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="summary-format"
                value={f.value}
                checked={format === f.value}
                onChange={() => setFormat(f.value)}
                className="sr-only"
              />
              <span className="font-semibold text-slate-900">{f.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{f.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex items-center justify-end gap-3">
        <span className="text-xs tabular-nums text-slate-500">{text.length.toLocaleString()} chars</span>
        <button
          type="button"
          onClick={run}
          disabled={loading || text.trim().length < 50}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {loading ? "Summarizing…" : "Summarize"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h2>
          {bullets ? (
            <ul className="mt-2 list-disc space-y-2 rounded-xl bg-slate-50 p-4 pl-9 text-slate-900">
              {bullets.map((b, i) => (
                <li key={i} className="leading-relaxed">{b}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-900">{summary}</p>
          )}
          <div className="mt-3"><CopyButton text={summary} /></div>
        </div>
      )}
    </div>
  );
}
