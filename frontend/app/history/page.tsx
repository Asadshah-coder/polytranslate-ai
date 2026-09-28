import type { Metadata } from "next";
import { Protected } from "@/lib/auth";
import HistoryClient from "./HistoryClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Translation History",
  description: "Search, view, reuse, or delete your PolyTranslate AI translation history.",
  alternates: { canonical: canonical("/history") },
};

export default function HistoryPage() {
  return (
    <Protected>
      <HistoryClient />
    </Protected>
  );
}
