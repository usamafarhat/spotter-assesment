import { GoogleMap, Marker } from "@react-google-maps/api";
import { useCallback, useState } from "react";
import { getMapCenter, getMapZoom, reverseGeocode } from "../../lib/googleMaps";
import type { SelectedLocation } from "../../types/location";

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

type LocationPickerMapProps = {
  selected: SelectedLocation | null;
  onLocationChange: (location: SelectedLocation) => void;
};

export function LocationPickerMap({
  selected,
  onLocationChange,
}: LocationPickerMapProps) {
  const [isResolving, setIsResolving] = useState(false);

  const resolveLocation = useCallback(
    async (latitude: number, longitude: number) => {
      setIsResolving(true);
      try {
        const resolved = (await reverseGeocode(latitude, longitude)) ?? {
          address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          latitude,
          longitude,
        };
        onLocationChange(resolved);
      } finally {
        setIsResolving(false);
      }
    },
    [onLocationChange],
  );

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-secondary">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={getMapCenter(selected)}
        zoom={getMapZoom(selected)}
        options={mapOptions}
        onClick={(event) => {
          const lat = event.latLng?.lat();
          const lng = event.latLng?.lng();
          if (lat !== undefined && lng !== undefined) {
            void resolveLocation(lat, lng);
          }
        }}
      >
        {selected && (
          <Marker
            position={{
              lat: selected.latitude,
              lng: selected.longitude,
            }}
            draggable
            onDragEnd={(event) => {
              const lat = event.latLng?.lat();
              const lng = event.latLng?.lng();
              if (lat !== undefined && lng !== undefined) {
                void resolveLocation(lat, lng);
              }
            }}
          />
        )}
      </GoogleMap>

      {isResolving && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 text-xs font-medium text-foreground backdrop-blur-[1px]">
          Resolving address...
        </div>
      )}
    </div>
  );
}
