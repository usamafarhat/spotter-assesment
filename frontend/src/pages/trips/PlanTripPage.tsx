import { PlanTripForm } from "../../components/trip/PlanTripForm";
import { PlanTripHeader } from "../../components/layout/PlanTripHeader";
import { useNavigation } from "../../context/NavigationContext";

export default function PlanTripPage() {
  const { closePlanTrip } = useNavigation();

  return (
    <div className="flex flex-1 flex-col bg-card">
      <PlanTripHeader onBack={closePlanTrip} />
      <PlanTripForm />
    </div>
  );
}
