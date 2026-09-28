import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PolyTranslate AI — Translate Anything. Understand Everyone.",
    template: "%s | PolyTranslate AI",
  },
  description:
    "Fast, natural, context-aware AI translation for people, businesses, students, and creators. 100+ languages, documents, speech, and writing tools.",
  openGraph: {
    type: "website",
    siteName: "PolyTranslate AI",
    title: "PolyTranslate AI — Translate Anything. Understand Everyone.",
    description:
      "Fast, natural, context-aware AI translation for people, businesses, students, and creators.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolyTranslate AI — Translate Anything. Understand Everyone.",
    description:
      "Fast, natural, context-aware AI translation for people, businesses, students, and creators.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-slate-900 antialiased">
        <AuthProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
