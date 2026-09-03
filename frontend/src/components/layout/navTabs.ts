import { History, LayoutGrid, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppTab } from "@/types/navigation";

export type NavTabConfig = {
  id: AppTab;
  label: string;
  icon: LucideIcon;
};

export const NAV_TABS: NavTabConfig[] = [
  { id: "home", label: "Dashboard", icon: LayoutGrid },
  { id: "trips", label: "Trips", icon: Route },
  { id: "logs", label: "Logs", icon: History },
];

/** Mobile tab bar keeps Dashboard in the center and the shorter Trip label. */
export const MOBILE_NAV_TABS: NavTabConfig[] = [
  { ...NAV_TABS[1], label: "Trip" },
  NAV_TABS[0],
  NAV_TABS[2],
];
