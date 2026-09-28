"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VoicePlayerProps {
  text: string;
  langCode?: string;
  compact?: boolean;
}

/**
 * Text-to-speech using the browser's REAL speechSynthesis voice list.
 * Never invents voices: the dropdown lists exactly what the browser reports.
 */
export default function VoicePlayer({ text, langCode, compact }: VoicePlayerProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      // Prefer a voice matching the target language (e.g. "ur", "ur-PK").
      if (!voiceURI && list.length && langCode) {
        const match =
          list.find((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase())) ||
          list.find((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase().slice(0, 2)));
        if (match) setVoiceURI(match.voiceURI);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, langCode]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const play = useCallback(() => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else if (langCode) {
      utter.lang = langCode;
    }
    utter.rate = rate;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  }, [supported, text, voices, voiceURI, langCode, rate]);

  const pause = useCallback(() => {
    if (!supported) return;
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    else window.speechSynthesis.pause();
  }, [supported]);

  if (!supported) {
    return (
      <p className="text-sm text-slate-500">
        Your browser doesn&apos;t support built-in speech playback.
      </p>
    );
  }

  const matchingVoices = langCode
    ? voices.filter((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase().slice(0, 2)))
    : [];

  return (
    <div className={compact ? "space-y-2" : "rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3"}>
      <div className="flex flex-wrap items-center gap-2">
        {!speaking ? (
          <button
            type="button"
            onClick={play}
            disabled={!text.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="Play translation aloud"
          >
            ▶ Play
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={pause}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Pause / Resume
            </button>
            <button
              type="button"
              onClick={stop}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              Stop
            </button>
          </>
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Speed
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.25}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            aria-label="Speech speed"
            className="w-24 accent-indigo-600"
          />
          <span className="tabular-nums text-xs">{rate.toFixed(2)}×</span>
        </label>
      </div>
      <div>
        <label htmlFor={compact ? "voice-compact" : "voice-full"} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Voice
        </label>
        <select
          id={compact ? "voice-compact" : "voice-full"}
          value={voiceURI}
          onChange={(e) => setVoiceURI(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Default voice{langCode ? ` for ${langCode}` : ""}</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang}){v.default ? " — default" : ""}
            </option>
          ))}
        </select>
        {langCode && voices.length > 0 && matchingVoices.length === 0 && (
          <p className="mt-1.5 text-xs text-amber-700">
            Your browser/OS doesn&apos;t provide a voice for this language, so playback will use a default voice and pronunciation may be off. Voice availability varies by device.
          </p>
        )}
        <p className="mt-1.5 text-xs text-slate-400">Voices come from your browser and operating system.</p>
      </div>
    </div>
  );
}
