import { Form, Formik } from "formik";
import { Clock, LocateFixed, MapPin, Package, Route } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { LocationFieldButton } from "./LocationFieldButton";
import { LocationPickerSheet } from "./LocationPickerSheet";
import { CycleHoursField } from "./CycleHoursField";
import { FormGlobalError } from "./FormGlobalError";
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

export function PlanTripForm() {
  const [activeLocationField, setActiveLocationField] =
    useState<LocationFieldKey | null>(null);
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  function handleSubmit(values: TripFormValues) {
    const hoursUsed = parseFloat(values.currentCycleUsedHrs);
    if (!Number.isNaN(hoursUsed) && hoursUsed >= MAX_CYCLE_HRS) {
      setGlobalError(CYCLE_FULLY_UTILIZED_ERROR);
      return;
    }

    setGlobalError(undefined);
    // API wiring comes later
    console.log("Trip form submitted:", values);
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
                      error={errors[field.key]}
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
                  disabled={isSubmitting}
                  onClick={async () => {
                    setShowValidationErrors(true);
                    await submitForm();
                  }}
                >
                  Generate Plan
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
