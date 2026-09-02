import { ArrowLeft, User } from "lucide-react";
import { Button } from "../ui/Button";

type PlanTripHeaderProps = {
  onBack: () => void;
};

export function PlanTripHeader({ onBack }: PlanTripHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="size-9 p-0"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Button>

        <p className="text-center text-base font-bold text-foreground">Hauler ELD</p>

        <div
          className="flex size-9 items-center justify-center rounded-full bg-secondary"
          aria-label="User profile"
        >
          <User className="size-4 text-muted-foreground" aria-hidden />
        </div>
      </div>
    </header>
  );
}
