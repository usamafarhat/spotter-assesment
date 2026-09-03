import { ArrowLeft, Crosshair, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { BottomSheet } from "../ui/BottomSheet";
import { LocationPickerMap } from "../map/LocationPickerMap";
import { PlaceSearchInput } from "../map/PlaceSearchInput";
import { useGoogleMaps } from "../../context/useGoogleMaps";
import { reverseGeocode } from "../../lib/googleMaps";
import type { LocationFieldKey } from "../../types/trip";
import { locationFieldLabels } from "../../types/trip";
import type { SelectedLocation } from "../../types/location";

type LocationPickerSheetProps = {
  open: boolean;
  field: LocationFieldKey | null;
  initialValue: SelectedLocation | null;
  onClose: () => void;
  onConfirm: (location: SelectedLocation) => void;
};

export function LocationPickerSheet({
  open,
  field,
  initialValue,
  onClose,
  onConfirm,
}: LocationPickerSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <LocationPickerBody
        key={field ?? "none"}
        field={field}
        initialValue={initialValue}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </BottomSheet>
  );
}

function LocationPickerBody({
  field,
  initialValue,
  onClose,
  onConfirm,
}: Omit<LocationPickerSheetProps, "open">) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [selected, setSelected] = useState<SelectedLocation | null>(initialValue);
  const [pickerError, setPickerError] = useState<string | undefined>();
  const [isLocating, setIsLocating] = useState(false);

  const title = field ? locationFieldLabels[field] : "Select Location";

  function handleConfirm() {
    if (!selected) {
      setPickerError("Select a location on the map or via search first.");
      return;
    }
    onConfirm(selected);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setPickerError("Geolocation is not supported on this device.");
      return;
    }

    setIsLocating(true);
    setPickerError(undefined);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const resolved = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude,
          );

          if (resolved) {
            setSelected(resolved);
          } else {
            setPickerError("Could not resolve your current address.");
          }
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setPickerError("Unable to access your location. Check permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="flex max-h-[85vh] flex-col">
      <div className="relative flex items-center justify-center border-b border-border px-4 py-3.5 lg:px-5 lg:py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute left-3 lg:hidden"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Button>
        <h2 className="px-12 text-center text-base font-bold text-foreground">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 hidden lg:inline-flex"
          aria-label="Close location picker"
        >
          <X className="size-5" aria-hidden />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
        {!isLoaded && !loadError && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading Google Maps...
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-error/20 bg-error-subtle px-4 py-3 text-sm text-error">
            Failed to load Google Maps. Check your API key and enabled APIs.
          </div>
        )}

        {isLoaded && !loadError && (
          <>
            <PlaceSearchInput
              onSelect={(location) => {
                setPickerError(undefined);
                setSelected(location);
              }}
              onReject={setPickerError}
            />

            <div className="relative">
              <LocationPickerMap selected={selected} onLocationChange={setSelected} />

              <div className="absolute top-3 right-3 left-3 rounded-xl border border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Selected location
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground">
                  {selected?.address ?? "Not selected yet"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-md hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                {isLocating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Crosshair className="size-4" aria-hidden />
                )}
                Use my location
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Search an address or place, or tap the map
            </p>
          </>
        )}

        {pickerError && (
          <p className="text-xs text-error" role="alert">
            {pickerError}
          </p>
        )}
      </div>

      <div className="border-t border-border p-4">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full rounded-xl"
          onClick={handleConfirm}
          disabled={!isLoaded || Boolean(loadError)}
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
