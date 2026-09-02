import type { LocationDto, RoutePolyline } from "@/api/EldPlanner/modules/trips/trips.types";

export type LatLng = {
  lat: number;
  lng: number;
};

export type RouteMarkerKind = "current" | "pickup" | "destination";

export type RouteMapMarker = LatLng & {
  kind: RouteMarkerKind;
  label: string;
};

const MARKER_VIEW_WIDTH = 36;
const MARKER_VIEW_HEIGHT = 48;
const MARKER_WIDTH = 26;
const MARKER_HEIGHT = 34;
const MARKER_ANCHOR_X = MARKER_WIDTH / 2;

const PIN_PATH =
  "M18 0C9.716 0 3 6.716 3 15c0 11.25 15 33 15 33s15-21.75 15-33C33 6.716 26.284 0 18 0z";
const INNER_ICON_SCALE = 0.84;
const INNER_ICON_CENTER = { x: 18, y: 14 };

function innerIconTransform(): string {
  const { x, y } = INNER_ICON_CENTER;
  return `translate(${x},${y}) scale(${INNER_ICON_SCALE}) translate(-12,-12)`;
}

/** Backend stores polyline as [[lat, lng], ...]. */
export function polylineToPath(polyline: RoutePolyline): LatLng[] {
  return polyline.map(([lat, lng]) => ({
    lat: Number(lat),
    lng: Number(lng),
  }));
}

/** Join pickup + delivery legs for map bounds (skips duplicate join point). */
export function mergeRoutePolylines(
  toPickup?: RoutePolyline | null,
  toDelivery?: RoutePolyline | null,
): RoutePolyline {
  const leg1 = toPickup ?? [];
  const leg2 = toDelivery ?? [];

  if (!leg1.length) {
    return leg2;
  }
  if (!leg2.length) {
    return leg1;
  }

  const merged: RoutePolyline = [...leg1];
  const [lastLat, lastLng] = leg1[leg1.length - 1];
  const [firstLat, firstLng] = leg2[0];
  const startIndex =
    Math.abs(lastLat - firstLat) < 0.0001 && Math.abs(lastLng - firstLng) < 0.0001
      ? 1
      : 0;

  merged.push(...leg2.slice(startIndex));
  return merged;
}

export function hasRoutePolylines(
  toPickup?: RoutePolyline | null,
  toDelivery?: RoutePolyline | null,
): boolean {
  return Boolean(toPickup?.length || toDelivery?.length);
}

export function locationDtoToLatLng(location: LocationDto): LatLng {
  return {
    lat: Number(location.latitude),
    lng: Number(location.longitude),
  };
}

function locationsMatch(a: LocationDto, b: LocationDto): boolean {
  const epsilon = 0.0001;
  return (
    Math.abs(Number(a.latitude) - Number(b.latitude)) < epsilon &&
    Math.abs(Number(a.longitude) - Number(b.longitude)) < epsilon
  );
}

export function buildTripRouteMarkers(
  current?: LocationDto,
  pickup?: LocationDto,
  delivery?: LocationDto,
): RouteMapMarker[] {
  const markers: RouteMapMarker[] = [];

  if (current && (!pickup || !locationsMatch(current, pickup))) {
    markers.push({
      ...locationDtoToLatLng(current),
      kind: "current",
      label: "Current",
    });
  }
  if (pickup) {
    markers.push({
      ...locationDtoToLatLng(pickup),
      kind: "pickup",
      label: "Pickup",
    });
  }
  if (delivery) {
    markers.push({
      ...locationDtoToLatLng(delivery),
      kind: "destination",
      label: "Destination",
    });
  }

  return markers;
}

export function getBoundsForPath(path: LatLng[]): google.maps.LatLngBounds | null {
  if (!path.length || typeof google === "undefined") {
    return null;
  }

  const bounds = new google.maps.LatLngBounds();
  for (const point of path) {
    bounds.extend(point);
  }
  return bounds;
}

function currentIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform()}">
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
  </g>`;
}

function pickupIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform()}">
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" y1="22" x2="12" y2="12"/>
  </g>`;
}

function destinationIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform()}">
    <path d="M20 10c0 4.418-8 12-8 12s-8-7.582-8-12a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </g>`;
}

/** Colored map pin with icon — reliable inside Google Maps markers. */
export function createRouteMarkerIcon(kind: RouteMarkerKind): google.maps.Icon {
  const fill =
    kind === "current" ? "#16a34a" : kind === "pickup" ? "#2563eb" : "#111827";
  const icon =
    kind === "current"
      ? currentIconSvg()
      : kind === "pickup"
        ? pickupIconSvg()
        : destinationIconSvg();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_VIEW_WIDTH}" height="${MARKER_VIEW_HEIGHT}" viewBox="0 0 ${MARKER_VIEW_WIDTH} ${MARKER_VIEW_HEIGHT}">
  <path d="${PIN_PATH}" fill="${fill}" stroke="#ffffff" stroke-width="1.5"/>
  ${icon}
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
    anchor: new google.maps.Point(MARKER_ANCHOR_X, MARKER_HEIGHT),
  };
}
