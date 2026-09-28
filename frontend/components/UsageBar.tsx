interface UsageBarProps {
  used: number;
  limit: number;
  label?: string;
}

/** Real usage meter: characters used vs. monthly limit. */
export default function UsageBar({ used, limit, label = "Characters used" }: UsageBarProps) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const over = limit > 0 && used >= limit;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500" aria-live="polite">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct}%`}
      >
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-indigo-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        {over ? "You've reached this month's limit." : `${pct}% of your monthly allowance used.`}
      </p>
    </div>
  );
}
