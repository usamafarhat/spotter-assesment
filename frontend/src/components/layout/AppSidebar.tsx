import { Plus, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNavigation } from "@/context/useNavigation";
import { Button } from "@/components/ui/Button";
import { DRIVER_NAME, ProfileAvatar } from "./ProfileAvatar";
import { NAV_TABS } from "./navTabs";

export function AppSidebar() {
  const { activeTab, navigateToTab, openPlanTrip } = useNavigation();

  return (
    <aside
      className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex xl:w-64"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Truck className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold leading-tight tracking-tight text-foreground">
            ELD Planner
          </p>
          <p className="mt-0.5 truncate text-[11px] font-medium leading-tight text-muted-foreground">
            Trip Planner & ELD Logs
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          type="button"
          className="h-10 w-full rounded-xl text-sm font-semibold"
          onClick={openPlanTrip}
        >
          <Plus className="size-4" aria-hidden />
          Plan new trip
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              data-nav-tab=""
              onClick={() => navigateToTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150",
                isActive
                  ? "bg-info-subtle font-bold text-info"
                  : "font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground",
              )}
            >
              <Icon
                className={cn("size-4.5", isActive ? "stroke-[2.5]" : "stroke-2")}
                aria-hidden
              />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <ProfileAvatar size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{DRIVER_NAME}</p>
            <p className="truncate text-[11px] text-muted-foreground">Driver</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
