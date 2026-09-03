import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { TripResponseDto } from "@/api/EldPlanner/modules/trips/trips.types";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { TripStatusBadge } from "@/components/trip/TripStatusBadge";
import { cn } from "@/lib/cn";
import {
  formatRecentTripDateLabel,
  tripFilterLabel,
  tripRouteLabel,
} from "@/lib/tripDisplay";
import { buildEldLogDays } from "../lib";

type TripPickerSheetProps = {
  open: boolean;
  trips: TripResponseDto[];
  selectedTripId: number | null;
  onClose: () => void;
  onSelectTrip: (tripId: number | null) => void;
};

export function TripPickerSheet({
  open,
  trips,
  selectedTripId,
  onClose,
  onSelectTrip,
}: TripPickerSheetProps) {
  const [query, setQuery] = useState("");

  const dayCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const trip of trips) {
      counts.set(trip.id, buildEldLogDays(trip.duty_segments ?? []).length);
    }
    return counts;
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return trips;
    }

    return trips.filter((trip) => {
      const haystack = [
        String(trip.id),
        trip.pickup_location.address,
        trip.delivery_location.address,
        tripFilterLabel(trip),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [query, trips]);

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        setQuery("");
        onClose();
      }}
    >
      <div className="flex max-h-[85vh] flex-col px-5 pb-6">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Select trip</h2>
            <p className="text-xs text-muted-foreground">
              Pick one trip, or view every trip for a date.
            </p>
          </div>
        </div>

        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search trips"
            className="h-11 rounded-xl pl-9"
            aria-label="Search trips"
          />
        </div>

        <ul className="mt-3 space-y-2 overflow-y-auto pb-2">
          <li>
            <TripOption
              selected={selectedTripId == null}
              title="All trips"
              subtitle="Use with a date to see every log that day"
              onSelect={() => {
                onSelectTrip(null);
                setQuery("");
              }}
            />
          </li>
          {filteredTrips.map((trip) => {
            const dayCount = dayCounts.get(trip.id) ?? 0;

            return (
              <li key={trip.id}>
                <TripOption
                  selected={selectedTripId === trip.id}
                  title={tripFilterLabel(trip)}
                  subtitle={`${tripRouteLabel(trip)} · ${formatRecentTripDateLabel(trip.created_at)} · ${dayCount} ${dayCount === 1 ? "day" : "days"}`}
                  status={trip.status}
                  onSelect={() => {
                    onSelectTrip(trip.id);
                    setQuery("");
                  }}
                />
              </li>
            );
          })}
        </ul>

        {filteredTrips.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No trips match that search.
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="mt-2 h-11 w-full rounded-xl"
          onClick={() => {
            setQuery("");
            onClose();
          }}
        >
          Close
        </Button>
      </div>
    </BottomSheet>
  );
}

function TripOption({
  selected,
  title,
  subtitle,
  status,
  onSelect,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  status?: TripResponseDto["status"];
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
        selected
          ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-foreground">{title}</span>
          {status ? <TripStatusBadge status={status} showDot={false} /> : null}
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {subtitle}
        </span>
      </span>
      {selected ? (
        <Check className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
      ) : null}
    </button>
  );
}
