"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBillingPlans, type Plan } from "@/lib/api";

/** Pricing cards rendered from GET /billing/plans — real plan data, no hard-coding. */
export default function PricingTeaser() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getBillingPlans()
      .then((r) => setPlans(r.plans))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="text-center text-sm text-slate-500">
        Pricing is unavailable right now — the plans API couldn&apos;t be reached. Please try again later.
      </p>
    );
  }

  if (!plans) {
    return (
      <div className="grid gap-6 md:grid-cols-3" aria-label="Loading plans">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`flex flex-col rounded-2xl border p-6 ${
            plan.id === "pro"
              ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100"
              : "border-slate-200 bg-white"
          }`}
        >
          <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
          <p className="mt-2">
            <span className="text-3xl font-bold text-slate-900">${plan.price_usd}</span>
            <span className="text-sm text-slate-500"> / month</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {plan.monthly_characters.toLocaleString()} characters / month
          </p>
          <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden="true" className="text-emerald-600">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              plan.id === "pro"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {plan.price_usd === 0 ? "Start for free" : `Choose ${plan.name}`}
          </Link>
        </div>
      ))}
    </div>
  );
}
