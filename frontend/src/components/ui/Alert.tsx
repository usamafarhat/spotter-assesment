import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const variants = {
  default: "border-border bg-card text-card-foreground",
  info: "border-info/20 bg-info-subtle text-info",
  success: "border-success/20 bg-success-subtle text-success",
  warning: "border-warning/20 bg-warning-subtle text-warning",
  error: "border-error/20 bg-error-subtle text-error",
} as const;

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
};

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mb-1 font-medium leading-none", className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm opacity-90", className)} {...props} />;
}
