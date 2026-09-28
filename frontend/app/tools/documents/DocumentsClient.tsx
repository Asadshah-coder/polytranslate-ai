"use client";

import { useEffect, useState } from "react";
import { ApiError, getSupportedFormats, translateDocument } from "@/lib/api";
import { useLanguages } from "@/lib/use-languages";
import LanguageSelect from "@/components/LanguageSelect";
import FileUpload from "@/components/FileUpload";

const FALLBACK_INPUT = ["txt", "docx", "pdf"];

export default function DocumentsClient() {
  const { languages, loading: langsLoading } = useLanguages();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState("auto");
  const [target, setTarget] = useState("ur");
  const [outputFormat, setOutputFormat] = useState("txt");
  const [inputFormats, setInputFormats] = useState<string[]>(FALLBACK_INPUT);
  const [outputFormats, setOutputFormats] = useState<string[]>(FALLBACK_INPUT);
  const [formatsNote, setFormatsNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    getSupportedFormats()
      .then((r) => {
        if (r.input?.length) setInputFormats(r.input);
        if (r.output?.length) {
          setOutputFormats(r.output);
          setOutputFormat((cur) => (r.output.includes(cur) ? cur : r.output[0]));
        }
      })
      .catch(() => {
        setFormatsNote("Couldn't reach the formats API — showing the standard supported formats.");
      });
  }, []);

  const accept = inputFormats.map((f) => `.${f}`).join(",");

  const run = async () => {
    if (!file) {
      setError("Please choose a document first.");
      return;
    }
    if (source !== "auto" && source === target) {
      setError("Source and target languages must be different.");
      return;
    }
    setLoading(true);
    setError(null);
    setDone(null);
    try {
      const { blob, filename } = await translateDocument(file, source, target, outputFormat);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      setDone(`Translated “${file.name}” — your download has started (${filename}).`);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Document translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <FileUpload
        accept={accept}
        maxSizeMB={10}
        onFile={(f) => {
          setFile(f);
          setError(null);
          setDone(null);
        }}
        label={file ? `Selected: ${file.name}` : "Choose a document"}
        hint={`Supported input: ${inputFormats.join(", ").toUpperCase()} · up to 10 MB`}
      />
      {formatsNote && <p className="mt-2 text-xs text-amber-700">{formatsNote}</p>}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <LanguageSelect
          id="doc-source"
          label="Source language"
          value={source}
          onChange={setSource}
          languages={languages}
          loading={langsLoading}
          includeAuto
        />
        <LanguageSelect
          id="doc-target"
          label="Target language"
          value={target}
          onChange={setTarget}
          languages={languages}
          loading={langsLoading}
        />
        <div className="min-w-0 flex-1">
          <label htmlFor="doc-format" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Output format
          </label>
          <select
            id="doc-format"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {outputFormats.map((f) => (
              <option key={f} value={f}>{f.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={run}
          disabled={loading || !file}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {loading ? "Translating document…" : "Translate document"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {done}
        </p>
      )}

      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        <p className="font-semibold text-slate-600">How it works</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Text is extracted from your file, split into chunks, translated, and rebuilt.</li>
          <li>TXT and DOCX outputs preserve structure faithfully; PDF output is generated from the extracted text, so complex layouts are best-effort.</li>
          <li>Very long documents are capped at the server&apos;s character limit — you&apos;ll get a clear error if yours exceeds it.</li>
        </ul>
      </div>
    </div>
  );
}
