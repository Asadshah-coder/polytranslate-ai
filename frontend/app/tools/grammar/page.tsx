import type { Metadata } from "next";
import GrammarClient from "./GrammarClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Grammar Corrector",
  description:
    "Fix grammar, spelling, and punctuation with AI — while preserving your meaning. Free online grammar checker.",
  alternates: { canonical: canonical("/tools/grammar") },
};

export default function GrammarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Grammar Corrector</h1>
      <p className="mt-3 text-slate-600">
        Paste your text and let AI fix grammar, spelling, and punctuation — without changing what
        you meant to say.
      </p>
      <div className="mt-8">
        <GrammarClient />
      </div>
    </div>
  );
}
