"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, User as UserIcon, Loader2 } from "lucide-react";

// Define the TypeScript interface based on your backend .select() fields
interface RankedUser {
  _id: string;
  name: string;
  username: string;
  communityPoints: number;
  profilePic?: string;
}

export function Leaderboard() {
  const [leaders, setLeaders] = useState<RankedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Fetching from the backend route you provided
        const res = await fetch('/api/users/leaderboard');
        
        if (!res.ok) {
          throw new Error('Failed to fetch rankings');
        }
        
        const data = await res.json();
        setLeaders(data);
      } catch (err) {
        console.error("Leaderboard error:", err);
        setError("Unable to load rankings at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Syncing Ranks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white leading-tight">Top Citizens</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Global Grid</p>
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-4">
        {leaders.length === 0 ? (
          <p className="text-sm text-center text-slate-400 py-4">No citizens ranked yet.</p>
        ) : (
          leaders.map((user, index) => {
            // Determine dynamic styling based on rank position
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;
            
            let rankColor = "text-slate-400";
            if (isFirst) rankColor = "text-amber-500"; // Gold
            if (isSecond) rankColor = "text-slate-300"; // Silver
            if (isThird) rankColor = "text-amber-700"; // Bronze

            return (
              <div 
                key={user._id} 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {/* Rank Number or Medal */}
                <div className={`w-6 flex justify-center font-black ${rankColor}`}>
                  {isFirst ? <Medal className="w-5 h-5" /> : `#${index + 1}`}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${
                  isFirst ? "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-zinc-900" : "bg-slate-200 dark:bg-zinc-800"
                }`}>
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    @{user.username}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">
                    {user.communityPoints}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">
                    Pts
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}