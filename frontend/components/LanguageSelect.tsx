"use client";

import type { Language } from "@/lib/api";

interface LanguageSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  languages: Language[];
  loading?: boolean;
  includeAuto?: boolean;
  disabled?: boolean;
}

/** Language dropdown fed by GET /api/v1/languages. Never a hard-coded fake list. */
export default function LanguageSelect({
  id,
  label,
  value,
  onChange,
  languages,
  loading,
  includeAuto,
  disabled,
}: LanguageSelectProps) {
  const sorted = [...languages].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
      >
        {includeAuto && <option value="auto">Auto-detect</option>}
        {loading && <option value="">Loading languages…</option>}
        {!loading &&
          sorted.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name} ({l.native_name})
            </option>
          ))}
        {!loading && sorted.length === 0 && <option value="">No languages available</option>}
      </select>
    </div>
  );
}
