"use client";

import { useUserStore } from "@/app/store/useUserStore";
import { useLocationStore } from "@/app/store/useLocationStore";
import { MapPin, AlertTriangle, Clock, CheckCircle, Loader2, LogOut, ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  // Grab the user data and their specific issues from Zustand
  const { user, issues, rank, logout, isLoading } = useUserStore();
  const { addressText, isLoading: isLocationLoading } = useLocationStore();

  if (isLoading || !user) {
    return (
      <div className="h-[calc(100dvh-130px)] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Decrypting Profile Data...</p>
      </div>
    );
  }

  // Helper function to color-code the status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'VERIFIED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-400'; // REPORTED
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-zinc-950 p-4 md:p-8 pb-12 max-w-5xl mx-auto space-y-6">
      
      {/* --- PROFILE HEADER CARD --- */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden ring-4 ring-slate-50 dark:ring-zinc-950 shadow-inner shrink-0">
            { (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-400">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">@{user.username}</p>
            
            <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-slate-500">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="uppercase tracking-wider">
                {isLocationLoading ? "Scanning Satellites..." : addressText || "Unknown Grid"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <div className="flex gap-4 text-center">
            <div className="bg-slate-50 dark:bg-zinc-950/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="text-2xl font-black text-emerald-600">{user.communityPoints || 0}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points</div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="text-2xl font-black text-amber-500">{issues.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports</div>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 px-4 py-2 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            DISCONNECT
          </button>
        </div>
      </div>

      {/* --- REPORT HISTORY SECTION --- */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <ShieldAlert className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Field Reports</h2>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 dark:text-slate-300 font-bold text-lg">No anomalies reported</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Your grid history is clean. Use the AI Camera to flag infrastructure issues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <div 
                key={issue._id} 
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-4 shadow-sm flex gap-4 transition-all hover:border-slate-200 dark:hover:border-zinc-700"
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                  {issue.mediaUrls && issue.mediaUrls.length > 0 ? (
                    <img src={issue.mediaUrls[0]} alt="Issue thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate pr-2">
                        {issue.category}
                      </h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {issue.detail}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Unknown date'}
                    </div>
                    {issue.status === 'RESOLVED' && (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Fixed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}