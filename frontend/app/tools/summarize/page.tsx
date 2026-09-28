import type { Metadata } from "next";
import SummarizeClient from "./SummarizeClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Text Summarizer",
  description:
    "Summarize long text instantly — short summaries, bullet points, or detailed overviews. Free AI summarizer.",
  alternates: { canonical: canonical("/tools/summarize") },
};

export default function SummarizePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Text Summarizer</h1>
      <p className="mt-3 text-slate-600">
        Turn long articles, reports, or notes into a short summary, bullet points, or a detailed
        overview.
      </p>
      <div className="mt-8">
        <SummarizeClient />
      </div>
    </div>
  );
}
