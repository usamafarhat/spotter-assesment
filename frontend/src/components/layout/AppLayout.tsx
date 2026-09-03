import { Outlet } from "react-router-dom";
import { APP_SHELL_WIDTH_CLASS } from "@/lib/appShell";
import { cn } from "@/lib/cn";
import { BottomTabBar } from "./BottomTabBar";

export function AppLayout() {
  return (
    <div
      className={cn(
        "mx-auto flex h-dvh flex-col overflow-hidden bg-background",
        APP_SHELL_WIDTH_CLASS,
      )}
    >
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
