import * as Yup from "yup";

export const MAX_CYCLE_HRS = 70;

const locationShape = {
  address: Yup.string().trim().required(),
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
};

export const tripFormSchema = Yup.object({
  currentLocation: Yup.object(locationShape)
    .nullable()
    .required("Current location is required"),
  pickupLocation: Yup.object(locationShape)
    .nullable()
    .required("Pickup location is required"),
  dropoffLocation: Yup.object(locationShape)
    .nullable()
    .required("Dropoff location is required"),
  currentCycleUsedHrs: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value,
    )
    .typeError("Enter hours already used in this cycle")
    .required("Hours already used is required")
    .min(0, "Must be at least 0 hours")
    .max(MAX_CYCLE_HRS, `Cannot exceed ${MAX_CYCLE_HRS} hours`),
});

export const CYCLE_FULLY_UTILIZED_ERROR =
  "Your 70 hr / 8-day cycle is fully used. You cannot plan a new trip until hours are available again.";
