import { Maximize2, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import type { EldLogDay } from "../lib/eldLogUtils";
import { EldLogChart } from "./EldLogChart";
import { ELD_CHART_WIDTH } from "./chartLayout";

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

type EldLogChartViewportProps = {
  day: EldLogDay;
};

export function EldLogChartViewport({ day }: EldLogChartViewportProps) {
  const [zoom, setZoom] = useState(1);
  const [largeView, setLargeView] = useState(false);

  function adjustZoom(delta: number) {
    setZoom((current) => {
      const next = Math.round((current + delta) * 100) / 100;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner">
        <ChartToolbar
          zoom={zoom}
          onZoomOut={() => adjustZoom(-ZOOM_STEP)}
          onZoomIn={() => adjustZoom(ZOOM_STEP)}
          onOpenLarge={() => setLargeView(true)}
        />
        <ChartScroller day={day} zoom={zoom} />
      </div>

      {largeView ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close large grid"
            onClick={() => setLargeView(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Large ELD grid for ${day.dateLabel}`}
            className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                  Driver&apos;s daily log
                </p>
                <p className="text-sm font-bold text-foreground">{day.dateLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <ZoomControls
                  zoom={zoom}
                  onZoomOut={() => adjustZoom(-ZOOM_STEP)}
                  onZoomIn={() => adjustZoom(ZOOM_STEP)}
                />
                <button
                  type="button"
                  onClick={() => setLargeView(false)}
                  className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Close large grid"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <ChartScroller day={day} zoom={zoom} fill />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ChartScroller({
  day,
  zoom,
  fill = false,
}: {
  day: EldLogDay;
  zoom: number;
  fill?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <div
        style={{
          width: fill ? `${zoom * 100}%` : ELD_CHART_WIDTH * zoom,
          minWidth: ELD_CHART_WIDTH * zoom,
        }}
      >
        <EldLogChart day={day} />
      </div>
    </div>
  );
}

function ChartToolbar({
  zoom,
  onZoomOut,
  onZoomIn,
  onOpenLarge,
}: {
  zoom: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onOpenLarge: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5">
      <span className="px-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        Grid
      </span>
      <div className="flex items-center gap-1.5">
        <ZoomControls zoom={zoom} onZoomOut={onZoomOut} onZoomIn={onZoomIn} />
        <button
          type="button"
          onClick={onOpenLarge}
          className="flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-foreground"
          aria-label="Open large grid"
          title="Larger view"
        >
          <Maximize2 className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function ZoomControls({
  zoom,
  onZoomOut,
  onZoomIn,
}: {
  zoom: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
}) {
  return (
    <div className="flex items-center rounded-md border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM}
        className="flex size-7 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        aria-label="Zoom out"
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className="min-w-10 text-center font-mono text-[11px] font-bold text-slate-600">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM}
        className="flex size-7 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        aria-label="Zoom in"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
