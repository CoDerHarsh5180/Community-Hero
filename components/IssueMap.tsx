"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertTriangle, MapPin, Clock } from "lucide-react";

// 🚀 FIX: Next.js breaks default Leaflet icons. We create a beautiful custom HTML icon!
const customMarkerIcon = new L.DivIcon({
  className: "custom-leaflet-icon",
  html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Helper component to auto-center the map when the user's GPS updates
function MapCenterer({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function IssueMap({ 
  userLat, 
  userLng, 
  issues 
}: { 
  userLat: number | null; 
  userLng: number | null; 
  issues: any[];
}) {
  // Fallback coordinates set to Patna network grid
  const defaultCenter: [number, number] = [25.5941, 85.1376];
  const center: [number, number] = userLat && userLng ? [userLat, userLng] : defaultCenter;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        {/* The free OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterer center={center} />

        {/* The User's Current Location Pin */}
        {userLat && userLng && (
          <Marker 
            position={[userLat, userLng]} 
            icon={new L.DivIcon({
              className: "user-location-icon",
              html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="font-bold text-slate-800">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Plotting all the Issues */}
        {issues.map((issue) => {
          const issueLng = issue.location?.coordinates[0];
          const issueLat = issue.location?.coordinates[1];
          
          if (!issueLat || !issueLng) return null;

          return (
            <Marker key={issue._id} position={[issueLat, issueLng]} icon={customMarkerIcon}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  {/* Image Thumbnail inside Popup */}
                  {issue.mediaUrl && issue.mediaUrl.length > 0 && (
                    <img 
                      src={issue.mediaUrl[0]} 
                      alt="Issue" 
                      className="w-full h-24 object-cover rounded-lg mb-2" 
                    />
                  )}
                  
                  <div className="flex items-center gap-1.5 mb-1 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <strong className="font-bold">{issue.category}</strong>
                  </div>
                  
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">{issue.detail}</p>
                  
                  <div className="text-[10px] text-slate-500 flex flex-col gap-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {issue.addressText}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> @{issue.user?.username || "anonymous"}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}