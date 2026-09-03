import type { DutySegmentDto } from "@/api/EldPlanner/modules/trips/dutySegment.types";
import type {
  LocationDto,
  RoutePolyline,
} from "@/api/EldPlanner/modules/trips/trips.types";
import {
  formatSegmentDuration,
  formatSegmentTimeRange,
  formatSegmentTitle,
  isLongRest,
} from "@/lib/dutySegmentDisplay";

export type LatLng = {
  lat: number;
  lng: number;
};

export type RouteMarkerKind =
  | "current"
  | "pickup"
  | "destination"
  | "fuel"
  | "break"
  | "sleeper";

export type RouteMapMarker = LatLng & {
  kind: RouteMarkerKind;
  label: string;
  detail?: string;
  id?: string;
};

const EARTH_RADIUS_MILES = 3958.8;
const HOS_STOP_TYPES = new Set<DutySegmentDto["stop_type"]>(["fuel", "rest"]);

const MARKER_VIEW_WIDTH = 36;
const MARKER_VIEW_HEIGHT = 48;
const MARKER_WIDTH = 26;
const MARKER_HEIGHT = 34;
const STOP_MARKER_WIDTH = 18;
const STOP_MARKER_HEIGHT = 24;

const PIN_PATH =
  "M18 0C9.716 0 3 6.716 3 15c0 11.25 15 33 15 33s15-21.75 15-33C33 6.716 26.284 0 18 0z";
const INNER_ICON_CENTER = { x: 18, y: 14 };

function innerIconTransform(scale: number): string {
  const { x, y } = INNER_ICON_CENTER;
  return `translate(${x},${y}) scale(${scale}) translate(-12,-12)`;
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
      id: "current",
      kind: "current",
      label: "Current",
    });
  }
  if (pickup) {
    markers.push({
      ...locationDtoToLatLng(pickup),
      id: "pickup",
      kind: "pickup",
      label: "Pickup",
    });
  }
  if (delivery) {
    markers.push({
      ...locationDtoToLatLng(delivery),
      id: "destination",
      kind: "destination",
      label: "Destination",
    });
  }

  return markers;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

/** Interpolate a point on the stored route at a given trip mileage. */
export function pointAtTripMiles(
  polyline: RoutePolyline,
  targetMiles: number,
): LatLng | null {
  if (!polyline.length) {
    return null;
  }

  if (targetMiles <= 0) {
    const [lat, lng] = polyline[0];
    return { lat: Number(lat), lng: Number(lng) };
  }

  let traveled = 0;
  for (let index = 1; index < polyline.length; index += 1) {
    const [prevLat, prevLng] = polyline[index - 1];
    const [lat, lng] = polyline[index];
    const segmentMiles = haversineMiles(prevLat, prevLng, lat, lng);

    if (traveled + segmentMiles >= targetMiles) {
      const remaining = targetMiles - traveled;
      const ratio = segmentMiles ? remaining / segmentMiles : 0;
      return {
        lat: prevLat + (lat - prevLat) * ratio,
        lng: prevLng + (lng - prevLng) * ratio,
      };
    }

    traveled += segmentMiles;
  }

  const [lat, lng] = polyline[polyline.length - 1];
  return { lat: Number(lat), lng: Number(lng) };
}

function parseSegmentLatLng(segment: DutySegmentDto): LatLng | null {
  if (segment.latitude == null || segment.longitude == null) {
    return null;
  }

  const lat = Number(segment.latitude);
  const lng = Number(segment.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function milesAtStop(segments: DutySegmentDto[], index: number): number {
  const rawStart = segments[index].miles_at_start;
  if (rawStart != null) {
    const startMiles = Number(rawStart);
    if (Number.isFinite(startMiles)) {
      return startMiles;
    }
  }

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const rawEnd = segments[cursor].miles_at_end;
    if (rawEnd == null) {
      continue;
    }
    const endMiles = Number(rawEnd);
    if (Number.isFinite(endMiles)) {
      return endMiles;
    }
  }

  return 0;
}

/** Rest and fuel pins along the route. Uses saved coords, else interpolates. */
export function buildHosStopMarkers(
  segments: DutySegmentDto[] | undefined,
  polyline: RoutePolyline,
): RouteMapMarker[] {
  if (!segments?.length) {
    return [];
  }

  const ordered = [...segments].sort((a, b) => a.sequence - b.sequence);
  const markers: RouteMapMarker[] = [];

  for (let index = 0; index < ordered.length; index += 1) {
    const segment = ordered[index];
    if (!HOS_STOP_TYPES.has(segment.stop_type)) {
      continue;
    }

    const point =
      parseSegmentLatLng(segment) ??
      pointAtTripMiles(polyline, milesAtStop(ordered, index));

    if (!point) {
      continue;
    }

    markers.push({
      ...point,
      id: `stop-${segment.id}`,
      kind:
        segment.stop_type === "fuel"
          ? "fuel"
          : isLongRest(segment)
            ? "sleeper"
            : "break",
      label: `${formatSegmentTitle(segment)} · ${formatSegmentDuration(segment)}`,
      detail: formatSegmentTimeRange(segment),
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
  return `<g fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform(0.84)}">
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
  </g>`;
}

function pickupIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform(0.84)}">
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" y1="22" x2="12" y2="12"/>
  </g>`;
}

function destinationIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform(0.84)}">
    <path d="M20 10c0 4.418-8 12-8 12s-8-7.582-8-12a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </g>`;
}

function fuelIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform(0.72)}">
    <line x1="3" y1="22" x2="15" y2="22"/>
    <line x1="4" y1="9" x2="14" y2="9"/>
    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/>
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
  </g>`;
}

function breakIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform(0.72)}">
    <path d="M10 2v2"/>
    <path d="M14 2v2"/>
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>
    <path d="M6 2v2"/>
  </g>`;
}

function sleeperIconSvg(): string {
  return `<g fill="none" stroke="#ffffff" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" transform="${innerIconTransform(0.78)}">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </g>`;
}

const MARKER_FILL: Record<RouteMarkerKind, string> = {
  current: "#16a34a",
  pickup: "#2563eb",
  destination: "#111827",
  fuel: "#d97706",
  break: "#0891b2",
  sleeper: "#7c3aed",
};

const MARKER_ICON_SVG: Record<RouteMarkerKind, () => string> = {
  current: currentIconSvg,
  pickup: pickupIconSvg,
  destination: destinationIconSvg,
  fuel: fuelIconSvg,
  break: breakIconSvg,
  sleeper: sleeperIconSvg,
};

function isHosStopKind(
  kind: RouteMarkerKind,
): kind is "fuel" | "break" | "sleeper" {
  return kind === "fuel" || kind === "break" || kind === "sleeper";
}

export function markerZIndex(kind: RouteMarkerKind): number {
  return isHosStopKind(kind) ? 1 : 4;
}

export function markerInfoWindowOffset(kind: RouteMarkerKind): number {
  return isHosStopKind(kind) ? -24 : -32;
}

/** Same pin family for all markers. Rest/fuel stay smaller so main stops stay primary. */
export function createRouteMarkerIcon(kind: RouteMarkerKind): google.maps.Icon {
  const isStop = isHosStopKind(kind);
  const width = isStop ? STOP_MARKER_WIDTH : MARKER_WIDTH;
  const height = isStop ? STOP_MARKER_HEIGHT : MARKER_HEIGHT;
  const icon = MARKER_ICON_SVG[kind]();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_VIEW_WIDTH}" height="${MARKER_VIEW_HEIGHT}" viewBox="0 0 ${MARKER_VIEW_WIDTH} ${MARKER_VIEW_HEIGHT}">
  <path d="${PIN_PATH}" fill="${MARKER_FILL[kind]}" stroke="#ffffff" stroke-width="1.5"/>
  ${icon}
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(width / 2, height),
  };
}
