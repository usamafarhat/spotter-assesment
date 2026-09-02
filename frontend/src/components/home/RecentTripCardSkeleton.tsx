import { Skeleton } from "../ui/Skeleton";

export function RecentTripCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      aria-busy="true"
      aria-label="Loading trip"
    >
      <Skeleton className="size-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 max-w-[220px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="size-6 shrink-0 rounded-lg" />
    </div>
  );
}
