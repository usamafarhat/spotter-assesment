import { Autocomplete } from "@react-google-maps/api";
import { Search } from "lucide-react";
import { useRef } from "react";
import { validatePlaceSelection } from "../../lib/googleMaps";
import type { SelectedLocation } from "../../types/location";

type PlaceSearchInputProps = {
  onSelect: (location: SelectedLocation) => void;
  onReject: (message: string) => void;
};

export function PlaceSearchInput({ onSelect, onReject }: PlaceSearchInputProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Autocomplete
      onLoad={(autocomplete) => {
        autocompleteRef.current = autocomplete;
      }}
      onPlaceChanged={() => {
        const place = autocompleteRef.current?.getPlace();
        if (!place) return;

        const result = validatePlaceSelection(place);
        if (result.ok) {
          onSelect(result.location);
          if (inputRef.current) {
            inputRef.current.value = result.location.address;
          }
          return;
        }

        onReject(result.reason);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }}
      options={{
        fields: ["formatted_address", "geometry", "name", "types"],
        types: ["establishment", "geocode"],
      }}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search address or place..."
          className="flex h-10 w-full rounded-full border border-input bg-background py-2 pr-3 pl-9 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>
    </Autocomplete>
  );
}
