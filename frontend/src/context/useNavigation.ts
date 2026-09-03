import { createContext, useContext } from "react";
import type { AppTab } from "../types/navigation";

export type NavigationContextValue = {
  activeTab: AppTab;
  isPlanTripOpen: boolean;
  selectedLogsTripId: number | null;
  navigateToTab: (tab: AppTab) => void;
  openPlanTrip: () => void;
  closePlanTrip: () => void;
  openTripDetail: (tripId: number) => void;
  openLogsForTrip: (tripId: number) => void;
  setSelectedLogsTripId: (tripId: number | null) => void;
};

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
