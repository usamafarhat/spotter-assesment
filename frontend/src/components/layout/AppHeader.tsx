import { Truck } from "lucide-react";
import { DRIVER_NAME, ProfileAvatar } from "./ProfileAvatar";

export function AppHeader() {
  return (
    <header className="w-full border-b border-slate-100 bg-white">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Truck className="size-5" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-[17px] font-bold leading-tight tracking-tight text-foreground">
              Spotter
            </p>
            <p className="mt-0.5 truncate text-xs font-medium leading-tight text-muted-foreground">
              Trip Planner & ELD Logs
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`${DRIVER_NAME}'s profile`}
          className="rounded-full transition-opacity hover:opacity-80"
        >
          <ProfileAvatar />
        </button>
      </div>
    </header>
  );
}
