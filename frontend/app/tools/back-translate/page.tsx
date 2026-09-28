import type { Metadata } from "next";
import BackTranslateClient from "./BackTranslateClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Back Translation Checker",
  description:
    "Translate text and back again to sanity-check meaning. Free AI back-translation tool — a consistency check, not proof of accuracy.",
  alternates: { canonical: canonical("/tools/back-translate") },
};

export default function BackTranslatePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Back Translation</h1>
      <p className="mt-3 text-slate-600">
        Translate your text into another language and back again. Comparing the round-trip with the
        original helps you spot where meaning drifted.
      </p>
      <div className="mt-8">
        <BackTranslateClient />
      </div>
    </div>
  );
}
