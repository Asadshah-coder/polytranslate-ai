"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  translate as apiTranslate,
  type Tone,
  type TranslateResponse,
  type TranslateStyle,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { directionOf, useLanguages } from "@/lib/use-languages";
import LanguageSelect from "./LanguageSelect";
import VoicePlayer from "./VoicePlayer";

const TONES: { value: Tone; label: string }[] = [
  { value: "general", label: "General" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "academic", label: "Academic" },
  { value: "marketing", label: "Marketing" },
  { value: "technical", label: "Technical" },
];

const STYLES: { value: TranslateStyle; label: string }[] = [
  { value: "natural", label: "Natural" },
  { value: "literal", label: "Literal" },
  { value: "professional", label: "Professional" },
  { value: "concise", label: "Concise" },
];

const LOCAL_HISTORY_KEY = "polytranslate_local_history";
export const REUSE_KEY = "polytranslate_reuse";

interface LocalHistoryItem {
  source_lang: string;
  target_lang: string;
  source_text: string;
  translated_text: string;
  tone: string;
  style: string;
  created_at: string;
}

function readLocalHistory(): LocalHistoryItem[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface TranslatorProps {
  initialSource?: string;
  initialTarget?: string;
  initialText?: string;
  /** Fallback output direction when the language list can't load. */
  fallbackDirection?: "ltr" | "rtl";
  id?: string;
}

export default function Translator({
  initialSource = "auto",
  initialTarget = "ur",
  initialText = "",
  fallbackDirection = "ltr",
  id = "translator",
}: TranslatorProps) {
  const { languages, loading: langsLoading } = useLanguages();
  const { user } = useAuth();
  const router = useRouter();

  const [source, setSource] = useState(initialSource);
  const [target, setTarget] = useState(initialTarget);
  const [text, setText] = useState(initialText);
  const [tone, setTone] = useState<Tone>("general");
  const [style, setStyle] = useState<TranslateStyle>("natural");
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showListen, setShowListen] = useState(false);
  const [localHistory, setLocalHistory] = useState<LocalHistoryItem[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  // "Reuse" from the history page arrives via sessionStorage.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(REUSE_KEY);
      if (raw) {
        const r = JSON.parse(raw) as { source_lang?: string; target_lang?: string; source_text?: string };
        if (r.source_lang) setSource(r.source_lang);
        if (r.target_lang) setTarget(r.target_lang);
        if (r.source_text) setText(r.source_text);
        window.sessionStorage.removeItem(REUSE_KEY);
      }
    } catch {
      /* ignore */
    }
    setLocalHistory(readLocalHistory());
  }, []);

  const doTranslate = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text to translate.");
      return;
    }
    if (trimmed.length > 10000) {
      setError("Text is too long. Maximum is 10,000 characters.");
      return;
    }
    if (source !== "auto" && source === target) {
      setError("Source and target languages must be different.");
      return;
    }
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await apiTranslate({ text: trimmed, source_lang: source, target_lang: target, tone, style });
      setResult(res);
      // Anonymous users: keep a browser-local history (signed-in users get server history).
      if (!user) {
        const entry: LocalHistoryItem = {
          source_lang: res.source_lang,
          target_lang: res.target_lang,
          source_text: trimmed,
          translated_text: res.translated_text,
          tone,
          style,
          created_at: new Date().toISOString(),
        };
        const next = [entry, ...readLocalHistory()].slice(0, 20);
        try {
          window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(next));
        } catch {
          /* storage full/blocked — non-fatal */
        }
        setLocalHistory(next);
      }
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Translation failed. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [text, source, target, tone, style, user]);

  const swap = () => {
    if (source === "auto") return;
    setSource(target);
    setTarget(source);
    setResult(null);
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.translated_text);
    } catch {
      // Fallback for older browsers / non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = result.translated_text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.translated_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation-${result.target_lang}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setText("");
    setResult(null);
    setError(null);
    setShowListen(false);
  };

  const improveInGrammarTool = () => {
    if (!result) return;
    try {
      window.sessionStorage.setItem("polytranslate_tool_prefill", JSON.stringify({ text: result.translated_text, language: result.target_lang }));
    } catch {
      /* ignore */
    }
    router.push("/tools/grammar");
  };

  const reuseLocal = (item: LocalHistoryItem) => {
    setSource(item.source_lang);
    setTarget(item.target_lang);
    setText(item.source_text);
    setResult(null);
    setError(null);
  };

  const targetDir = languages.length ? directionOf(languages, target) : fallbackDirection;
  const sourceDir = source === "auto" ? undefined : languages.length ? directionOf(languages, source) : undefined;

  return (
    <div id={id} className="scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        {/* Language bar */}
        <div className="flex items-end gap-2 border-b border-slate-200 bg-slate-50/80 p-3 sm:p-4">
          <LanguageSelect
            id={`${id}-source`}
            label="Source language"
            value={source}
            onChange={(c) => {
              setSource(c);
              setResult(null);
            }}
            languages={languages}
            loading={langsLoading}
            includeAuto
          />
          <button
            type="button"
            onClick={swap}
            disabled={source === "auto"}
            title={source === "auto" ? "Turn off auto-detect to swap languages" : "Swap languages"}
            aria-label="Swap source and target languages"
            className="mb-0.5 shrink-0 rounded-xl border border-slate-300 bg-white p-2.5 text-slate-600 shadow-sm transition-colors hover:border-indigo-400 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 4L3 8l4 4M3 8h13M17 12l4 4-4 4M21 16H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <LanguageSelect
            id={`${id}-target`}
            label="Target language"
            value={target}
            onChange={(c) => {
              setTarget(c);
              setResult(null);
            }}
            languages={languages}
            loading={langsLoading}
          />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4">
          <label htmlFor={`${id}-input`} className="sr-only">
            Text to translate
          </label>
          <textarea
            id={`${id}-input`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                doTranslate();
              }
            }}
            dir={sourceDir}
            rows={6}
            maxLength={10000}
            placeholder="Enter text…"
            className="w-full resize-y rounded-xl border border-slate-300 p-4 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={`${id}-tone`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tone
              </label>
              <select
                id={`${id}-tone`}
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <label htmlFor={`${id}-style`} className="ml-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Style
              </label>
              <select
                id={`${id}-style`}
                value={style}
                onChange={(e) => setStyle(e.target.value as TranslateStyle)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-slate-500" aria-live="polite">
                {text.length.toLocaleString()} / 10,000
              </span>
              <button
                type="button"
                onClick={doTranslate}
                disabled={loading || !text.trim()}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                    Translating…
                  </span>
                ) : (
                  "Translate →"
                )}
              </button>
            </div>
          </div>
          <p className="mt-1 text-right text-xs text-slate-400">
            <kbd className="rounded border border-slate-200 bg-slate-100 px-1">Ctrl</kbd> + <kbd className="rounded border border-slate-200 bg-slate-100 px-1">Enter</kbd> to translate
          </p>
        </div>

        {error && (
          <div className="mx-3 mb-3 sm:mx-4" role="alert">
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} className="border-t border-slate-200 bg-slate-50/60 p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500" aria-live="polite">
              <span className="font-semibold text-slate-700">
                {result.target_lang_name} <span className="font-normal text-slate-400">({result.target_lang})</span>
              </span>
              {result.was_auto_detected && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-800">
                  Detected: {result.source_lang_name} (auto-detected)
                  {result.detection_confidence ? ` · confidence: ${result.detection_confidence}` : ""}
                </span>
              )}
              {!result.was_auto_detected && <span>From {result.source_lang_name}</span>}
              <span className="tabular-nums">Original: {result.source_char_count.toLocaleString()} chars</span>
              <span className="tabular-nums">Translated: {result.translated_char_count.toLocaleString()} chars</span>
              <span className="tabular-nums">{result.duration_ms.toLocaleString()} ms</span>
            </div>
            <div
              dir={targetDir}
              lang={result.target_lang}
              className="min-h-28 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-slate-900"
            >
              {result.translated_text}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => setShowListen((v) => !v)}
                aria-expanded={showListen}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {showListen ? "Hide player" : "Listen"}
              </button>
              <button
                type="button"
                onClick={download}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Download .txt
              </button>
              <button
                type="button"
                onClick={improveInGrammarTool}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Improve
              </button>
              <button
                type="button"
                onClick={clear}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-red-300 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Clear
              </button>
            </div>
            {showListen && (
              <div className="mt-3">
                <VoicePlayer text={result.translated_text} langCode={result.target_lang} compact />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Anonymous local history */}
      {!user && localHistory.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Recent in this browser</p>
          <p className="mt-0.5 text-xs text-slate-500">
            You&apos;re not signed in, so these are stored only in this browser. <a href="/signup" className="text-indigo-600 underline">Create a free account</a> for synced history.
          </p>
          <ul className="mt-3 space-y-2">
            {localHistory.slice(0, 5).map((h, i) => (
              <li key={`${h.created_at}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <p className="min-w-0 flex-1 truncate text-sm text-slate-700">
                  <span className="font-medium">{h.source_lang} → {h.target_lang}:</span> {h.source_text}
                </p>
                <button
                  type="button"
                  onClick={() => reuseLocal(h)}
                  className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  Reuse
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
