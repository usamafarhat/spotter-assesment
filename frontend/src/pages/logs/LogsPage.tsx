import { useEffect, useMemo } from "react";
import { useTrips } from "@/api/EldPlanner/modules/trips";
import { EldLogDayStack, TripLogPicker } from "@/components/logs";
import { AppHeader } from "@/components/layout/AppHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNavigation } from "@/context/NavigationContext";
import { getErrorMessage } from "@/lib/getErrorMessage";

const LOAD_ERROR_MESSAGE = "Unable to load trips. Please try again.";

export default function LogsPage() {
  const { selectedLogsTripId, setSelectedLogsTripId, openPlanTrip } = useNavigation();
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips();

  const tripsWithLogs = useMemo(
    () => trips.filter((trip) => (trip.duty_segments?.length ?? 0) > 0),
    [trips],
  );

  const pickerTrips = tripsWithLogs.length > 0 ? tripsWithLogs : trips;

  const activeTripId = useMemo(() => {
    if (pickerTrips.length === 0) {
      return null;
    }

    if (
      selectedLogsTripId != null &&
      pickerTrips.some((trip) => trip.id === selectedLogsTripId)
    ) {
      return selectedLogsTripId;
    }

    return pickerTrips[0].id;
  }, [pickerTrips, selectedLogsTripId]);

  useEffect(() => {
    if (activeTripId != null && activeTripId !== selectedLogsTripId) {
      setSelectedLogsTripId(activeTripId);
    }
  }, [activeTripId, selectedLogsTripId, setSelectedLogsTripId]);

  const selectedTrip =
    activeTripId == null ? undefined : trips.find((trip) => trip.id === activeTripId);

  return (
    <div className="flex flex-1 flex-col pb-4">
      <AppHeader />

      <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            FMCSA-style daily ELD grids from your trip duty segments.
          </p>
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

        {isLoading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading logs">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-medium text-foreground">No trips yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan a trip first to generate ELD log sheets.
            </p>
            <Button className="mt-4 rounded-xl" onClick={openPlanTrip}>
              Plan New Trip
            </Button>
          </div>
        ) : (
          <>
            <TripLogPicker
              trips={pickerTrips}
              selectedTripId={activeTripId}
              onSelectTrip={setSelectedLogsTripId}
            />

            {selectedTrip ? (
              <EldLogDayStack segments={selectedTrip.duty_segments ?? []} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
