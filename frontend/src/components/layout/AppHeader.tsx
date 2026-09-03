import { Truck, User } from "lucide-react";

export function AppHeader() {
  return (
    <header className="w-full bg-background">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Truck className="size-5" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-[17px] font-bold leading-tight tracking-tight text-foreground">
              Hauler ELD
            </p>
            <p className="mt-0.5 truncate text-xs font-medium leading-tight text-muted-foreground">
              Smart Logistics &amp; Compliance
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Profile"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-[#e2e8f0]"
        >
          <User className="size-[22px]" aria-hidden />
        </button>
      </div>
    </header>
  );
}
