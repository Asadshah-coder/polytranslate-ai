"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  clearHistory,
  deleteHistoryItem,
  getHistory,
  type HistoryItem,
} from "@/lib/api";
import { REUSE_KEY } from "@/components/Translator";

const PAGE_SIZE = 20;

export default function HistoryClient() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Debounce search input → server-side ?search=
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebounced(query.trim()), 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const load = useCallback(async (search: string, offset: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await getHistory(search || undefined, PAGE_SIZE, offset);
      setItems((prev) => (append ? [...prev, ...res.items] : res.items));
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Could not load history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(debounced, 0, false);
  }, [debounced, load]);

  const remove = async (id: number) => {
    try {
      await deleteHistoryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Could not delete that entry.");
    }
  };

  const clearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    try {
      await clearHistory();
      setItems([]);
      setTotal(0);
      setConfirmClear(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Could not clear history.");
    }
  };

  const reuse = (item: HistoryItem) => {
    try {
      window.sessionStorage.setItem(
        REUSE_KEY,
        JSON.stringify({
          source_lang: item.source_lang,
          target_lang: item.target_lang,
          source_text: item.source_text,
        }),
      );
    } catch {
      /* ignore */
    }
    router.push("/#translator");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Translation history</h1>
          <p className="mt-2 text-slate-600">
            {total.toLocaleString()} saved translation{total === 1 ? "" : "s"}. Click any entry to
            view it, reuse it, or delete it.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            onBlur={() => setConfirmClear(false)}
            className={`rounded-xl px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 ${
              confirmClear
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {confirmClear ? "Click again to confirm" : "Clear all"}
          </button>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor="history-search" className="sr-only">Search history</label>
        <input
          id="history-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your translations…"
          className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6 space-y-3" aria-label="Loading history">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-medium text-slate-700">
            {debounced ? `No translations match “${debounced}”.` : "No translations yet."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Translations you make while signed in are saved here automatically.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {items.map((item) => {
              const isOpen = expanded === item.id;
              return (
                <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-lg"
                    >
                      <p className="truncate text-sm text-slate-800">
                        <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {item.source_lang} → {item.target_lang}
                        </span>
                        {item.source_text}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">{item.translated_text}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleString()} · {item.tone} · {item.style}
                      </p>
                    </button>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => reuse(item)}
                        title="Load into translator"
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        Reuse
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        title="Delete this entry"
                        aria-label={`Delete translation from ${item.source_lang} to ${item.target_lang}`}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-red-300 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Original ({item.source_lang})</p>
                        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-800">{item.source_text}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Translation ({item.target_lang})</p>
                        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-indigo-50/60 p-3 text-sm text-slate-800">{item.translated_text}</p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {items.length < total && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => load(debounced, items.length, true)}
                disabled={loadingMore}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {loadingMore ? "Loading…" : `Load more (${(total - items.length).toLocaleString()} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
