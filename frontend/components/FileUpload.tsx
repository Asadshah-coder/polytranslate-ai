"use client";

import { useCallback, useRef, useState } from "react";

interface FileUploadProps {
  accept: string;
  maxSizeMB?: number;
  onFile: (file: File) => void;
  label: string;
  hint?: string;
}

/** Drag-and-drop + click file picker with client-side size validation. */
export default function FileUpload({ accept, maxSizeMB, onFile, label, hint }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      setError(null);
      if (!file) return;
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSizeMB} MB.`);
        return;
      }
      onFile(file);
    },
    [maxSizeMB, onFile],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
        }`}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-indigo-600">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">Drag &amp; drop or click to browse</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
