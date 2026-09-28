import type { Metadata } from "next";
import { Suspense } from "react";
import ResetClient from "./ResetClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Set new password",
  description: "Choose a new password for your PolyTranslate AI account.",
  alternates: { canonical: canonical("/reset-password") },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetClient />
    </Suspense>
  );
}
