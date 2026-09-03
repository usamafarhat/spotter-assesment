import { MapPinned, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

type PlanTripCardProps = {
  onPlanTrip: () => void;
};

export function PlanTripCard({ onPlanTrip }: PlanTripCardProps) {
  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-start gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <MapPinned className="size-5" aria-hidden />
        </div>
        <div className="flex flex-col pt-0.5">
          <h2 className="text-[17px] font-bold leading-tight tracking-tight text-foreground">
            Plan a trip
          </h2>
          <p className="mt-1 text-[13px] font-normal leading-relaxed text-muted-foreground">
            Add current location, pickup, and delivery to build a route.
          </p>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-auto h-12 w-full rounded-full text-[15px] font-semibold shadow-sm"
        onClick={onPlanTrip}
      >
        <Plus className="size-5 shrink-0" aria-hidden />
        Plan New Trip
      </Button>
    </section>
  );
}
