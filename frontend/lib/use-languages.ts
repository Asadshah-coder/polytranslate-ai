"use client";

import { useEffect, useState } from "react";
import { getLanguages, type Language } from "./api";

// Module-level cache so the language list is fetched once per session.
let cache: Language[] | null = null;
let inflight: Promise<Language[]> | null = null;

/** Fetches GET /api/v1/languages once and shares it across components. */
export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = getLanguages()
        .then((r) => {
          cache = r.languages;
          return r.languages;
        })
        .catch((e) => {
          inflight = null;
          throw e;
        });
    }
    inflight
      .then((langs) => {
        setLanguages(langs);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load languages.");
      })
      .finally(() => setLoading(false));
  }, []);

  return { languages, loading, error };
}

/** Text direction for a language code, from fetched data with a safe fallback. */
export function directionOf(languages: Language[], code: string): "ltr" | "rtl" {
  const found = languages.find((l) => l.code === code);
  if (found) return found.direction;
  // Fallback only for well-known RTL codes when the API is unreachable.
  if (["ar", "ur", "fa", "he", "ps", "sd", "ug", "yi", "ku"].includes(code)) return "rtl";
  return "ltr";
}

/** Display name for a language code, from fetched data with code fallback. */
export function nameOf(languages: Language[], code: string): string {
  return languages.find((l) => l.code === code)?.name ?? code;
}
