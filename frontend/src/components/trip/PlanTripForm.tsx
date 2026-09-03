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
import type { SelectedLocation } from "../../types/location";
import { Button } from "../ui/Button";
import { CycleHoursField } from "./CycleHoursField";
import { FormGlobalError } from "./FormGlobalError";
import { LocationFieldButton } from "./LocationFieldButton";
import { LocationPickerSheet } from "./LocationPickerSheet";
import { cn } from "@/lib/cn";

const CREATE_TRIP_DEFAULT_ERROR = "Unable to generate trip plan. Please try again.";

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

      const { globalError: apiGlobalError, hasFieldErrors } = applyTripApiFieldErrors(
        error,
        (field, message) => {
          void setFieldError(field, message);
        },
      );

      if (apiGlobalError) {
        setGlobalError(apiGlobalError);
      } else if (!hasFieldErrors) {
        setGlobalError(getErrorMessage(error, CREATE_TRIP_DEFAULT_ERROR));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleLocationConfirm(
    field: LocationFieldKey,
    location: SelectedLocation,
    values: TripFormValues,
    setFieldValue: FormikHelpers<TripFormValues>["setFieldValue"],
    setFieldError: FormikHelpers<TripFormValues>["setFieldError"],
  ) {
    void setFieldValue(field, location);
    void setFieldError(field, undefined);

    if (field === "currentLocation" && values.pickupSameAsCurrent) {
      void setFieldValue("pickupLocation", location);
      void setFieldError("pickupLocation", undefined);
    }

    setGlobalError(undefined);
    setActiveLocationField(null);
  }

  return (
    <Formik
      initialValues={emptyTripFormValues}
      validationSchema={tripFormSchema}
      onSubmit={handleSubmit}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ values, errors, setFieldValue, setFieldError, submitForm, isSubmitting }) => {
        const pickupDisplayAddress = values.pickupSameAsCurrent
          ? (values.currentLocation?.address ?? "")
          : (values.pickupLocation?.address ?? "");

        return (
          <div className="flex min-h-0 flex-1 flex-col">
            <Form className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-6">
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
                    <h2 className="text-base font-bold text-foreground">
                      Route Details
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <LocationFieldButton
                      title="Current location"
                      hint="Where are you now?"
                      value={values.currentLocation?.address ?? ""}
                      icon={LocateFixed}
                      error={locationFieldError(errors.currentLocation)}
                      showError={showValidationErrors}
                      onClick={() => setActiveLocationField("currentLocation")}
                    />

                    <div className="space-y-2">
                      <LocationFieldButton
                        title="Pickup location"
                        hint="Where do you pick up the load?"
                        value={pickupDisplayAddress}
                        icon={Package}
                        error={locationFieldError(errors.pickupLocation)}
                        showError={showValidationErrors && !values.pickupSameAsCurrent}
                        disabled={values.pickupSameAsCurrent}
                        onClick={() => setActiveLocationField("pickupLocation")}
                        trailing={
                          <label
                            className={cn(
                              "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 text-sm",
                              !values.currentLocation && "cursor-not-allowed opacity-60",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="size-4 rounded border-input accent-info"
                              checked={values.pickupSameAsCurrent}
                              disabled={!values.currentLocation}
                              onChange={(event) => {
                                const checked = event.target.checked;
                                void setFieldValue("pickupSameAsCurrent", checked);
                                void setFieldError("pickupLocation", undefined);
                                setGlobalError(undefined);

                                if (checked && values.currentLocation) {
                                  void setFieldValue(
                                    "pickupLocation",
                                    values.currentLocation,
                                  );
                                }
                              }}
                            />
                            <span
                              className="whitespace-nowrap text-foreground"
                              title="Same as current location"
                            >
                              Same as current
                            </span>
                          </label>
                        }
                      />

                      {values.pickupSameAsCurrent && values.currentLocation && (
                        <p className="text-xs text-muted-foreground">
                          No drive to pickup — loading starts at your current location.
                        </p>
                      )}
                    </div>

                    <LocationFieldButton
                      title="Dropoff location"
                      hint="Where do you deliver?"
                      value={values.dropoffLocation?.address ?? ""}
                      icon={MapPin}
                      error={locationFieldError(errors.dropoffLocation)}
                      showError={showValidationErrors}
                      onClick={() => setActiveLocationField("dropoffLocation")}
                    />
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

              <div className="shrink-0 border-t border-border bg-card px-5 pt-3 pb-4">
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
            </Form>

            <LocationPickerSheet
              open={activeLocationField !== null}
              field={activeLocationField}
              initialValue={activeLocationField ? values[activeLocationField] : null}
              onClose={() => setActiveLocationField(null)}
              onConfirm={(location) => {
                if (activeLocationField) {
                  handleLocationConfirm(
                    activeLocationField,
                    location,
                    values,
                    setFieldValue,
                    setFieldError,
                  );
                }
              }}
            />
          </div>
        );
      }}
    </Formik>
  );
}
