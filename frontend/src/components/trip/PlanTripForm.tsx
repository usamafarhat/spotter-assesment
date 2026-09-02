import { Form, Formik, type FormikHelpers } from "formik";
import { Clock, LocateFixed, MapPin, Package, Route } from "lucide-react";
import { useState } from "react";
import { useCreateTrip } from "@/api/EldPlanner/modules/trips";
import { useNavigation } from "@/context/NavigationContext";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { applyTripApiFieldErrors } from "@/lib/tripApiErrors";
import { toCreateTripDto } from "@/lib/tripFormMapper";
import {
  CYCLE_FULLY_UTILIZED_ERROR,
  MAX_CYCLE_HRS,
  tripFormSchema,
} from "../../lib/tripFormValidation";
import {
  emptyTripFormValues,
  type LocationFieldKey,
  type TripFormValues,
} from "../../types/trip";
import { Button } from "../ui/Button";
import { CycleHoursField } from "./CycleHoursField";
import { FormGlobalError } from "./FormGlobalError";
import { LocationFieldButton } from "./LocationFieldButton";
import { LocationPickerSheet } from "./LocationPickerSheet";

const CREATE_TRIP_DEFAULT_ERROR =
  "Unable to generate trip plan. Please try again.";

const locationFields: {
  key: LocationFieldKey;
  title: string;
  hint: string;
  icon: typeof LocateFixed;
}[] = [
  {
    key: "currentLocation",
    title: "Current location",
    hint: "Where are you now?",
    icon: LocateFixed,
  },
  {
    key: "pickupLocation",
    title: "Pickup location",
    hint: "Where do you pick up the load?",
    icon: Package,
  },
  {
    key: "dropoffLocation",
    title: "Dropoff location",
    hint: "Where do you deliver?",
    icon: MapPin,
  },
];

function locationFieldError(error: unknown): string | undefined {
  return typeof error === "string" ? error : undefined;
}

export function PlanTripForm() {
  const { openTripDetail } = useNavigation();
  const createTrip = useCreateTrip();
  const [activeLocationField, setActiveLocationField] =
    useState<LocationFieldKey | null>(null);
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  async function handleSubmit(
    values: TripFormValues,
    { setSubmitting, setFieldError }: FormikHelpers<TripFormValues>,
  ) {
    const hoursUsed = parseFloat(values.currentCycleUsedHrs);
    if (!Number.isNaN(hoursUsed) && hoursUsed >= MAX_CYCLE_HRS) {
      setGlobalError(CYCLE_FULLY_UTILIZED_ERROR);
      setSubmitting(false);
      return;
    }

    setGlobalError(undefined);

    try {
      const created = await createTrip.mutateAsync(toCreateTripDto(values));
      openTripDetail(created.id);
    } catch (error) {
      setShowValidationErrors(true);

      const { globalError: apiGlobalError, hasFieldErrors } =
        applyTripApiFieldErrors(error, (field, message) => {
          void setFieldError(field, message);
        });

      if (apiGlobalError) {
        setGlobalError(apiGlobalError);
      } else if (!hasFieldErrors) {
        setGlobalError(getErrorMessage(error, CREATE_TRIP_DEFAULT_ERROR));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Formik
      initialValues={emptyTripFormValues}
      validationSchema={tripFormSchema}
      onSubmit={handleSubmit}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ values, errors, setFieldValue, setFieldError, submitForm, isSubmitting }) => (
        <>
          <Form className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-28">
              <section>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Plan a New Trip
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your route details to generate an HOS-compliant travel plan.
                </p>
              </section>

              <FormGlobalError message={globalError} />

              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Route className="size-5 text-foreground" aria-hidden />
                  <h2 className="text-base font-bold text-foreground">Route Details</h2>
                </div>

                <div className="space-y-4">
                  {locationFields.map((field) => (
                    <LocationFieldButton
                      key={field.key}
                      title={field.title}
                      hint={field.hint}
                      value={values[field.key]?.address ?? ""}
                      icon={field.icon}
                      error={locationFieldError(errors[field.key])}
                      showError={showValidationErrors}
                      onClick={() => {
                        setActiveLocationField(field.key);
                      }}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Clock className="size-5 text-warning" aria-hidden />
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Cycle Hours Used
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      70 hr / 8-day window
                    </p>
                  </div>
                </div>

                <CycleHoursField
                  value={values.currentCycleUsedHrs}
                  error={errors.currentCycleUsedHrs}
                  showError={showValidationErrors}
                  onChange={(v) => {
                    void setFieldValue("currentCycleUsedHrs", v);
                    void setFieldError("currentCycleUsedHrs", undefined);
                    setGlobalError(undefined);
                  }}
                />
              </section>
            </div>

            <div className="fixed inset-x-0 bottom-20 z-10 px-5">
              <div className="mx-auto max-w-md">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full rounded-xl"
                  disabled={isSubmitting || createTrip.isPending}
                  onClick={async () => {
                    setShowValidationErrors(true);
                    await submitForm();
                  }}
                >
                  {isSubmitting || createTrip.isPending
                    ? "Generating Plan..."
                    : "Generate Plan"}
                </Button>
              </div>
            </div>
          </Form>

          <LocationPickerSheet
            open={activeLocationField !== null}
            field={activeLocationField}
            initialValue={activeLocationField ? values[activeLocationField] : null}
            onClose={() => setActiveLocationField(null)}
            onConfirm={(location) => {
              if (activeLocationField) {
                void setFieldValue(activeLocationField, location);
                void setFieldError(activeLocationField, undefined);
                setGlobalError(undefined);
              }
              setActiveLocationField(null);
            }}
          />
        </>
      )}
    </Formik>
  );
}
