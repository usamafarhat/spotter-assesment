import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";
import { DRIVER_NAME, ProfileAvatar } from "./ProfileAvatar";

type PlanTripHeaderProps = {
  onBack: () => void;
};

export function PlanTripHeader({ onBack }: PlanTripHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border bg-card px-4 py-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
          <ArrowLeft className="size-5" aria-hidden />
        </Button>

        <p className="text-center text-base font-bold text-foreground">Spotter</p>

        <span className="justify-self-end" aria-label={`${DRIVER_NAME}'s profile`}>
          <ProfileAvatar size="sm" />
        </span>
      </div>
    </header>
  );
}
