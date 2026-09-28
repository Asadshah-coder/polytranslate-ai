"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AudioRecorderProps {
  onAudio: (blob: Blob) => void;
  disabled?: boolean;
}

type RecState = "idle" | "recording" | "recorded";

/**
 * Records microphone audio via MediaRecorder and hands the real audio blob
 * to the parent (which uploads it to POST /speech/transcribe).
 * Optionally offers in-browser dictation where SpeechRecognition exists.
 */
export default function AudioRecorder({ onAudio, disabled }: AudioRecorderProps) {
  const [state, setState] = useState<RecState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [dictationSupported] = useState(
    () => typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
  );
  const [dictating, setDictating] = useState(false);
  const [dictationText, setDictationText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const recogRef = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined;
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        cleanup();
        setState("recorded");
        if (blob.size > 0) onAudio(blob);
      };
      rec.start();
      setState("recording");
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied. Allow microphone permission and try again.");
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setState("idle");
  };

  const startDictation = () => {
    setError(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("In-browser dictation isn't supported in this browser. Use recording instead.");
      return;
    }
    const recog = new SR();
    recogRef.current = recog;
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.continuous = true;
    let finalText = "";
    recog.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setDictationText(finalText + interim);
    };
    recog.onerror = () => {
      setDictating(false);
      setError("Dictation hit an error. You can still record audio instead.");
    };
    recog.onend = () => setDictating(false);
    recog.start();
    setDictating(true);
    setDictationText("");
  };

  const stopDictation = () => {
    recogRef.current?.stop();
    setDictating(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {state !== "recording" ? (
          <button
            type="button"
            onClick={start}
            disabled={disabled}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-white" />
            Record audio
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            aria-label="Stop recording"
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-400" />
            Stop ({seconds}s)
          </button>
        )}
        {dictationSupported && (
          <button
            type="button"
            onClick={dictating ? stopDictation : startDictation}
            disabled={disabled}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
            title="Uses your browser's built-in speech recognition; no audio is uploaded"
          >
            {dictating ? "Stop dictation" : "Dictate in browser"}
          </button>
        )}
      </div>

      {dictating || dictationText ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Browser dictation</p>
          <p className="mt-1 text-sm text-slate-800" aria-live="polite">
            {dictationText || "Listening… speak now."}
          </p>
          {!dictating && dictationText && (
            <p className="mt-1 text-xs text-slate-500">Copy the text above into the transcript box if you want to translate it.</p>
          )}
        </div>
      ) : null}

      {!dictationSupported && (
        <p className="text-xs text-slate-500">
          In-browser dictation isn&apos;t available here (it&apos;s a Chrome/Edge feature). Microphone recording works in all modern browsers.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
