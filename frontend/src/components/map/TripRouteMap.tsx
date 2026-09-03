import { GoogleMap, Marker, OverlayView, Polyline } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DutySegmentDto } from "@/api/EldPlanner/modules/trips/dutySegment.types";
import type {
  LocationDto,
  RoutePolyline,
} from "@/api/EldPlanner/modules/trips/trips.types";
import { useGoogleMaps } from "@/context/useGoogleMaps";
import { cn } from "@/lib/cn";
import {
  buildHosStopMarkers,
  buildTripRouteMarkers,
  createRouteMarkerIcon,
  hasRoutePolylines,
  markerPixelHeight,
  markerZIndex,
  mergeRoutePolylines,
  polylineToPath,
  type RouteMapMarker,
  type RouteMarkerKind,
} from "@/lib/routePolyline";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/types/location";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: "greedy",
};

const pickupLegPolylineOptions: google.maps.PolylineOptions = {
  strokeColor: "#2563eb",
  strokeOpacity: 0.85,
  strokeWeight: 4,
  geodesic: true,
};

const deliveryLegPolylineOptions: google.maps.PolylineOptions = {
  strokeColor: "#111827",
  strokeOpacity: 0.9,
  strokeWeight: 4,
  geodesic: true,
};

type TripRouteMapProps = {
  routeToPickupPolyline?: RoutePolyline | null;
  routeToDeliveryPolyline?: RoutePolyline | null;
  currentLocation?: LocationDto;
  pickupLocation?: LocationDto;
  deliveryLocation?: LocationDto;
  dutySegments?: DutySegmentDto[];
  markers?: RouteMapMarker[];
  className?: string;
};

function fitMapToRoute(
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[][],
  extraMarkers: RouteMapMarker[],
) {
  const bounds = new google.maps.LatLngBounds();
  let hasPoints = false;

  for (const path of paths) {
    for (const point of path) {
      bounds.extend(point);
      hasPoints = true;
    }
  }

  for (const marker of extraMarkers) {
    bounds.extend(marker);
    hasPoints = true;
  }

  if (hasPoints) {
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
  }
}

function markerKey(marker: RouteMapMarker): string {
  return marker.id ?? `${marker.kind}-${marker.lat}-${marker.lng}`;
}

const MARKER_KINDS: RouteMarkerKind[] = [
  "current",
  "pickup",
  "destination",
  "fuel",
  "break",
  "sleeper",
];

function MapPinTooltip({ marker }: { marker: RouteMapMarker }) {
  const pinHeight = markerPixelHeight(marker.kind, true);

  return (
    <div
      className="pointer-events-none z-[120] w-max max-w-96"
      style={{
        transform: `translate(-50%, calc(-100% - ${pinHeight + 8}px))`,
      }}
    >
      <div className="w-max max-w-96 rounded-lg bg-slate-900 px-3 py-1.5 text-white shadow-lg">
        <p className="text-[10px] leading-snug font-semibold">{marker.label}</p>
        {marker.detail ? (
          <p className="mt-0.5 w-max max-w-96 text-[9px] leading-snug font-medium text-slate-300">
            {marker.detail}
          </p>
        ) : null}
      </div>
      <span className="mx-auto -mt-px block h-2 w-2 rotate-45 bg-slate-900" aria-hidden />
    </div>
  );
}

export function TripRouteMap({
  routeToPickupPolyline,
  routeToDeliveryPolyline,
  currentLocation,
  pickupLocation,
  deliveryLocation,
  dutySegments,
  markers,
  className,
}: TripRouteMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedMarkerKey, setSelectedMarkerKey] = useState<string | null>(null);
  const [hoveredMarkerKey, setHoveredMarkerKey] = useState<string | null>(null);

  const pickupPath = useMemo(
    () => (routeToPickupPolyline?.length ? polylineToPath(routeToPickupPolyline) : []),
    [routeToPickupPolyline],
  );

  const deliveryPath = useMemo(
    () =>
      routeToDeliveryPolyline?.length ? polylineToPath(routeToDeliveryPolyline) : [],
    [routeToDeliveryPolyline],
  );

  const combinedPolyline = useMemo(
    () => mergeRoutePolylines(routeToPickupPolyline, routeToDeliveryPolyline),
    [routeToPickupPolyline, routeToDeliveryPolyline],
  );

  const combinedPath = useMemo(
    () => polylineToPath(combinedPolyline),
    [combinedPolyline],
  );

  const routeMarkers = useMemo(() => {
    const anchors = markers?.length
      ? markers
      : buildTripRouteMarkers(currentLocation, pickupLocation, deliveryLocation);
    const stops = buildHosStopMarkers(dutySegments, combinedPolyline);
    return [...stops, ...anchors];
  }, [
    markers,
    currentLocation,
    pickupLocation,
    deliveryLocation,
    dutySegments,
    combinedPolyline,
  ]);

  const activeMarkerKey = hoveredMarkerKey ?? selectedMarkerKey;
  const activeMarker = useMemo(
    () =>
      activeMarkerKey
        ? routeMarkers.find((marker) => markerKey(marker) === activeMarkerKey)
        : undefined,
    [activeMarkerKey, routeMarkers],
  );

  const markerIcons = useMemo(() => {
    if (!isLoaded) {
      return {
        rest: new Map<RouteMarkerKind, google.maps.Icon>(),
        emphasized: new Map<RouteMarkerKind, google.maps.Icon>(),
      };
    }

    return {
      rest: new Map(
        MARKER_KINDS.map((kind) => [kind, createRouteMarkerIcon(kind)] as const),
      ),
      emphasized: new Map(
        MARKER_KINDS.map(
          (kind) => [kind, createRouteMarkerIcon(kind, { emphasized: true })] as const,
        ),
      ),
    };
  }, [isLoaded]);

  const initialCenter = combinedPath[0] ?? DEFAULT_MAP_CENTER;
  const showPickupLeg = pickupPath.length > 0;
  const showDeliveryLeg = deliveryPath.length > 0;
  const hasFuel = routeMarkers.some((marker) => marker.kind === "fuel");
  const hasBreak = routeMarkers.some((marker) => marker.kind === "break");
  const hasSleeper = routeMarkers.some((marker) => marker.kind === "sleeper");

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      fitMapToRoute(
        map,
        [pickupPath, deliveryPath].filter((path) => path.length),
        routeMarkers,
      );
    },
    [pickupPath, deliveryPath, routeMarkers],
  );

  useEffect(() => {
    if (mapRef.current) {
      fitMapToRoute(
        mapRef.current,
        [pickupPath, deliveryPath].filter((path) => path.length),
        routeMarkers,
      );
    }
  }, [pickupPath, deliveryPath, routeMarkers]);

  if (!hasRoutePolylines(routeToPickupPolyline, routeToDeliveryPolyline)) {
    return null;
  }

  return (
    <div
      className={cn(
        "trip-route-map relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-secondary",
        className,
      )}
    >
      {!isLoaded && !loadError && (
        <div className="flex h-full min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading map...
        </div>
      )}

      {loadError && (
        <div className="flex h-full min-h-48 items-center justify-center px-4 text-center text-sm text-error">
          Failed to load Google Maps.
        </div>
      )}

      {isLoaded && !loadError && (
        <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={initialCenter}
            zoom={DEFAULT_MAP_ZOOM}
            options={mapOptions}
            onLoad={handleMapLoad}
            onClick={() => setSelectedMarkerKey(null)}
          >
            {showPickupLeg && (
              <Polyline path={pickupPath} options={pickupLegPolylineOptions} />
            )}
            {showDeliveryLeg && (
              <Polyline path={deliveryPath} options={deliveryLegPolylineOptions} />
            )}

            {routeMarkers.map((marker) => {
              const key = markerKey(marker);
              const emphasized = key === activeMarkerKey;
              return (
                <Marker
                  key={key}
                  position={marker}
                  icon={
                    emphasized
                      ? markerIcons.emphasized.get(marker.kind)
                      : markerIcons.rest.get(marker.kind)
                  }
                  zIndex={markerZIndex(marker.kind) + (emphasized ? 12 : 0)}
                  options={{ optimized: false }}
                  onMouseOver={() => setHoveredMarkerKey(key)}
                  onMouseOut={() =>
                    setHoveredMarkerKey((current) => (current === key ? null : current))
                  }
                  onClick={() => setSelectedMarkerKey(key)}
                />
              );
            })}

            {activeMarker ? (
              <OverlayView
                key={markerKey(activeMarker)}
                position={activeMarker}
                mapPaneName={OverlayView.FLOAT_PANE}
              >
                <MapPinTooltip marker={activeMarker} />
              </OverlayView>
            ) : null}
          </GoogleMap>

          <div className="pointer-events-none absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-nowrap items-center gap-x-2 overflow-hidden whitespace-nowrap rounded-full border border-slate-200/80 bg-white/95 px-2.5 py-1 text-[10px] font-medium leading-none text-foreground shadow-sm backdrop-blur-sm">
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-2 shrink-0 rounded-full bg-success"
                aria-hidden
              />
              Current
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-2 shrink-0 rounded-full bg-info"
                aria-hidden
              />
              Pickup
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-2 shrink-0 rounded-full bg-foreground"
                aria-hidden
              />
              Destination
            </span>
            {hasFuel ? (
              <span className="flex items-center gap-1">
                <span
                  className="inline-block size-1.5 shrink-0 rounded-full bg-warning"
                  aria-hidden
                />
                Fuel
              </span>
            ) : null}
            {hasBreak ? (
              <span className="flex items-center gap-1">
                <span
                  className="inline-block size-1.5 shrink-0 rounded-full bg-cyan-600"
                  aria-hidden
                />
                30 min
              </span>
            ) : null}
            {hasSleeper ? (
              <span className="flex items-center gap-1">
                <span
                  className="inline-block size-1.5 shrink-0 rounded-full bg-violet-600"
                  aria-hidden
                />
                10 hr
              </span>
            ) : null}
            {showPickupLeg && showDeliveryLeg ? (
              <>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block h-0.5 w-2.5 shrink-0 rounded bg-info"
                    aria-hidden
                  />
                  To pickup
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block h-0.5 w-2.5 shrink-0 rounded bg-foreground"
                    aria-hidden
                  />
                  To delivery
                </span>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
