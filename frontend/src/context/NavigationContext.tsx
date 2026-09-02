import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PLAN_TRIP_PATH, TAB_PATHS, type AppTab } from "../types/navigation";

type NavigationContextValue = {
  activeTab: AppTab;
  isPlanTripOpen: boolean;
  selectedTripId: number | null;
  selectedLogsTripId: number | null;
  navigateToTab: (tab: AppTab) => void;
  openPlanTrip: () => void;
  closePlanTrip: () => void;
  openTripDetail: (tripId: number) => void;
  closeTripDetail: () => void;
  openLogsForTrip: (tripId: number) => void;
  setSelectedLogsTripId: (tripId: number | null) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

function getActiveTab(pathname: string): AppTab {
  if (pathname.startsWith("/trips")) return "trips";
  if (pathname.startsWith("/logs")) return "logs";
  return "home";
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedLogsTripId, setSelectedLogsTripId] = useState<number | null>(null);

  const activeTab = getActiveTab(location.pathname);
  const isPlanTripOpen = location.pathname === PLAN_TRIP_PATH;

  const closeTripDetail = useCallback(() => {
    setSelectedTripId(null);
  }, []);

  const navigateToTab = useCallback(
    (tab: AppTab) => {
      if (tab === "trips") {
        setSelectedTripId(null);
      }
      navigate(TAB_PATHS[tab]);
    },
    [navigate],
  );

  const openPlanTrip = useCallback(() => {
    setSelectedTripId(null);
    navigate(PLAN_TRIP_PATH);
  }, [navigate]);

  const closePlanTrip = useCallback(() => {
    navigate(TAB_PATHS.home);
  }, [navigate]);

  const openTripDetail = useCallback(
    (tripId: number) => {
      setSelectedTripId(tripId);
      navigate(TAB_PATHS.trips);
    },
    [navigate],
  );

  const openLogsForTrip = useCallback(
    (tripId: number) => {
      setSelectedLogsTripId(tripId);
      navigate(TAB_PATHS.logs);
    },
    [navigate],
  );

  const value = useMemo(
    () => ({
      activeTab,
      isPlanTripOpen,
      selectedTripId,
      selectedLogsTripId,
      navigateToTab,
      openPlanTrip,
      closePlanTrip,
      openTripDetail,
      closeTripDetail,
      openLogsForTrip,
      setSelectedLogsTripId,
    }),
    [
      activeTab,
      isPlanTripOpen,
      selectedTripId,
      selectedLogsTripId,
      navigateToTab,
      openPlanTrip,
      closePlanTrip,
      openTripDetail,
      closeTripDetail,
      openLogsForTrip,
    ],
  );

  return (
    <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
