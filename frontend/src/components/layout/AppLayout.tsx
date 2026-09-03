import { Outlet } from "react-router-dom";
import { BottomTabBar } from "./BottomTabBar";

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background lg:max-w-xl">
      <main className="flex flex-1 flex-col pb-28">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
