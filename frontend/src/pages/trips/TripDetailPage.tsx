import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/EldPlanner/client";
import { useTrip } from "@/api/EldPlanner/modules/trips";
import { TripDetailSkeleton, TripDetailView } from "@/components/trip/TripDetailView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { TAB_PATHS } from "@/types/navigation";

const LOAD_ERROR_MESSAGE = "Unable to load this trip. Please try again.";
const NOT_FOUND_MESSAGE = "This trip could not be found.";

function parseTripId(rawTripId: string | undefined): number | null {
  if (!rawTripId) {
    return null;
  }

  const tripId = Number(rawTripId);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    return null;
  }

  return tripId;
}

export default function TripDetailPage() {
  const { tripId: rawTripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const tripId = parseTripId(rawTripId);
  const { data: trip, isLoading, isError, error, refetch } = useTrip(tripId);

  const goBack = () => {
    navigate(TAB_PATHS.trips);
  };

  if (tripId == null) {
    return (
      <TripDetailErrorState
        title="Trip not found"
        message="The trip link is invalid."
        onBack={goBack}
      />
    );
  }

  if (isLoading && !trip) {
    return <TripDetailSkeleton onBack={goBack} />;
  }

  if (isError || !trip) {
    const isNotFound = error instanceof ApiError && error.status === 404;

    return (
      <TripDetailErrorState
        title={isNotFound ? "Trip not found" : "Could not load trip"}
        message={getErrorMessage(error, isNotFound ? NOT_FOUND_MESSAGE : LOAD_ERROR_MESSAGE)}
        onBack={goBack}
        onRetry={isNotFound ? undefined : () => refetch()}
      />
    );
  }

  return <TripDetailView trip={trip} onBack={goBack} />;
}

function TripDetailErrorState({
  title,
  message,
  onBack,
  onRetry,
}: {
  title: string;
  message: string;
  onBack: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-card">
      <div className="flex flex-1 flex-col gap-4 px-5 py-6">
        <Alert variant="error">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{message}</span>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onBack}>
                Back to trips
              </Button>
              {onRetry ? (
                <Button type="button" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
