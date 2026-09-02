import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ActiveTripCard } from "../../components/home/ActiveTripCard";
import { RecentTripCard } from "../../components/home/RecentTripCard";
import { AppHeader } from "../../components/layout/AppHeader";
import { mockActiveTrip, mockRecentTrips } from "../../data/mockDashboardTrips";
import { useNavigation } from "../../context/NavigationContext";

export default function HomePage() {
  const { openPlanTrip } = useNavigation();

  return (
    <div className="flex flex-1 flex-col pb-4">
      <AppHeader />

      <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, Jack
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready for your next trip?
          </p>
        </section>

        <Button
          size="lg"
          className="h-12 w-full rounded-2xl text-sm font-semibold"
          onClick={openPlanTrip}
        >
          <Plus className="size-5" aria-hidden />
          Plan New Trip
        </Button>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Current Active Trip</h2>
          <ActiveTripCard trip={mockActiveTrip} />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Recent Trips</h2>
          <div className="space-y-3">
            {mockRecentTrips.map((trip) => (
              <RecentTripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
