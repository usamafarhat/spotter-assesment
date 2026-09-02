import type { EldLogDay } from "./lib/eldLogUtils";
import { EldLogChart } from "./chart";
import { EldLogTotalsPanel } from "./totals";

type EldLogGridProps = {
  day: EldLogDay;
};

export function EldLogGrid({ day }: EldLogGridProps) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
      aria-label={`ELD log for ${day.dateLabel}`}
    >
      <header className="border-b border-border bg-secondary/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Driver&apos;s daily log
        </p>
        <p className="mt-0.5 text-sm font-bold text-foreground">{day.dateLabel}</p>
      </header>

      <div className="flex items-start">
        <div className="min-w-0 flex-1 overflow-x-auto py-3 pl-2">
          <EldLogChart day={day} />
        </div>

        <EldLogTotalsPanel blocks={day.blocks} />
      </div>
    </article>
  );
}
