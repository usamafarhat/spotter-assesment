import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { BottomTabBar } from "./BottomTabBar";

export function AppLayout() {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:bg-background">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
