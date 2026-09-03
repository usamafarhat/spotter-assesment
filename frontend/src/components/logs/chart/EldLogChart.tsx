import type { EldLogDay } from "../lib/eldLogUtils";
import { ELD_DUTY_ROWS, ELD_HOUR_LABELS } from "../lib/eldLogUtils";
import {
  buildLinePath,
  buildVertexPoints,
  ELD_CHART_HEIGHT,
  ELD_CHART_LAYOUT,
  ELD_CHART_WIDTH,
  ELD_GRID_BOTTOM,
  ELD_GRID_TOP,
  HOUR_TICKS,
  minuteToX,
  QUARTER_TICKS,
} from "./chartLayout";

type EldLogChartProps = {
  day: EldLogDay;
};

function HourLabel({ hour, y }: { hour: number; y: number }) {
  const label = ELD_HOUR_LABELS[hour];
  const isNamed = hour === 0 || hour === 12;

  return (
    <text
      x={minuteToX(hour * 60)}
      y={y}
      textAnchor={hour === 0 ? "start" : "middle"}
      fill="#374151"
      fontSize={isNamed ? 7 : 8}
      fontWeight={isNamed ? 700 : 600}
      fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
    >
      {label}
    </text>
  );
}

export function EldLogChart({ day }: EldLogChartProps) {
  const linePath = buildLinePath(day.blocks);
  const vertices = buildVertexPoints(day.blocks);
  const remarksTop = ELD_GRID_BOTTOM + ELD_CHART_LAYOUT.axisHeight + 10;

  return (
    <svg
      viewBox={`0 0 ${ELD_CHART_WIDTH} ${ELD_CHART_HEIGHT}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`ELD log chart for ${day.dateLabel}`}
    >
      {ELD_DUTY_ROWS.map((row, index) => {
        const y =
          ELD_GRID_TOP +
          index * ELD_CHART_LAYOUT.rowHeight +
          ELD_CHART_LAYOUT.rowHeight / 2;
        return (
          <text
            key={row.status}
            x={6}
            y={y}
            dominantBaseline="middle"
            fill="#111827"
            fontSize={8}
            fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
          >
            {row.label}
          </text>
        );
      })}

      {QUARTER_TICKS.map((quarter) => {
        const minute = quarter * 15;
        const x = minuteToX(minute);
        const isHour = quarter % 4 === 0;

        return (
          <g key={`q-${quarter}`}>
            <line
              x1={x}
              x2={x}
              y1={ELD_GRID_TOP}
              y2={ELD_GRID_BOTTOM}
              stroke={isHour ? "#9ca3af" : "#e5e7eb"}
              strokeWidth={isHour ? 1 : 0.5}
            />
            {isHour ? (
              <>
                <line
                  x1={x}
                  x2={x}
                  y1={ELD_GRID_TOP - 4}
                  y2={ELD_GRID_TOP}
                  stroke="#6b7280"
                  strokeWidth={1}
                />
                <line
                  x1={x}
                  x2={x}
                  y1={ELD_GRID_BOTTOM}
                  y2={ELD_GRID_BOTTOM + 4}
                  stroke="#6b7280"
                  strokeWidth={1}
                />
              </>
            ) : (
              <>
                <line
                  x1={x}
                  x2={x}
                  y1={ELD_GRID_TOP - 3}
                  y2={ELD_GRID_TOP}
                  stroke="#9ca3af"
                  strokeWidth={0.75}
                />
                <line
                  x1={x}
                  x2={x}
                  y1={ELD_GRID_BOTTOM}
                  y2={ELD_GRID_BOTTOM + 3}
                  stroke="#9ca3af"
                  strokeWidth={0.75}
                />
              </>
            )}
          </g>
        );
      })}

      {Array.from({ length: ELD_DUTY_ROWS.length + 1 }, (_, row) => {
        const y = ELD_GRID_TOP + row * ELD_CHART_LAYOUT.rowHeight;
        return (
          <line
            key={`row-${row}`}
            x1={ELD_CHART_LAYOUT.labelWidth}
            x2={ELD_CHART_LAYOUT.labelWidth + ELD_CHART_LAYOUT.hourWidth * 24}
            y1={y}
            y2={y}
            stroke="#6b7280"
            strokeWidth={1}
          />
        );
      })}

      <rect
        x={ELD_CHART_LAYOUT.labelWidth}
        y={ELD_GRID_TOP}
        width={ELD_CHART_LAYOUT.hourWidth * 24}
        height={ELD_GRID_BOTTOM - ELD_GRID_TOP}
        fill="none"
        stroke="#111827"
        strokeWidth={1.2}
      />

      {HOUR_TICKS.map((hour) => (
        <HourLabel
          key={`top-${hour}`}
          hour={hour}
          y={ELD_GRID_TOP - 6}
        />
      ))}

      {HOUR_TICKS.map((hour) => (
        <HourLabel
          key={`bottom-${hour}`}
          hour={hour}
          y={ELD_GRID_BOTTOM + 14}
        />
      ))}

      {linePath ? (
        <path
          d={linePath}
          fill="none"
          stroke="#111827"
          strokeWidth={2.5}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      ) : null}

      {vertices.map(([cx, cy], index) => (
        <circle
          key={`v-${index}`}
          cx={cx}
          cy={cy}
          r={3}
          fill="#dc2626"
          stroke="#ffffff"
          strokeWidth={0.75}
        />
      ))}

      <text
        x={6}
        y={remarksTop}
        fill="#374151"
        fontSize={9}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        Remarks
      </text>

      <line
        x1={ELD_CHART_LAYOUT.labelWidth}
        x2={ELD_CHART_LAYOUT.labelWidth + ELD_CHART_LAYOUT.hourWidth * 24}
        y1={remarksTop + 6}
        y2={remarksTop + 6}
        stroke="#6b7280"
        strokeWidth={1}
      />

      {QUARTER_TICKS.filter((quarter) => quarter % 4 === 0).map((quarter) => {
        const x = minuteToX(quarter * 15);
        return (
          <line
            key={`remark-tick-${quarter}`}
            x1={x}
            x2={x}
            y1={remarksTop + 6}
            y2={remarksTop + 10}
            stroke="#6b7280"
            strokeWidth={1}
          />
        );
      })}

      {day.remarks.map((remark) => {
        const x = minuteToX(remark.minute);
        const labelY = remarksTop + 28;
        return (
          <g key={remark.id}>
            <line
              x1={x}
              x2={x}
              y1={remarksTop + 6}
              y2={labelY - 4}
              stroke="#6b7280"
              strokeWidth={1}
            />
            <text
              x={x + 2}
              y={labelY}
              fill="#111827"
              fontSize={8}
              fontFamily="Inter, system-ui, sans-serif"
              transform={`rotate(-45, ${x + 2}, ${labelY})`}
            >
              {remark.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
