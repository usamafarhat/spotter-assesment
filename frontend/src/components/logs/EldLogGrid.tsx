import type { EldLogDay } from "./lib/eldLogUtils";
import { EldLogChartViewport } from "./chart/EldLogChartViewport";
import { EldLogTotalsPanel } from "./totals";

type EldLogGridProps = {
  day: EldLogDay;
};

export function EldLogSheet({ day }: { day: EldLogDay }) {
  return (
    <div className="space-y-2">
      <EldLogChartViewport day={day} />
      <EldLogTotalsPanel blocks={day.blocks} />
    </div>
  );
}

export function EldLogGrid({ day }: EldLogGridProps) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm"
      aria-label={`ELD log for ${day.dateLabel}`}
    >
      <header className="border-b border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Driver&apos;s daily log
        </p>
        <p className="text-sm font-bold text-foreground">{day.dateLabel}</p>
      </header>

      <div className="p-3">
        <EldLogSheet day={day} />
      </div>
    </article>
  );
}
