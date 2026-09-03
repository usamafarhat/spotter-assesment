import type { Libraries } from "@react-google-maps/api";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  SELECTED_MAP_ZOOM,
  type SelectedLocation,
} from "../types/location";

export const GOOGLE_MAPS_LIBRARIES: Libraries = ["places", "geocoding"];

/** Google types that mean "city / state / country only" — nothing route-specific. */
const IMPRECISE_ONLY_TYPES = new Set([
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "country",
]);

const DETECTED_KIND_LABELS: Record<string, string> = {
  locality: "a city",
  administrative_area_level_1: "a state or province",
  administrative_area_level_2: "a county or district",
  administrative_area_level_3: "a region",
  country: "a country",
};

export type PlaceValidationResult =
  | { ok: true; location: SelectedLocation }
  | {
      ok: false;
      reason: string;
      detectedLabel?: string;
      detectedKind?: string;
    };

export function getGoogleMapsApiKey(): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("VITE_GOOGLE_MAPS_API_KEY is not configured");
  }
  return key;
}

export function getMapCenter(location: SelectedLocation | null) {
  if (location) {
    return { lat: location.latitude, lng: location.longitude };
  }
  return DEFAULT_MAP_CENTER;
}

export function getMapZoom(location: SelectedLocation | null) {
  return location ? SELECTED_MAP_ZOOM : DEFAULT_MAP_ZOOM;
}

/**
 * Reject only when every type is city/state/country.
 * Addresses, warehouses, airports, and unknown Google types all pass.
 */
export function isAcceptableLocation(types: string[] | undefined): boolean {
  if (!types?.length) return true;

  const isCityOrRegionOnly = types.every(
    (type) => IMPRECISE_ONLY_TYPES.has(type) || type === "political",
  );

  return !isCityOrRegionOnly;
}

export function describeDetectedKind(types: string[]): string {
  for (const type of [
    "locality",
    "administrative_area_level_2",
    "administrative_area_level_1",
    "administrative_area_level_3",
    "country",
  ]) {
    if (types.includes(type)) {
      return DETECTED_KIND_LABELS[type];
    }
  }
  return "a general area";
}

export function buildImpreciseLocationError(label: string, types: string[]): string {
  const kind = describeDetectedKind(types);
  return `"${label}" was detected as ${kind}. Pick a specific street address or business instead.`;
}

export function validatePlaceSelection(
  place: google.maps.places.PlaceResult,
): PlaceValidationResult {
  const location = place.geometry?.location;
  if (!location) {
    return {
      ok: false,
      reason: "No location found for this place. Try another search.",
    };
  }

  const label = place.formatted_address ?? place.name ?? "This selection";
  const types = place.types ?? [];

  if (!isAcceptableLocation(types)) {
    const detectedKind = describeDetectedKind(types);
    return {
      ok: false,
      reason: buildImpreciseLocationError(label, types),
      detectedLabel: label,
      detectedKind,
    };
  }

  return {
    ok: true,
    location: {
      address: label,
      latitude: location.lat(),
      longitude: location.lng(),
    },
  };
}

function pickGeocoderResult(
  results: google.maps.GeocoderResult[],
): google.maps.GeocoderResult | null {
  if (!results.length) return null;

  const preferred = results.find((result) => isAcceptableLocation(result.types));
  return preferred ?? results[0];
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<SelectedLocation | null> {
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status !== "OK" || !results?.length) {
          resolve(null);
          return;
        }

        const result = pickGeocoderResult(results);
        if (!result) {
          resolve(null);
          return;
        }

        resolve({
          address: result.formatted_address,
          latitude,
          longitude,
        });
      },
    );
  });
}
