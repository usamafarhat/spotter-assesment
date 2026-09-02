import {
  buildGrandTotalDisplay,
  buildStatusTotalsDisplay,
  ELD_DUTY_ROWS,
} from "../lib/eldLogUtils";
import { ELD_CHART_LAYOUT, ELD_GRID_TOP } from "../chart/chartLayout";

type EldLogTotalsPanelProps = {
  blocks: Parameters<typeof buildStatusTotalsDisplay>[0];
};

function DigitCell({ digit }: { digit: string }) {
  return (
    <span className="flex h-7 w-6 items-center justify-center border border-[#2563eb] bg-white text-base font-bold leading-none text-foreground">
      {digit}
    </span>
  );
}

function HoursMinutesEntry({ hours, minutes }: { hours: string; minutes: string }) {
  return (
    <div className="flex gap-1.5">
      <div className="flex">
        <DigitCell digit={hours[0]} />
        <DigitCell digit={hours[1]} />
      </div>
      <div className="flex">
        <DigitCell digit={minutes[0]} />
        <DigitCell digit={minutes[1]} />
      </div>
    </div>
  );
}

export function EldLogTotalsPanel({ blocks }: EldLogTotalsPanelProps) {
  const statusTotals = buildStatusTotalsDisplay(blocks);
  const grandTotal = buildGrandTotalDisplay(blocks);

  return (
    <aside
      className="w-[7.25rem] shrink-0 border-l border-[#2563eb]/40 bg-white px-2 py-3"
      aria-label="Total hours by duty status"
    >
      <div style={{ paddingTop: ELD_CHART_LAYOUT.marginTop }}>
        <div
          className="mb-0 flex gap-1.5 px-0.5"
          style={{ height: ELD_CHART_LAYOUT.axisHeight }}
        >
          <p className="flex w-[3.25rem] items-end justify-center pb-0.5 text-center text-[8px] font-bold uppercase leading-none text-[#2563eb]">
            Hours
          </p>
          <p className="flex w-[3.25rem] flex-col items-center justify-end text-center text-[7px] font-bold uppercase leading-tight text-[#2563eb]">
            <span>Minutes</span>
            <span className="mt-0.5 font-semibold normal-case text-[#2563eb]/75">
              00, 15, 30, 45
            </span>
          </p>
        </div>

        <div
          style={{
            marginTop:
              ELD_GRID_TOP - ELD_CHART_LAYOUT.marginTop - ELD_CHART_LAYOUT.axisHeight,
          }}
        >
          {statusTotals.map((row) => (
            <div
              key={row.status}
              className="flex items-center px-0.5"
              style={{ height: ELD_CHART_LAYOUT.rowHeight }}
              title={row.label}
            >
              <HoursMinutesEntry hours={row.hours} minutes={row.minutes} />
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[#2563eb]/30 pt-3">
          <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-wide text-[#2563eb]">
            Total Hours
          </p>
          <div className="flex justify-center">
            <HoursMinutesEntry hours={grandTotal.hours} minutes={grandTotal.minutes} />
          </div>
        </div>
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
