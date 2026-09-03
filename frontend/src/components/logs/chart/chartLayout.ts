import * as d3 from "d3";
import type { DutyStatus } from "@/api/EldPlanner/modules/trips/dutySegment.types";
import {
  buildEldStepPoints,
  ELD_DUTY_ROWS,
  MINUTES_PER_DAY,
  type EldLogBlock,
} from "../lib/eldLogUtils";

export const ELD_CHART_LAYOUT = {
  labelWidth: 118,
  hourWidth: 36,
  rowHeight: 34,
  axisHeight: 22,
  remarksHeight: 64,
  marginRight: 16,
  marginTop: 10,
} as const;

const GRID_WIDTH = ELD_CHART_LAYOUT.hourWidth * 24;
const GRID_HEIGHT = ELD_CHART_LAYOUT.rowHeight * ELD_DUTY_ROWS.length;

export const ELD_CHART_WIDTH =
  ELD_CHART_LAYOUT.labelWidth + GRID_WIDTH + ELD_CHART_LAYOUT.marginRight;

export const ELD_CHART_HEIGHT =
  ELD_CHART_LAYOUT.marginTop +
  ELD_CHART_LAYOUT.axisHeight +
  GRID_HEIGHT +
  ELD_CHART_LAYOUT.axisHeight +
  ELD_CHART_LAYOUT.remarksHeight +
  12;

const STATUS_ORDER = ELD_DUTY_ROWS.map((row) => row.status);

export const ELD_GRID_TOP = ELD_CHART_LAYOUT.marginTop + ELD_CHART_LAYOUT.axisHeight;
export const ELD_GRID_BOTTOM = ELD_GRID_TOP + GRID_HEIGHT;

export function minuteToX(minute: number): number {
  return ELD_CHART_LAYOUT.labelWidth + (minute / MINUTES_PER_DAY) * GRID_WIDTH;
}

export function statusToY(status: DutyStatus): number {
  const index = STATUS_ORDER.indexOf(status);
  return (
    ELD_GRID_TOP + index * ELD_CHART_LAYOUT.rowHeight + ELD_CHART_LAYOUT.rowHeight / 2
  );
}

export function buildLinePath(blocks: EldLogBlock[]): string {
  const stepPoints = buildEldStepPoints(blocks);
  if (stepPoints.length < 2) {
    return "";
  }

  const linePoints = stepPoints.map(
    (point) => [minuteToX(point.minute), statusToY(point.status)] as [number, number],
  );

  return d3.line()(linePoints) ?? "";
}

export function buildVertexPoints(blocks: EldLogBlock[]): [number, number][] {
  const stepPoints = buildEldStepPoints(blocks);
  return stepPoints.map(
    (point) => [minuteToX(point.minute), statusToY(point.status)] as [number, number],
  );
}

export const HOUR_TICKS = Array.from({ length: 24 }, (_, hour) => hour);
export const QUARTER_TICKS = Array.from({ length: 97 }, (_, quarter) => quarter);
