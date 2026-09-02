import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { queryClient } from "@/api/EldPlanner/queryClient";
import { AppLayout } from "./components/layout/AppLayout";
import { GoogleMapsProvider } from "./context/GoogleMapsContext";
import { NavigationProvider } from "./context/NavigationContext";
import HomePage from "./pages/home/HomePage";
import LogsPage from "./pages/logs/LogsPage";
import PlanTripPage from "./pages/trips/PlanTripPage";
import TripsPage from "./pages/trips/TripsPage";
import ViewAllComponents from "./pages/ViewAllComponents";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleMapsProvider>
        <NavigationProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/trips/plan-trip" element={<PlanTripPage />} />
              <Route path="/logs" element={<LogsPage />} />
            </Route>
            <Route path="/view-all-components" element={<ViewAllComponents />} />
          </Routes>
        </NavigationProvider>
      </GoogleMapsProvider>
    </QueryClientProvider>
  );
}
