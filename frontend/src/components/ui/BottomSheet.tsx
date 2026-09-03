import type { ReactNode } from "react";
import { APP_SHELL_WIDTH_CLASS } from "../../lib/appShell";
import { cn } from "../../lib/cn";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 flex max-h-[92vh] flex-col rounded-t-3xl bg-card shadow-2xl",
          APP_SHELL_WIDTH_CLASS,
          className,
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-12 rounded-full bg-border" aria-hidden />
        </div>
        {children}
      </div>
    </div>
  );
}
