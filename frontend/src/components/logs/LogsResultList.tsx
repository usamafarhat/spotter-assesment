import { EldLogDayCard } from "./card/EldLogDayCard";
import type { TripLogGroup } from "./lib/logsFilter";
import { tripFilterLabel, tripRouteLabel } from "@/lib/tripDisplay";

type LogsResultListProps = {
  groups: TripLogGroup[];
  showTripTitles: boolean;
};

export function LogsResultList({ groups, showTripTitles }: LogsResultListProps) {
  const firstEntryKey = groups[0]?.entries[0]
    ? `${groups[0].trip.id}-${groups[0].entries[0].day.dateKey}`
    : null;

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section
          key={group.trip.id}
          className="space-y-3"
          aria-label={tripRouteLabel(group.trip)}
        >
          {showTripTitles ? (
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {tripFilterLabel(group.trip)}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {tripRouteLabel(group.trip)}
              </p>
            </div>
          ) : group.entries.length > 1 ? (
            <div>
              <h3 className="text-sm font-bold text-foreground">Daily logs</h3>
              <p className="text-[11px] text-muted-foreground">
                {group.entries.length} daily 24-hour records
              </p>
            </div>
          ) : null}

          {group.entries.map((entry) => {
            const entryKey = `${entry.trip.id}-${entry.day.dateKey}`;

            return (
              <EldLogDayCard
                key={entryKey}
                entry={entry}
                defaultExpanded={entryKey === firstEntryKey}
              />
            );
          })}
        </section>
      ))}
    </div>
  );
}
