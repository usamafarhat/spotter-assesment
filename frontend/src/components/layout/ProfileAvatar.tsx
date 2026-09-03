import { cn } from "@/lib/cn";

const DRIVER_INITIAL = "J";
const DRIVER_NAME = "Jack";

type ProfileAvatarProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ProfileAvatar({ size = "md", className }: ProfileAvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold tracking-tight text-white",
        size === "sm" && "size-9 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-11 text-sm",
        className,
      )}
      aria-hidden
    >
      {DRIVER_INITIAL}
    </span>
  );
}

export { DRIVER_NAME };
