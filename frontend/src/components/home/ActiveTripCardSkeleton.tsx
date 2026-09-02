import { Skeleton } from "../ui/Skeleton";

export function ActiveTripCardSkeleton() {
  return (
    <div
      className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm"
      aria-busy="true"
      aria-label="Loading active trip"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="size-5 rounded" />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col items-center pt-1">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="my-1 h-8 w-px" />
          <Skeleton className="size-3 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col gap-5 pb-1">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
