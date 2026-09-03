import { Skeleton } from "../ui/Skeleton";

export function RecentTripCardSkeleton() {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      aria-busy="true"
      aria-label="Loading trip"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 max-w-[220px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="size-5 shrink-0 rounded-sm" />
    </div>
  );
}
