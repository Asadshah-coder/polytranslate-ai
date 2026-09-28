import type { Metadata } from "next";
import LanguagesClient from "./LanguagesClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Languages",
  description:
    "Browse all 100+ languages supported by PolyTranslate AI — with native names, locales, and right-to-left markers.",
  alternates: { canonical: canonical("/languages") },
  openGraph: {
    title: "All Languages | PolyTranslate AI",
    description: "Browse 100+ supported languages with native names and RTL support.",
    url: canonical("/languages"),
    type: "website",
  },
};

export default function LanguagesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Supported languages
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Every language below comes live from the translation API&apos;s language registry — names,
        native names, text direction, and locales. Nothing here is a hard-coded list.
      </p>
      <LanguagesClient />
    </div>
  );
}
