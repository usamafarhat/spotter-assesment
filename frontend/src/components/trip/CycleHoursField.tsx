import { Clock } from "lucide-react";
import { Input } from "../ui/Input";
import { cn } from "../../lib/cn";
import { MAX_CYCLE_HRS } from "../../lib/tripFormValidation";

type CycleHoursFieldProps = {
  value: string;
  error?: string;
  showError?: boolean;
  onChange: (value: string) => void;
};

export function CycleHoursField({
  value,
  error,
  showError = false,
  onChange,
}: CycleHoursFieldProps) {
  const hoursUsed = Math.min(Math.max(parseFloat(value) || 0, 0), MAX_CYCLE_HRS);
  const hoursRemaining = MAX_CYCLE_HRS - hoursUsed;
  const usagePercent = (hoursUsed / MAX_CYCLE_HRS) * 100;
  const hasError = showError && Boolean(error);

  return (
    <div className="space-y-4">
      <div>
        <div className="relative">
          <Clock
            className={cn(
              "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
              hasError ? "text-error" : "text-muted-foreground",
            )}
            aria-hidden
          />
          <Input
            className={cn(
              "pl-9",
              hasError && "border-error focus-visible:ring-error/30",
            )}
            type="number"
            inputMode="decimal"
            min={0}
            max={MAX_CYCLE_HRS}
            step={0.5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. 12.5"
            aria-label="Hours already used, 0 to 70"
            aria-invalid={hasError}
          />
        </div>
        {hasError && (
          <p className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {value !== "" && !hasError && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cycle usage</span>
            <span className="font-medium text-foreground">
              {hoursUsed.toFixed(1)} / {MAX_CYCLE_HRS} hrs
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {hoursRemaining <= 0 ? (
              <>
                Cycle is full. The plan starts with a{" "}
                <span className="font-medium text-foreground">10 hr rest</span> to
                reset hours, then continues.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {hoursRemaining.toFixed(1)} hrs
                </span>{" "}
                remaining in this cycle
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
