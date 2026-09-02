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
    <div className="flex flex-1 flex-col pb-4">
      <AppHeader />

      <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, Jack
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Recent Trips</h2>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <RecentTripCardSkeleton key={index} />
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <RecentTripCard key={trip.id} trip={trip} />
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-2xl text-sm font-semibold"
                onClick={() => navigateToTab("trips")}
              >
                View all trips
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm font-medium text-foreground">No trips yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Plan a trip to see it listed here.
              </p>
              <Button className="mt-4 rounded-xl" onClick={openPlanTrip}>
                <Plus className="size-4" aria-hidden />
                Plan New Trip
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
