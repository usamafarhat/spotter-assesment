import { Plus } from "lucide-react";
import { useTrips } from "@/api/EldPlanner/modules/trips";
import { PlanTripCard } from "@/components/home/PlanTripCard";
import { RecentTripCard } from "@/components/home/RecentTripCard";
import { RecentTripCardSkeleton } from "@/components/home/RecentTripCardSkeleton";
import { AppHeader } from "@/components/layout/AppHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useNavigation } from "@/context/NavigationContext";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { getRecentTrips } from "@/lib/tripDisplay";

const LOAD_ERROR_MESSAGE = "Unable to load trips. Please try again.";

export default function HomePage() {
  const { openPlanTrip, navigateToTab } = useNavigation();
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips();

  const recentTrips = getRecentTrips(trips, 3);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AppHeader />

      <div className="flex flex-1 flex-col gap-6 px-5 pb-4 pt-5">
        <section className="flex flex-col gap-1">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-foreground">
            Welcome back, Jack
          </h1>
          <p className="text-sm font-normal leading-snug text-muted-foreground">
            Plan a route when you are ready for the next run.
          </p>
        </section>

        <PlanTripCard onPlanTrip={openPlanTrip} />

        {isError && (
          <Alert variant="error">
            <AlertTitle>Could not load trips</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{getErrorMessage(error, LOAD_ERROR_MESSAGE)}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Recent Trips
          </h2>

          {isLoading ? (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <RecentTripCardSkeleton key={index} />
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {recentTrips.map((trip) => (
                <RecentTripCard key={trip.id} trip={trip} />
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-1.5 h-12 w-full rounded-2xl border-input bg-card text-sm font-medium shadow-[0_1px_4px_rgba(0,0,0,0.01)] hover:bg-slate-50 active:bg-slate-100"
                onClick={() => navigateToTab("trips")}
              >
                View all trips
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <p className="text-sm font-medium text-foreground">No trips yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Plan a trip to see it listed here.
              </p>
              <Button
                className="mt-4 h-12 rounded-full px-6 text-[15px] font-semibold"
                onClick={openPlanTrip}
              >
                <Plus className="size-5" aria-hidden />
                Plan New Trip
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
