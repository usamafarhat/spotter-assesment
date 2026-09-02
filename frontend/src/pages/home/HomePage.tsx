import { Plus } from "lucide-react";
import { useTrips } from "@/api/EldPlanner/modules/trips";
import { ActiveTripCard } from "@/components/home/ActiveTripCard";
import { ActiveTripCardSkeleton } from "@/components/home/ActiveTripCardSkeleton";
import { RecentTripCard } from "@/components/home/RecentTripCard";
import { RecentTripCardSkeleton } from "@/components/home/RecentTripCardSkeleton";
import { AppHeader } from "@/components/layout/AppHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useNavigation } from "@/context/NavigationContext";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { getActiveTrip, getRecentTrips } from "@/lib/tripDisplay";

const LOAD_ERROR_MESSAGE = "Unable to load trips. Please try again.";

export default function HomePage() {
  const { openPlanTrip } = useNavigation();
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips();

  const activeTrip = getActiveTrip(trips);
  const recentTrips = getRecentTrips(trips, {
    excludeId: activeTrip?.id,
    limit: 5,
  });

  return (
    <div className="flex flex-1 flex-col pb-4">
      <AppHeader />

      <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, Jack
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready for your next trip?
          </p>
        </section>

        <Button
          size="lg"
          className="h-12 w-full rounded-2xl text-sm font-semibold"
          onClick={openPlanTrip}
        >
          <Plus className="size-5" aria-hidden />
          Plan New Trip
        </Button>

        {isError && (
          <Alert variant="error">
            <AlertTitle>Could not load trips</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{getErrorMessage(error, LOAD_ERROR_MESSAGE)}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Current Active Trip</h2>
          {isLoading ? (
            <ActiveTripCardSkeleton />
          ) : activeTrip ? (
            <ActiveTripCard trip={activeTrip} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No active trip right now.</p>
            </div>
          )}
        </section>

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
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No recent trips yet. Plan your first trip above.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
