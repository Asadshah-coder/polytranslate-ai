import type { Metadata } from "next";
import ForgotClient from "./ForgotClient";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your PolyTranslate AI account.",
  alternates: { canonical: canonical("/forgot-password") },
};

export default function ForgotPasswordPage() {
  return <ForgotClient />;
}
