import { MapPinned, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

type PlanTripCardProps = {
  onPlanTrip: () => void;
};

export function PlanTripCard({ onPlanTrip }: PlanTripCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <MapPinned className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-foreground">Plan a trip</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add current location, pickup, and delivery to build a route.
          </p>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-5 h-12 w-full rounded-2xl text-sm font-semibold"
        onClick={onPlanTrip}
      >
        <Plus className="size-5" aria-hidden />
        Plan New Trip
      </Button>
    </section>
  );
}
