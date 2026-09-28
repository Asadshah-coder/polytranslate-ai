"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const TOOL_LINKS = [
  { href: "/tools/grammar", label: "Grammar Corrector" },
  { href: "/tools/paraphrase", label: "Paraphraser" },
  { href: "/tools/summarize", label: "Summarizer" },
  { href: "/tools/back-translate", label: "Back Translation" },
  { href: "/tools/documents", label: "Document Translation" },
  { href: "/tools/speech", label: "Speech Translation" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const linkCls = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${
      pathname === href ? "text-indigo-700 bg-indigo-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-indigo-600" aria-label="PolyTranslate AI home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white" aria-hidden="true">
            P
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            PolyTranslate <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/" className={linkCls("/")}>Translator</Link>
          <Link href="/languages" className={linkCls("/languages")}>Languages</Link>
          <div className="relative">
            <button
              type="button"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              onClick={() => setToolsOpen((v) => !v)}
              onBlur={(e) => {
                if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setToolsOpen(false);
              }}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                pathname.startsWith("/tools") ? "text-indigo-700 bg-indigo-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Tools
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`}>
                <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {toolsOpen && (
              <div role="menu" className="absolute left-0 top-full mt-1 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {TOOL_LINKS.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    role="menuitem"
                    onClick={() => setToolsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/blog" className={linkCls("/blog")}>Blog</Link>
          <Link href="/#pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">
            Pricing
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link href="/dashboard" className={linkCls("/dashboard")}>Dashboard</Link>
              <Link href="/history" className={linkCls("/history")}>History</Link>
              <span className="max-w-32 truncate text-sm text-slate-500" title={user.email}>{user.name}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className={linkCls("/")}>Translator</Link>
            <Link href="/languages" onClick={() => setMenuOpen(false)} className={linkCls("/languages")}>Languages</Link>
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tools</p>
            {TOOL_LINKS.map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 pl-6 text-sm text-slate-600 hover:bg-slate-100">
                {t.label}
              </Link>
            ))}
            <Link href="/blog" onClick={() => setMenuOpen(false)} className={linkCls("/blog")}>Blog</Link>
            <Link href="/#pricing" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Pricing</Link>
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white">Dashboard</Link>
                  <button type="button" onClick={() => { logout(); setMenuOpen(false); }} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700">Sign in</Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
