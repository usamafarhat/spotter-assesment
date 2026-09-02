import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { LocationDto, RoutePolyline } from "@/api/EldPlanner/modules/trips/trips.types";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { cn } from "@/lib/cn";
import {
  buildTripRouteMarkers,
  createRouteMarkerIcon,
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

const polylineOptions: google.maps.PolylineOptions = {
  strokeColor: "#000000",
  strokeOpacity: 0.9,
  strokeWeight: 4,
  geodesic: true,
};

type TripRouteMapProps = {
  polyline?: RoutePolyline | null;
  currentLocation?: LocationDto;
  pickupLocation?: LocationDto;
  deliveryLocation?: LocationDto;
  markers?: RouteMapMarker[];
  className?: string;
};

function fitMapToRoute(
  map: google.maps.Map,
  path: google.maps.LatLngLiteral[],
  extraMarkers: RouteMapMarker[],
) {
  if (!path.length) {
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  for (const point of path) {
    bounds.extend(point);
  }
  for (const marker of extraMarkers) {
    bounds.extend(marker);
  }

  map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
}

export function TripRouteMap({
  polyline,
  currentLocation,
  pickupLocation,
  deliveryLocation,
  markers,
  className,
}: TripRouteMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);

  const path = useMemo(
    () => (polyline?.length ? polylineToPath(polyline) : []),
    [polyline],
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

  const initialCenter = path[0] ?? DEFAULT_MAP_CENTER;

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      fitMapToRoute(map, path, routeMarkers);
    },
    [path, routeMarkers],
  );

  useEffect(() => {
    if (mapRef.current && path.length) {
      fitMapToRoute(mapRef.current, path, routeMarkers);
    }
  }, [path, routeMarkers]);

  if (!polyline?.length) {
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
            <Polyline path={path} options={polylineOptions} />

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
          </div>
        </>
      )}
    </div>
  );
}
