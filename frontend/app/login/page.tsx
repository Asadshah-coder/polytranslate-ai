import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to PolyTranslate AI to sync your translation history and track usage.",
  alternates: { canonical: canonical("/login") },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
