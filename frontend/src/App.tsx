import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { queryClient } from "@/api/EldPlanner/queryClient";
import { AppLayout } from "./components/layout/AppLayout";
import { GoogleMapsProvider } from "./context/GoogleMapsContext";
import { NavigationProvider } from "./context/NavigationContext";
import { TooltipProvider } from "./components/ui/Tooltip";
import HomePage from "./pages/home/HomePage";
import LogsPage from "./pages/logs/LogsPage";
import PlanTripPage from "./pages/trips/PlanTripPage";
import TripDetailPage from "./pages/trips/TripDetailPage";
import TripsPage from "./pages/trips/TripsPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleMapsProvider>
        <NavigationProvider>
          <TooltipProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/trips/plan-trip" element={<PlanTripPage />} />
                <Route path="/trips/:tripId" element={<TripDetailPage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/logs" element={<LogsPage />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </NavigationProvider>
      </GoogleMapsProvider>
    </QueryClientProvider>
  );
}
