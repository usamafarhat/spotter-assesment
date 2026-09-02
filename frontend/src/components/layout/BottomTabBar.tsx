import { History, LayoutGrid, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { useNavigation } from "../../context/NavigationContext";
import type { AppTab } from "../../types/navigation";

const tabs: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Dashboard", icon: LayoutGrid },
  { id: "trips", label: "Trip", icon: Route },
  { id: "logs", label: "Logs", icon: History },
];

export function BottomTabBar() {
  const { activeTab, navigateToTab } = useNavigation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateToTab(tab.id)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                isActive
                  ? "font-bold text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-info-subtle",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 transition-colors",
                    isActive ? "stroke-[2.5] text-info" : "stroke-[2]",
                  )}
                  aria-hidden
                />
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
