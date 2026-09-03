import { EldLogDayCard } from "./card/EldLogDayCard";
import type { TripLogGroup } from "./lib/logsFilter";
import { tripFilterLabel, tripRouteLabel } from "@/lib/tripDisplay";

type LogsResultListProps = {
  groups: TripLogGroup[];
  showTripTitles: boolean;
};

export function LogsResultList({ groups, showTripTitles }: LogsResultListProps) {
  const singleCard =
    groups.length === 1 && groups[0]?.entries.length === 1;

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.trip.id} className="space-y-3" aria-label={tripRouteLabel(group.trip)}>
          {showTripTitles ? (
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {tripFilterLabel(group.trip)}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {tripRouteLabel(group.trip)}
              </p>
            </div>
          ) : null}

          {group.entries.map((entry) => (
            <EldLogDayCard
              key={`${entry.trip.id}-${entry.day.dateKey}`}
              entry={entry}
              defaultExpanded={singleCard}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
