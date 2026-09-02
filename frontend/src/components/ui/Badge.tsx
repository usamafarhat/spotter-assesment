import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const variants = {
  default: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
  primary: "bg-primary text-primary-foreground",
  success: "bg-success-subtle text-success ring-1 ring-inset ring-success/20",
  warning: "bg-warning-subtle text-warning ring-1 ring-inset ring-warning/20",
  error: "bg-error-subtle text-error ring-1 ring-inset ring-error/20",
  info: "bg-info-subtle text-info ring-1 ring-inset ring-info/20",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
