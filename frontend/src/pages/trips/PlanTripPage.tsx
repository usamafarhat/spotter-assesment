import { PlanTripForm } from "../../components/trip/PlanTripForm";
import { PlanTripHeader } from "../../components/layout/PlanTripHeader";
import { useNavigation } from "../../context/useNavigation";

export default function PlanTripPage() {
  const { closePlanTrip } = useNavigation();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card lg:bg-background lg:p-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card lg:mx-auto lg:w-full lg:max-w-2xl lg:rounded-2xl lg:border lg:border-border lg:shadow-sm">
        <PlanTripHeader onBack={closePlanTrip} />
        <PlanTripForm />
      </div>
    </div>
  );
}
