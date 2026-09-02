import { Truck, User } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-5 pt-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Truck className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-foreground">
            Hauler ELD
          </p>
          <p className="text-xs text-muted-foreground">
            Smart Logistics &amp; Compliance
          </p>
        </div>
      </div>

      <div
        className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-secondary ring-2 ring-border"
        aria-label="User profile"
      >
        <User className="size-5 text-muted-foreground" aria-hidden />
      </div>
    </header>
  );
}
