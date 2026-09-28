import type { Metadata } from "next";
import DocumentsClient from "./DocumentsClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Document Translation",
  description:
    "Translate whole documents — upload TXT, DOCX, or PDF and download the translated file. Structure-preserving AI document translation.",
  alternates: { canonical: canonical("/tools/documents") },
};

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Document Translation</h1>
      <p className="mt-3 text-slate-600">
        Upload a document and get the translated file back. Text is extracted, translated in chunks,
        and reconstructed into your chosen output format.
      </p>
      <div className="mt-8">
        <DocumentsClient />
      </div>
    </div>
  );
}
