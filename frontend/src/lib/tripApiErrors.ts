import { isApiError } from "@/lib/getErrorMessage";
import type { TripFormValues } from "@/types/trip";

type TripFormField = keyof TripFormValues;

const API_FIELD_TO_FORM_FIELD: Record<string, TripFormField> = {
  current_location: "currentLocation",
  pickup_location: "pickupLocation",
  delivery_location: "dropoffLocation",
  current_cycle_used_hrs: "currentCycleUsedHrs",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstErrorMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstErrorMessage(item);
      if (message) {
        return message;
      }
    }
    return undefined;
  }

  if (isRecord(value)) {
    for (const nested of Object.values(value)) {
      const message = firstErrorMessage(nested);
      if (message) {
        return message;
      }
    }
  }

  return undefined;
}

function extractResponseData(error: unknown): unknown {
  if (isApiError(error)) {
    return error.data;
  }

  if (isRecord(error) && "data" in error) {
    return error.data;
  }

  return undefined;
}

export function applyTripApiFieldErrors(
  error: unknown,
  setFieldError: (field: TripFormField, message: string | undefined) => void,
): { globalError?: string; hasFieldErrors: boolean } {
  const data = extractResponseData(error);
  if (!isRecord(data)) {
    return { hasFieldErrors: false };
  }

  let globalError: string | undefined;
  let hasFieldErrors = false;

  if ("non_field_errors" in data) {
    globalError = firstErrorMessage(data.non_field_errors);
  }

  for (const [apiField, formField] of Object.entries(API_FIELD_TO_FORM_FIELD)) {
    if (!(apiField in data)) {
      continue;
    }

    const message = firstErrorMessage(data[apiField]);
    if (!message) {
      continue;
    }

    setFieldError(formField, message);
    hasFieldErrors = true;
  }

  return { globalError, hasFieldErrors };
}
