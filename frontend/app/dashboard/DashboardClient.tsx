"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, getBillingPlans, getDashboardStats, type DashboardStats, type Plan } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import UsageBar from "@/components/UsageBar";

export default function DashboardClient() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDashboardStats(), getBillingPlans()])
      .then(([s, p]) => {
        if (!cancelled) {
          setStats(s);
          setPlans(p.plans);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.detail : "Could not load dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">Couldn&apos;t load your dashboard</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const currentPlan = plans?.find((p) => p.id === stats?.plan);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome{user ? `, ${user.name}` : ""} — here&apos;s your real usage, straight from the database.
      </p>

      {!stats ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading dashboard">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</p>
              <p className="mt-1 text-2xl font-bold capitalize text-slate-900">{stats.plan}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Translations</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                {stats.translations_count.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">this month</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                {stats.documents_count.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">this month</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Speech requests</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                {stats.speech_requests.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">this month</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <UsageBar used={stats.chars_used_this_month} limit={stats.chars_limit} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/history"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              View translation history
            </Link>
            <Link
              href="/#translator"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              New translation
            </Link>
          </div>
        </>
      )}

      {/* Plan card */}
      <section aria-labelledby="plan-h" className="mt-10">
        <h2 id="plan-h" className="text-xl font-bold text-slate-900">Your plan</h2>
        {!plans ? (
          <div className="mt-4 h-40 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = stats?.plan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-5 ${isCurrent ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-2">
                    <span className="text-2xl font-bold text-slate-900">${plan.price_usd}</span>
                    <span className="text-sm text-slate-500"> / month</span>
                  </p>
                  <p className="text-sm text-slate-500">{plan.monthly_characters.toLocaleString()} chars / month</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span aria-hidden="true" className="text-emerald-600">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        {currentPlan && (
          <p className="mt-3 text-sm text-slate-500">
            You&apos;re on <strong className="capitalize">{currentPlan.name}</strong>. Plan changes and
            billing are coming soon — the billing system is architected for subscriptions.
          </p>
        )}
      </section>
    </div>
  );
}
