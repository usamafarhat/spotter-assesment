type TripRouteTimelineProps = {
  origin: string;
  destination: string;
};

export function TripRouteTimeline({ origin, destination }: TripRouteTimelineProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <div className="size-3 rounded-full border-2 border-muted-foreground/40 bg-card" />
        <div className="my-1 w-px flex-1 min-h-8 bg-border" />
        <div className="size-3 rounded-full bg-primary" />
      </div>

      <div className="flex flex-1 flex-col gap-5 pb-1">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Origin
          </p>
          <p className="text-sm font-semibold text-foreground">{origin}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Destination
          </p>
          <p className="text-sm font-semibold text-foreground">{destination}</p>
        </div>
      </div>
    </div>
  );
}
