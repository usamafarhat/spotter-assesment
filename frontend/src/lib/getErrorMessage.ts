import { ApiError } from "@/api/EldPlanner/client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const GENERIC_HTTP_STATUS_TEXT =
  /^(bad request|unauthorized|forbidden|not found|method not allowed|conflict|unprocessable entity|internal server error|service unavailable|gateway timeout)$/i;

/** Recursively collect string messages from DRF-style nested error payloads. */
function collectErrorMessages(value: unknown): string[] {
  const direct = asNonEmptyString(value);
  if (direct) {
    return [direct];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectErrorMessages);
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ["detail", "message"]) {
    if (key in value) {
      const messages = collectErrorMessages(value[key]);
      if (messages.length > 0) {
        return messages;
      }
    }
  }

  if ("non_field_errors" in value) {
    const messages = collectErrorMessages(value.non_field_errors);
    if (messages.length > 0) {
      return messages;
    }
  }

  // Optional future envelope: { error: { message, fields } }
  if (isRecord(value.error)) {
    const fromMessage = collectErrorMessages(value.error.message);
    if (fromMessage.length > 0) {
      return fromMessage;
    }

    const fromFields = collectErrorMessages(value.error.fields);
    if (fromFields.length > 0) {
      return fromFields;
    }
  }

  return Object.values(value).flatMap(collectErrorMessages);
}

function extractResponseData(error: unknown): unknown {
  if (error instanceof ApiError) {
    return error.data;
  }

  if (isRecord(error) && "data" in error) {
    return error.data;
  }

  if (isRecord(error) && "response" in error) {
    const response = error.response;
    if (isRecord(response) && "data" in response) {
      return response.data;
    }
  }

  return undefined;
}

function isGenericHttpStatusText(message: string): boolean {
  return GENERIC_HTTP_STATUS_TEXT.test(message.trim());
}

function isNetworkErrorMessage(message: string): boolean {
  return /network error|failed to fetch|network request failed|load failed/i.test(
    message,
  );
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Returns the best user-facing error string from an API or unknown error.
 * Falls back to `defaultMessage` when no usable message can be extracted.
 *
 * Supports DRF defaults (`detail`, nested field errors, `non_field_errors`)
 * and a future `{ error: { message, fields } }` envelope.
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  const fromPayload = collectErrorMessages(extractResponseData(error));
  if (fromPayload.length > 0) {
    return fromPayload[0];
  }

  if (error instanceof Error) {
    const fromError = asNonEmptyString(error.message);
    if (
      fromError &&
      !isGenericHttpStatusText(fromError) &&
      !isNetworkErrorMessage(fromError)
    ) {
      return fromError;
    }

    if (fromError && isNetworkErrorMessage(fromError)) {
      return defaultMessage;
    }
  }

  if (typeof error === "string") {
    const fromString = asNonEmptyString(error);
    if (fromString) {
      return fromString;
    }
  }

  return defaultMessage;
}
