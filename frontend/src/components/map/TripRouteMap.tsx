import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  LocationDto,
  RoutePolyline,
} from "@/api/EldPlanner/modules/trips/trips.types";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { cn } from "@/lib/cn";
import {
  buildTripRouteMarkers,
  createRouteMarkerIcon,
  hasRoutePolylines,
  mergeRoutePolylines,
  polylineToPath,
  type RouteMapMarker,
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

export function TripRouteMap({
  routeToPickupPolyline,
  routeToDeliveryPolyline,
  currentLocation,
  pickupLocation,
  deliveryLocation,
  markers,
  className,
}: TripRouteMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);

  const pickupPath = useMemo(
    () => (routeToPickupPolyline?.length ? polylineToPath(routeToPickupPolyline) : []),
    [routeToPickupPolyline],
  );

  const deliveryPath = useMemo(
    () =>
      routeToDeliveryPolyline?.length ? polylineToPath(routeToDeliveryPolyline) : [],
    [routeToDeliveryPolyline],
  );

  const combinedPath = useMemo(
    () =>
      polylineToPath(
        mergeRoutePolylines(routeToPickupPolyline, routeToDeliveryPolyline),
      ),
    [routeToPickupPolyline, routeToDeliveryPolyline],
  );

  const routeMarkers = useMemo(() => {
    if (markers?.length) {
      return markers;
    }
    return buildTripRouteMarkers(currentLocation, pickupLocation, deliveryLocation);
  }, [markers, currentLocation, pickupLocation, deliveryLocation]);

  const markerIcons = useMemo(() => {
    if (!isLoaded) {
      return new Map<RouteMapMarker["kind"], google.maps.Icon>();
    }

    return new Map<RouteMapMarker["kind"], google.maps.Icon>([
      ["current", createRouteMarkerIcon("current")],
      ["pickup", createRouteMarkerIcon("pickup")],
      ["destination", createRouteMarkerIcon("destination")],
    ]);
  }, [isLoaded]);

  const initialCenter = combinedPath[0] ?? DEFAULT_MAP_CENTER;
  const showPickupLeg = pickupPath.length > 0;
  const showDeliveryLeg = deliveryPath.length > 0;

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
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-secondary",
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
          >
            {showPickupLeg && (
              <Polyline path={pickupPath} options={pickupLegPolylineOptions} />
            )}
            {showDeliveryLeg && (
              <Polyline path={deliveryPath} options={deliveryLegPolylineOptions} />
            )}

            {routeMarkers.map((marker) => (
              <Marker
                key={`${marker.kind}-${marker.lat}-${marker.lng}`}
                position={marker}
                title={marker.label}
                icon={markerIcons.get(marker.kind)}
              />
            ))}
          </GoogleMap>

          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-lg border border-border bg-card/95 px-2.5 py-1.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur">
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-2.5 rounded-full bg-success"
                aria-hidden
              />
              Current
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-2.5 rounded-full bg-info"
                aria-hidden
              />
              Pickup
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-2.5 rounded-full bg-foreground"
                aria-hidden
              />
              Destination
            </span>
            {showPickupLeg && showDeliveryLeg ? (
              <>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block h-0.5 w-3 rounded bg-info"
                    aria-hidden
                  />
                  To pickup
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block h-0.5 w-3 rounded bg-foreground"
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
