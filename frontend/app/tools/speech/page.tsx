import type { Metadata } from "next";
import SpeechClient from "./SpeechClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Speech Translation",
  description:
    "Speak or upload audio: speech-to-text, AI translation, and text-to-speech playback. Free online speech translator.",
  alternates: { canonical: canonical("/tools/speech") },
};

export default function SpeechPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Speech Translation</h1>
      <p className="mt-3 text-slate-600">
        Record your voice or upload an audio file — get a transcript, translate it, and listen to
        the result spoken aloud.
      </p>
      <div className="mt-8">
        <SpeechClient />
      </div>
    </div>
  );
}
