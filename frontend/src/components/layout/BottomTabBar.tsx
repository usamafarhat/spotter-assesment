import { History, LayoutGrid, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { useNavigation } from "../../context/NavigationContext";
import type { AppTab } from "../../types/navigation";

type TabConfig = {
  id: AppTab;
  label: string;
  icon: LucideIcon;
};

const tabs: TabConfig[] = [
  { id: "trips", label: "Trip", icon: Route },
  { id: "home", label: "Dashboard", icon: LayoutGrid },
  { id: "logs", label: "Logs", icon: History },
];

function TabButton({
  tab,
  isActive,
  onSelect,
}: {
  tab: TabConfig;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "page" : undefined}
      className="flex min-w-16 flex-col items-center justify-center gap-1 text-[11px] tracking-tight"
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center transition-colors",
          isActive && "rounded-lg bg-info-subtle",
        )}
      >
        <Icon
          className={cn(
            "size-[22px]",
            isActive
              ? "stroke-[2.5] text-info"
              : "stroke-2 text-muted-foreground",
          )}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          isActive
            ? "font-bold text-info"
            : "font-medium text-muted-foreground hover:text-foreground",
        )}
      >
        {tab.label}
      </span>
    </button>
  );
}

export function BottomTabBar() {
  const { activeTab, navigateToTab } = useNavigation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#f1f5f9] bg-card pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.02)]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onSelect={() => navigateToTab(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
}
