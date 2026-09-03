import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PLAN_TRIP_PATH,
  TAB_PATHS,
  logsPath,
  tripDetailPath,
  type AppTab,
} from "../types/navigation";

type NavigationContextValue = {
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

const NavigationContext = createContext<NavigationContextValue | null>(null);

function getActiveTab(pathname: string): AppTab {
  if (pathname.startsWith("/trips")) return "trips";
  if (pathname.startsWith("/logs")) return "logs";
  return "home";
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLogsTripId, setSelectedLogsTripId] = useState<number | null>(null);

  const activeTab = getActiveTab(location.pathname);
  const isPlanTripOpen = location.pathname === PLAN_TRIP_PATH;

  const navigateToTab = useCallback(
    (tab: AppTab) => {
      navigate(TAB_PATHS[tab]);
    },
    [navigate],
  );

  const openPlanTrip = useCallback(() => {
    navigate(PLAN_TRIP_PATH);
  }, [navigate]);

  const closePlanTrip = useCallback(() => {
    navigate(TAB_PATHS.home);
  }, [navigate]);

  const openTripDetail = useCallback(
    (tripId: number) => {
      navigate(tripDetailPath(tripId));
    },
    [navigate],
  );

  const openLogsForTrip = useCallback(
    (tripId: number) => {
      setSelectedLogsTripId(tripId);
      navigate(logsPath({ tripId }));
    },
    [navigate],
  );

  const value = useMemo(
    () => ({
      activeTab,
      isPlanTripOpen,
      selectedLogsTripId,
      navigateToTab,
      openPlanTrip,
      closePlanTrip,
      openTripDetail,
      openLogsForTrip,
      setSelectedLogsTripId,
    }),
    [
      activeTab,
      isPlanTripOpen,
      selectedLogsTripId,
      navigateToTab,
      openPlanTrip,
      closePlanTrip,
      openTripDetail,
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
