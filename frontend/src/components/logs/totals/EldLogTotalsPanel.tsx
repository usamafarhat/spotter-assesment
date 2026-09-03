import { cn } from "@/lib/cn";
import {
  buildGrandTotalDisplay,
  buildStatusTotalsDisplay,
  ELD_DUTY_ROWS,
} from "../lib/eldLogUtils";

type EldLogTotalsPanelProps = {
  blocks: Parameters<typeof buildStatusTotalsDisplay>[0];
};

const DIGIT_CLASS: Record<string, string> = {
  off_duty: "border-blue-300 bg-white text-slate-800",
  sleeper: "border-blue-300 bg-white text-slate-800",
  driving: "border-emerald-400 bg-emerald-50/50 text-emerald-900",
  on_duty: "border-amber-300 bg-amber-50/50 text-amber-900",
  total: "border-blue-400 bg-blue-50 text-blue-900",
};

const COLON_CLASS: Record<string, string> = {
  off_duty: "text-slate-400",
  sleeper: "text-slate-400",
  driving: "text-emerald-500",
  on_duty: "text-amber-500",
  total: "text-blue-500",
};

export function EldLogTotalsPanel({ blocks }: EldLogTotalsPanelProps) {
  const statusTotals = buildStatusTotalsDisplay(blocks);
  const grandTotal = buildGrandTotalDisplay(blocks);

  return (
    <aside
      className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5"
      aria-label="Total hours by duty status"
    >
      <div className="mb-2 flex items-center justify-between px-0.5">
        <span className="text-[9px] font-extrabold tracking-tight text-blue-700 uppercase">
          Hours &amp; Mins
        </span>
        <span className="text-[8px] text-slate-500">00, 15, 30, 45</span>
      </div>

      <div className="space-y-1.5">
        {statusTotals.map((row) => (
          <div key={row.status} className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase">
              {row.label}
            </span>
            <HoursMinutesEntry
              hours={row.hours}
              minutes={row.minutes}
              tone={row.status}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
        <span className="text-[8px] font-extrabold tracking-tight text-blue-700 uppercase">
          Total 24 Hours
        </span>
        <HoursMinutesEntry
          hours={grandTotal.hours}
          minutes={grandTotal.minutes}
          tone="total"
        />
      </div>

      <ul className="sr-only">
        {ELD_DUTY_ROWS.map((row, index) => (
          <li key={row.status}>
            {row.label}: {statusTotals[index].hours} hours {statusTotals[index].minutes}{" "}
            minutes
          </li>
        ))}
        <li>
          Grand total: {grandTotal.hours} hours {grandTotal.minutes} minutes
        </li>
      </ul>
    </aside>
  );
}

function HoursMinutesEntry({
  hours,
  minutes,
  tone,
}: {
  hours: string;
  minutes: string;
  tone: string;
}) {
  return (
    <div className="flex gap-0.5">
      <DigitCell digit={hours[0]} tone={tone} />
      <DigitCell digit={hours[1]} tone={tone} />
      <span className={cn("self-center font-bold", COLON_CLASS[tone])}>:</span>
      <DigitCell digit={minutes[0]} tone={tone} />
      <DigitCell digit={minutes[1]} tone={tone} />
    </div>
  );
}

function DigitCell({ digit, tone }: { digit: string; tone: string }) {
  return (
    <span
      className={cn(
        "flex h-5 w-4 items-center justify-center rounded border font-mono text-[11px] font-bold",
        DIGIT_CLASS[tone],
      )}
    >
      {digit}
    </span>
  );
}
