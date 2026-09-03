import { cn } from "../../lib/cn";
import { useNavigation } from "../../context/useNavigation";
import { MOBILE_NAV_TABS, type NavTabConfig } from "./navTabs";

function TabButton({
  tab,
  isActive,
  onSelect,
}: {
  tab: NavTabConfig;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      data-nav-tab=""
      onClick={onSelect}
      aria-current={isActive ? "page" : undefined}
      className="group flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5"
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg transition-colors duration-150",
          isActive ? "bg-info-subtle" : "group-hover:bg-slate-100",
        )}
      >
        <Icon
          className={cn(
            "size-[22px] transition-colors duration-150",
            isActive
              ? "stroke-[2.5] text-info"
              : "stroke-2 text-muted-foreground group-hover:text-foreground",
          )}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "text-[11px] tracking-tight transition-colors duration-150",
          isActive
            ? "font-bold text-info"
            : "font-medium text-muted-foreground group-hover:text-foreground",
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
      className="shrink-0 border-t border-[#f1f5f9] bg-card pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.02)] lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-stretch">
        {MOBILE_NAV_TABS.map((tab) => (
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
