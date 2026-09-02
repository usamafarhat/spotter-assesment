import type { LucideIcon } from "lucide-react";
import { Label } from "../ui/Label";
import { cn } from "../../lib/cn";

type LocationFieldButtonProps = {
  title: string;
  hint: string;
  value: string;
  icon: LucideIcon;
  error?: string;
  showError?: boolean;
  onClick: () => void;
};

export function LocationFieldButton({
  title,
  hint,
  value,
  icon: Icon,
  error,
  showError = false,
  onClick,
}: LocationFieldButtonProps) {
  const hasError = showError && Boolean(error);

  return (
    <div className="space-y-2">
      <Label className={cn(hasError && "text-error")}>{title}</Label>
      <button
        type="button"
        onClick={onClick}
        aria-invalid={hasError}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm shadow-sm transition-colors",
          "hover:border-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          hasError
            ? "border-error focus-visible:ring-error/30"
            : "border-input focus-visible:ring-ring",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            hasError ? "text-error" : "text-muted-foreground",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {value || hint}
        </span>
      </button>
      {hasError && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
