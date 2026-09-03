import { createContext, useContext } from "react";

export type GoogleMapsContextValue = {
  isLoaded: boolean;
  loadError?: Error;
};

export const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
});

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}
