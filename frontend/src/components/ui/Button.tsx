import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-[#252b3b] hover:shadow-md",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-[#e2e8f0] hover:text-foreground",
  outline:
    "border border-border bg-background hover:border-slate-300 hover:bg-slate-100 hover:text-accent-foreground",
  ghost: "text-foreground hover:bg-slate-100 hover:text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-red-600 hover:shadow-md",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
  icon: "size-9 p-0 rounded-full",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-[background-color,box-shadow,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
