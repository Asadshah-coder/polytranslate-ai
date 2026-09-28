import type { Metadata } from "next";
import ParaphraseClient from "./ParaphraseClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Paraphraser",
  description:
    "Rewrite text in a new voice — simple, professional, academic, or creative. Free AI paraphrasing tool with alternatives.",
  alternates: { canonical: canonical("/tools/paraphrase") },
};

export default function ParaphrasePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Paraphraser</h1>
      <p className="mt-3 text-slate-600">
        Restate your text in a different style while keeping the meaning intact — with alternative
        versions to choose from.
      </p>
      <div className="mt-8">
        <ParaphraseClient />
      </div>
    </div>
  );
}
