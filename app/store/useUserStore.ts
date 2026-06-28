import { create } from 'zustand';
import axios from 'axios';
import { redirect } from 'next/navigation';
// ==========================================
// 1. GAMIFICATION RANK HELPER
// ==========================================
// We export this in case a component needs to calculate rank for *other* users (like on the Leaderboard),
// but the store will automatically calculate it for the logged-in user!
export function getRankFromPoints(points: number = 0) {
  if (points < 100) return { title: "Bronze Observer", color: "text-orange-700" };
  if (points < 500) return { title: "Silver Hero", color: "text-slate-500" };
  if (points < 1000) return { title: "Gold Guardian", color: "text-amber-500" };
  if (points < 2000) return { title: "Platinum Leader", color: "text-cyan-500" };
  
  return { title: "Diamond Legend", color: "text-purple-500" };
}

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  communityPoints: number;
  role:string
}

export interface Issue {
  _id: string;
  category: string;
  detail: string;
  addressText: string;
  status: "REPORTED" | "VERIFIED" | "IN_PROGRESS" | "RESOLVED";
  mediaUrls: string[];
  createdAt?: string; // Standard timestamp from MongoDB
}

interface UserState {
  user: User | null;
  issues: Issue[]; // The user's personal report history
  rank: { title: string; color: string } | null; // Automatically calculated on fetch
  
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// ==========================================
// 3. THE ZUSTAND STORE
// ==========================================
export const useUserStore = create<UserState>((set) => ({
  user: null,
  issues: [],
  rank: null,
  isLoading: true, // Start true to prevent UI flickering before auth checks
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      // The browser automatically attaches the HttpOnly auth-token cookie here
      const res = await axios.get('/api/users/me'); 
      
      if (!res.data) throw new Error('Not authenticated');
      
      const data = await res.data
      
      // Extract data (handling potential 'issue' vs 'issues' naming from your backend)
      const fetchedUser = data.profile;
      const fetchedIssues = data.reports ||  []; 
      console.log(res.data)
      // Calculate rank instantly based on their current points
      const currentRank = getRankFromPoints(fetchedUser.communityPoints);

      set({ 
        user: fetchedUser, 
        issues: fetchedIssues,
        rank: currentRank,
        isAuthenticated: true, 
        isLoading: false 
      });
      console.log(res.data)
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ 
        user: null, 
        issues: [],
        rank: null,
        isAuthenticated: false, 
        isLoading: false 
      });
      redirect('/signin')
    }
  },

  logout: async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      // Wipe the global state clean
      set({ 
        user: null, 
        issues: [],
        rank: null,
        isAuthenticated: false 
      });
      
      // Optional: Force a hard redirect back to login
      window.location.href = '/signin';
    } catch (error) {
      console.error("Logout failed", error);
    }
  }
}));