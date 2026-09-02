/** Matches backend DecimalField(max_digits=9, decimal_places=6). */
export const API_COORD_DECIMAL_PLACES = 6;

export function roundCoordinate(value: number): number {
  const factor = 10 ** API_COORD_DECIMAL_PLACES;
  return Math.round(value * factor) / factor;
}

/** Format lat/lng for API payloads (avoids float string noise). */
export function formatCoordinateForApi(value: number): string {
  return roundCoordinate(value).toFixed(API_COORD_DECIMAL_PLACES);
}
