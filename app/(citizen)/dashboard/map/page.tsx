"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLocationStore } from "@/app/store/useLocationStore";
import { Loader2, Crosshair } from "lucide-react";

// 🚀 CRITICAL: Disable Server-Side Rendering for the Leaflet component!
const DynamicIssueMap = dynamic(() => import("@/components/IssueMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-sm font-semibold text-slate-500 mt-2">Initializing Satellites...</p>
    </div>
  ),
});

export default function MapViewPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const { lat: userLat, lng: userLng, isLoading: isLocationLoading, fetchLocation } = useLocationStore();

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        let url = '/api/issue';
        // We can fetch a wider radius for the map view! Let's do 10km.
        if (userLat && userLng) url += `?lat=${userLat}&lng=${userLng}&radius=500000`; 
        
        const res = await fetch(url);
        if (!res.ok) return;
        
        const data = await res.json();
        if (Array.isArray(data)) setIssues(data);
        else if (data.issues) setIssues(data.issues); 
      } catch (error) {
        console.error("Map data error:", error);
      }
    };
    
    // Only fetch if location isn't actively loading
    if (!isLocationLoading) {
      fetchMapData();
    }
  }, [userLat, userLng, isLocationLoading]);

  return (
    <div className="h-[calc(100dvh-90px)] p-4 flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Grid Map</h1>
          <p className="text-sm text-slate-500">Live spatial visualization of active anomalies.</p>
        </div>
        
        <button 
          onClick={fetchLocation}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          <Crosshair className="w-4 h-4 text-emerald-500" />
          Recenter
        </button>
      </div>

      <div className="flex-1 min-h-0 relative z-0">
        <DynamicIssueMap userLat={userLat} userLng={userLng} issues={issues} />
      </div>
    </div>
  );
}