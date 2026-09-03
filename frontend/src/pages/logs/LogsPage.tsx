import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTrips } from "@/api/EldPlanner/modules/trips";
import { DatePickerSheet } from "@/components/logs/picker/DatePickerSheet";
import { LogsFilterBar } from "@/components/logs/picker/LogsFilterBar";
import { TripPickerSheet } from "@/components/logs/picker/TripPickerSheet";
import { LogsResultList } from "@/components/logs/LogsResultList";
import { LogsTripMetrics } from "@/components/logs/LogsTripMetrics";
import {
  buildTripLogEntries,
  collectLogDateKeys,
  dateSheetSubtitle,
  filterTripLogEntries,
  formatLogDayShortLabel,
  groupTripLogEntries,
  latestTripId,
  parseLogDateKey,
  parseTripFilterParam,
} from "@/components/logs/lib";
import { AppHeader } from "@/components/layout/AppHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNavigation } from "@/context/useNavigation";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { tripFilterLabel } from "@/lib/tripDisplay";

const LOAD_ERROR_MESSAGE = "Unable to load trips. Please try again.";

export default function LogsPage() {
  const { selectedLogsTripId, setSelectedLogsTripId, openPlanTrip } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips();
  const [tripSheetOpen, setTripSheetOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  const allEntries = useMemo(() => buildTripLogEntries(trips), [trips]);
  const tripParam = parseTripFilterParam(searchParams.get("trip"), trips);
  const selectedDateKey = parseLogDateKey(searchParams.get("day"));
  const defaultTripId = latestTripId(trips);

  const selectedTripId = useMemo(() => {
    if (tripParam === "all") {
      return null;
    }

    if (typeof tripParam === "number") {
      return tripParam;
    }

    if (
      selectedLogsTripId != null &&
      trips.some((trip) => trip.id === selectedLogsTripId)
    ) {
      return selectedLogsTripId;
    }

    return defaultTripId;
  }, [defaultTripId, selectedLogsTripId, tripParam, trips]);

  const selectedTrip =
    selectedTripId == null
      ? undefined
      : trips.find((trip) => trip.id === selectedTripId);

  const visibleEntries = useMemo(
    () => filterTripLogEntries(allEntries, selectedTripId, selectedDateKey),
    [allEntries, selectedDateKey, selectedTripId],
  );

  const groups = useMemo(
    () => groupTripLogEntries(visibleEntries, trips),
    [trips, visibleEntries],
  );

  const availableDateKeys = useMemo(
    () => collectLogDateKeys(allEntries, selectedTripId),
    [allEntries, selectedTripId],
  );

  function updateFilters(next: { tripId?: number | null; day?: string | null }) {
    const tripId = next.tripId === undefined ? selectedTripId : next.tripId;
    const day = next.day === undefined ? selectedDateKey : next.day;

    setSelectedLogsTripId(tripId);

    const params = new URLSearchParams();
    if (tripId == null) {
      params.set("trip", "all");
    } else {
      params.set("trip", String(tripId));
    }

    if (day) {
      params.set("day", day);
    }

    setSearchParams(params, { replace: true });
  }

  const tripLabel = selectedTrip ? tripFilterLabel(selectedTrip) : "All trips";
  const dateLabel = selectedDateKey
    ? formatLogDayShortLabel(selectedDateKey)
    : "All days";
  const dateSubtitle = dateSheetSubtitle(
    selectedTrip ? tripFilterLabel(selectedTrip) : null,
    [...availableDateKeys],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-slate-100">
        <AppHeader />
        <div className="space-y-3 px-4 pt-4 pb-3">
          <section>
            <h1 className="text-[28px] font-extrabold tracking-tight text-foreground">
              Logs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily 24-hour duty logs for each trip
            </p>
          </section>

          {isLoading ? (
            <div className="grid grid-cols-12 gap-2">
              <Skeleton className="col-span-7 h-14 rounded-xl" />
              <Skeleton className="col-span-5 h-14 rounded-xl" />
            </div>
          ) : trips.length > 0 ? (
            <div className="space-y-2">
              <LogsFilterBar
                tripLabel={tripLabel}
                dateLabel={dateLabel}
                dateSelected={selectedDateKey != null}
                onOpenTripPicker={() => setTripSheetOpen(true)}
                onOpenDatePicker={() => setDateSheetOpen(true)}
              />
              {selectedTrip ? <LogsTripMetrics trip={selectedTrip} /> : null}
            </div>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
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
        ) : groups.length > 0 ? (
          <LogsResultList groups={groups} showTripTitles={selectedTripId == null} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No ELD logs for this filter
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedDateKey && selectedTripId == null
                ? "No trips have a log on this date."
                : selectedDateKey
                  ? "This trip has no log on that date. Clear the date or pick another day."
                  : "This trip has no duty segments yet."}
            </p>
          </div>
        )}
      </div>

      {trips.length > 0 ? (
        <>
          <TripPickerSheet
            open={tripSheetOpen}
            trips={trips}
            selectedTripId={selectedTripId}
            onClose={() => setTripSheetOpen(false)}
            onSelectTrip={(tripId) => {
              updateFilters({ tripId });
              setTripSheetOpen(false);
            }}
          />

          <DatePickerSheet
            key={dateSheetOpen ? `open-${selectedDateKey ?? "all"}` : "closed"}
            open={dateSheetOpen}
            selectedDateKey={selectedDateKey}
            availableDateKeys={availableDateKeys}
            subtitle={dateSubtitle}
            onClose={() => setDateSheetOpen(false)}
            onSelectDate={(dateKey) => {
              updateFilters({ day: dateKey });
              setDateSheetOpen(false);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
