import { PlanTripForm } from "../../components/trip/PlanTripForm";
import { PlanTripHeader } from "../../components/layout/PlanTripHeader";
import { useNavigation } from "../../context/useNavigation";

export default function PlanTripPage() {
  const { closePlanTrip } = useNavigation();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
      <PlanTripHeader onBack={closePlanTrip} />
      <PlanTripForm />
    </div>
  );
}
