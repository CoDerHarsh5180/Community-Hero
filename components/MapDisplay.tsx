"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, MessageSquare, AlertTriangle } from "lucide-react";

// Fix Leaflet's default pin icon asset bug in Next.js 15
import "leaflet/dist/leaflet.css";

const customMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to smoothly center the map when the user's location changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 14);
    }
  }, [lat, lng, map]);
  return null;
}

interface IssuePin {
  _id: string;
  category: string;
  detail: string;
  location: { coordinates: [number, number] }; // [lng, lat] GeoJSON format
}

interface MapDisplayProps {
  userLat: number;
  userLng: number;
  issues: IssuePin[];
}

export default function MapDisplay({ userLat, userLng, issues }: MapDisplayProps) {
  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={[userLat, userLng]} 
        zoom={14} 
        className="w-full h-full z-10"
        zoomControl={false} // Hidden to match mobile-first clean aesthetics
      >
        {/* We use standard, free, clean OpenStreetMap Carto tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Dynamic Map Recenter Trigger */}
        <RecenterMap lat={userLat} lng={userLng} />

        {/* 1. User's Current Location Blue Pin */}
        <Marker position={[userLat, userLng]} icon={customMarkerIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-bold text-sm text-emerald-600">You Are Here</p>
              <p className="text-[10px] text-slate-400 font-mono">GPS Locked</p>
            </div>
          </Popup>
        </Marker>

        {/* 2. Loop Through and Render Nearby Issue Pins */}
        {issues.map((issue) => {
          // MongoDB GeoJSON format is [lng, lat], so we invert it for Leaflet [lat, lng]
          const [lng, lat] = issue.location.coordinates;

          return (
            <Marker key={issue._id} position={[lat, lng]} icon={customMarkerIcon}>
              <Popup className="rounded-xl overflow-hidden"/>
                <div className="p-2 max-w-[200px]">
                  <div className="flex items-center gap-1 text-amber-600 font-bold text-sm mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{issue.category}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                    {issue.detail}
                  </p>
                  <button className="w-full text-center text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded-md transition-colors">
                    View Details
                  </button>
                </div>
              </Marker>
            );
        })}
      </MapContainer>
    </div>
  );
}