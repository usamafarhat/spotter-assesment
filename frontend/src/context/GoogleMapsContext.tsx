import type { ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { getGoogleMapsApiKey, GOOGLE_MAPS_LIBRARIES } from "../lib/googleMaps";
import { GoogleMapsContext } from "./useGoogleMaps";

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "spotter-eld-google-maps",
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError: loadError ?? undefined }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
