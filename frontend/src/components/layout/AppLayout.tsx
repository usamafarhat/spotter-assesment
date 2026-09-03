import { Outlet } from "react-router-dom";
import { APP_SHELL_WIDTH_CLASS } from "@/lib/appShell";
import { cn } from "@/lib/cn";
import { BottomTabBar } from "./BottomTabBar";

export function AppLayout() {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <div
        className={cn(
          "mx-auto flex min-h-0 flex-1 flex-col overflow-hidden border-x border-slate-200 bg-white",
          APP_SHELL_WIDTH_CLASS,
        )}
      >
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
