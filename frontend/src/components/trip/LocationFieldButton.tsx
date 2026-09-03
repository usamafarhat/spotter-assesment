import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "../ui/Label";
import { cn } from "../../lib/cn";

type LocationFieldButtonProps = {
  title: string;
  hint: string;
  value: string;
  icon: LucideIcon;
  error?: string;
  showError?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  onClick: () => void;
};

export function LocationFieldButton({
  title,
  hint,
  value,
  icon: Icon,
  error,
  showError = false,
  disabled = false,
  trailing,
  onClick,
}: LocationFieldButtonProps) {
  const hasError = showError && Boolean(error);

  return (
    <div className="space-y-2">
      <Label className={cn(hasError && "text-error")}>{title}</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-invalid={hasError}
          className={cn(
            "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            disabled
              ? "cursor-not-allowed border-input opacity-60"
              : "hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-ring",
            hasError && !disabled
              ? "border-error focus-visible:ring-error/30"
              : !disabled && "border-input",
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
        {trailing}
      </div>
      {hasError && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
