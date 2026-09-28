"use client";

import { useRef, useState } from "react";
import {
  ApiError,
  synthesizeSpeech,
  transcribeAudio,
  translate as apiTranslate,
} from "@/lib/api";
import { directionOf, useLanguages } from "@/lib/use-languages";
import LanguageSelect from "@/components/LanguageSelect";
import AudioRecorder from "@/components/AudioRecorder";
import VoicePlayer from "@/components/VoicePlayer";
import CopyButton from "@/components/CopyButton";

export default function SpeechClient() {
  const { languages, loading: langsLoading } = useLanguages();

  // Transcribe state
  const [transcript, setTranscript] = useState("");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [transcribeUnsupported, setTranscribeUnsupported] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Translate state
  const [target, setTarget] = useState("en");
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  // Server TTS state
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [ttsUnsupported, setTtsUnsupported] = useState(false);

  const handleAudio = async (blob: Blob) => {
    setTranscribing(true);
    setTranscribeError(null);
    setTranscribeUnsupported(false);
    try {
      const res = await transcribeAudio(blob);
      setTranscript(res.transcript);
      setDetectedLang(res.language_code);
      setTranslation(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 501) {
        setTranscribeUnsupported(true);
      } else {
        setTranscribeError(e instanceof ApiError ? e.detail : "Transcription failed. Please try again.");
      }
    } finally {
      setTranscribing(false);
    }
  };

  const handleUploadFile = (f: File | undefined | null) => {
    if (f) handleAudio(f);
  };

  const runTranslate = async () => {
    if (!transcript.trim()) {
      setTranslateError("Transcribe or type something first.");
      return;
    }
    setTranslating(true);
    setTranslateError(null);
    try {
      const res = await apiTranslate({
        text: transcript.trim(),
        source_lang: "auto",
        target_lang: target,
      });
      setTranslation(res.translated_text);
      setTtsUrl(null);
    } catch (e) {
      setTranslateError(e instanceof ApiError ? e.detail : "Translation failed. Please try again.");
      setTranslation(null);
    } finally {
      setTranslating(false);
    }
  };

  const runServerTts = async () => {
    if (!translation) return;
    setTtsLoading(true);
    setTtsError(null);
    setTtsUnsupported(false);
    try {
      const { blob } = await synthesizeSpeech(translation, target, null, 1.0);
      if (ttsUrl) URL.revokeObjectURL(ttsUrl);
      setTtsUrl(URL.createObjectURL(blob));
    } catch (e) {
      if (e instanceof ApiError && e.status === 501) {
        setTtsUnsupported(true);
      } else {
        setTtsError(e instanceof ApiError ? e.detail : "Speech synthesis failed. Please try again.");
      }
    } finally {
      setTtsLoading(false);
    }
  };

  const targetDir = languages.length ? directionOf(languages, target) : "ltr";

  return (
    <div className="space-y-6">
      {/* Step 1: get speech in */}
      <section aria-labelledby="speech-step1" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="speech-step1" className="text-lg font-semibold text-slate-900">
          1 · Provide audio
        </h2>
        <div className="mt-4">
          <AudioRecorder onAudio={handleAudio} disabled={transcribing} />
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-slate-400">or</span>
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              disabled={transcribing}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              Upload audio file
            </button>
            <input
              ref={uploadRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
              className="sr-only"
              aria-label="Upload audio file"
              onChange={(e) => {
                handleUploadFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <span className="text-xs text-slate-400">mp3 · wav · m4a · ogg · webm</span>
          </div>
        </div>

        {transcribing && (
          <p className="mt-3 text-sm text-slate-600" role="status">
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 align-[-2px]" aria-hidden="true" />
            Transcribing audio…
          </p>
        )}
        {transcribeUnsupported && (
          <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Speech transcription isn&apos;t configured on this server yet. You can still type (or paste) a
            transcript below and translate it.
          </p>
        )}
        {transcribeError && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {transcribeError}
          </p>
        )}

        <label htmlFor="speech-transcript" className="mb-1.5 mt-4 block text-sm font-medium text-slate-700">
          Transcript {detectedLang ? <span className="font-normal text-slate-500">(detected: {detectedLang})</span> : null}
        </label>
        <textarea
          id="speech-transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={4}
          placeholder="Your transcript will appear here — or type it directly."
          className="w-full resize-y rounded-xl border border-slate-300 p-4 text-base leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </section>

      {/* Step 2: translate */}
      <section aria-labelledby="speech-step2" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="speech-step2" className="text-lg font-semibold text-slate-900">
          2 · Translate
        </h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-64">
            <LanguageSelect
              id="speech-target"
              label="Target language"
              value={target}
              onChange={setTarget}
              languages={languages}
              loading={langsLoading}
            />
          </div>
          <button
            type="button"
            onClick={runTranslate}
            disabled={translating || !transcript.trim()}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {translating ? "Translating…" : "Translate transcript"}
          </button>
        </div>

        {translateError && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {translateError}
          </p>
        )}

        {translation && (
          <div className="mt-4">
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-900" dir={targetDir} lang={target}>
              {translation}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton text={translation} />
            </div>
          </div>
        )}
      </section>

      {/* Step 3: listen */}
      <section aria-labelledby="speech-step3" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="speech-step3" className="text-lg font-semibold text-slate-900">
          3 · Listen
        </h2>
        {!translation ? (
          <p className="mt-2 text-sm text-slate-500">Translate something first, then play it back here.</p>
        ) : (
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">Browser voices (instant)</h3>
              <VoicePlayer text={translation} langCode={target} />
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-medium text-slate-700">Server-generated audio</h3>
              <p className="mt-1 text-xs text-slate-500">
                Uses the configured text-to-speech provider, when one is set up on the server.
              </p>
              <button
                type="button"
                onClick={runServerTts}
                disabled={ttsLoading}
                className="mt-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {ttsLoading ? "Generating…" : "Generate audio file"}
              </button>
              {ttsUnsupported && (
                <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Server text-to-speech isn&apos;t configured yet — the browser voices above still work.
                </p>
              )}
              {ttsError && (
                <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {ttsError}
                </p>
              )}
              {ttsUrl && (
                <div className="mt-3">
                  <audio controls src={ttsUrl} className="w-full">
                    Your browser doesn&apos;t support audio playback.
                  </audio>
                  <a
                    href={ttsUrl}
                    download="translation-audio"
                    className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Download audio
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
