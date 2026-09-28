import type { Metadata } from "next";
import SignupClient from "./SignupClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free PolyTranslate AI account — synced translation history, usage dashboard, and higher limits.",
  alternates: { canonical: canonical("/signup") },
};

export default function SignupPage() {
  return <SignupClient />;
}
