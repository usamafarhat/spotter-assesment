import { Plus } from "lucide-react";
import { useTrips } from "@/api/EldPlanner/modules/trips";
import { RecentTripCard } from "@/components/home/RecentTripCard";
import { RecentTripCardSkeleton } from "@/components/home/RecentTripCardSkeleton";
import { AppHeader } from "@/components/layout/AppHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useNavigation } from "@/context/NavigationContext";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { toTripListItem } from "@/lib/tripDisplay";

const LOAD_ERROR_MESSAGE = "Unable to load trips. Please try again.";

export default function TripsPage() {
  const { openPlanTrip } = useNavigation();
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips();

  const tripItems = trips.map((trip) => toTripListItem(trip));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AppHeader />

      <div className="flex flex-1 flex-col gap-6 px-5 pb-4 pt-5">
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Trips
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All planned and completed routes
            </p>
          </div>
          <Button
            size="sm"
            className="h-auto shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold"
            onClick={openPlanTrip}
          >
            <Plus className="size-3.5 shrink-0" aria-hidden />
            New
          </Button>
        </section>

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

        <section aria-label="List of planned and completed trips" className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <RecentTripCardSkeleton key={index} />
            ))
          ) : tripItems.length > 0 ? (
            tripItems.map((trip) => <RecentTripCard key={trip.id} trip={trip} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <p className="text-sm font-medium text-foreground">No trips yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a trip to see it listed here.
              </p>
              <Button className="mt-4 rounded-full" onClick={openPlanTrip}>
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
