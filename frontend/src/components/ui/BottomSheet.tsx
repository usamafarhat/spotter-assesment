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
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center lg:p-6">
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
          "relative z-10 flex max-h-[92vh] flex-col bg-card shadow-2xl",
          "rounded-t-3xl",
          APP_SHELL_WIDTH_CLASS,
          "lg:max-h-[min(92vh,840px)] lg:max-w-2xl lg:rounded-2xl",
          className,
        )}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <span className="h-1 w-12 rounded-full bg-border" aria-hidden />
        </div>
        {children}
      </div>
    </div>
  );
}
