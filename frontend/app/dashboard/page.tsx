import type { Metadata } from "next";
import { Protected } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your PolyTranslate AI usage dashboard — characters used, translations, documents, and plan.",
  alternates: { canonical: canonical("/dashboard") },
};

export default function DashboardPage() {
  return (
    <Protected>
      <DashboardClient />
    </Protected>
  );
}
