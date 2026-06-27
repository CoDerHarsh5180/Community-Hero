import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lng: number | null;
  addressText: string | null; // NEW: Holds the human-readable city!
  isLoading: boolean;
  error: string | null;
  
  setLocation: (lat: number, lng: number) => void;
  fetchLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lng: null,
  addressText: null, 
  isLoading: false,
  error: null,

  setLocation: (lat, lng) => set({ lat, lng, error: null }),

  fetchLocation: () => {
    set({ isLoading: true, error: null });

    if (!navigator.geolocation) {
      set({ error: "Geolocation is not supported", isLoading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Fire a background request to the free OpenStreetMap reverse-geocoder
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();

          // Safely extract the most accurate location name available
          const city = data.address?.city || data.address?.town || data.address?.state_district || "Unknown Grid";
          const state = data.address?.state || "";
          
          set({ 
            lat, 
            lng, 
            addressText: `${city}, ${state}`, // e.g., "Patna, Bihar"
            isLoading: false 
          });

        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          // Fallback if the API fails but we still have coordinates
          set({ lat, lng, addressText: "Location Locked", isLoading: false });
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        set({ error: "Please allow location access.", isLoading: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }
}));