"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, XCircle, Loader2, UserCircle, Save } from "lucide-react";

const AVAILABLE_CATEGORIES = [
  "Pothole", 
  "Water Leakage", 
  "Streetlight Broken", 
  "Garbage Dump", 
  "Fallen Tree", 
  "Other"
];

export default function AuthoritiesManagementPage() {
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Track selected categories for each user: { [userId]: ["Pothole", "Water Leakage"] }
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/authorities");
      
      // 🚀 1. Read it as raw text first so it can't crash
      const rawText = await res.text();
      console.log("Raw Server Response:", rawText); 
      console.log("Status Code:", res.status);

      // 🚀 2. If the text is empty, throw a custom error
      if (!rawText) {
        throw new Error(`Server returned an empty response. Status: ${res.status}`);
      }

      // 🚀 3. Now it is safe to parse
      const data = JSON.parse(rawText);

      if (!res.ok) {
        throw new Error(data.error || `HTTP Error: ${res.status}`);
      }
      
      setAuthorities(data);

      const initialPermissions: Record<string, string[]> = {};
      data.forEach((user: any) => {
        initialPermissions[user._id] = user.assignedCategories || [];
      });
      setPermissions(initialPermissions);

    } catch (error: any) {
      console.error("Fetch failed:", error.message);
      alert(`Fetch failed: ${error.message}`); 
    } finally {
      setIsLoading(false);
    }
  };
  const toggleCategory = (userId: string, category: string) => {
    setPermissions((prev) => {
      const userCats = prev[userId] || [];
      if (userCats.includes(category)) {
        return { ...prev, [userId]: userCats.filter(c => c !== category) };
      } else {
        return { ...prev, [userId]: [...userCats, category] };
      }
    });
  };

  const handleUpdateAccess = async (userId: string, action: 'UPDATE_ACCESS' | 'REVOKE') => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/authorities/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action, 
          assignedCategories: permissions[userId] || [] 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (action === 'REVOKE') {
        setAuthorities((prev) => prev.filter(user => user._id !== userId));
      } else {
        // Update local state to show they are now an approved AUTHORITY
        setAuthorities((prev) => prev.map(user => 
          user._id === userId ? { ...user, role: 'AUTHORITY', approvalStatus: 'APPROVED' } : user
        ));
      }
      
      alert(data.message);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading access control lists...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-500" />
          Authority Access Control
        </h1>
        <p className="text-sm text-slate-500">Assign specific issue categories to municipal officials.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 w-1/4">Official Detail</th>
                <th className="p-4 w-1/2">Category Permissions</th>
                <th className="p-4 w-1/4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {authorities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 font-medium">No authorities found.</td>
                </tr>
              ) : (
                authorities.map((user) => {
                  const userPermissions = permissions[user._id] || [];
                  const isPending = user.approvalStatus === 'NOT_APPLICABLE' || user.approvalStatus === 'REJECTED';

                  return (
                    <tr key={user._id} className={`transition-colors ${isPending ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}>
                      
                      {/* USER DETAILS */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 shrink-0">
                            <UserCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                              {user.name}
                              {isPending && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Pending</span>}
                            </p>
                            <p className="text-xs text-slate-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY TOGGLES */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_CATEGORIES.map(category => {
                            const isSelected = userPermissions.includes(category);
                            return (
                              <button
                                key={category}
                                onClick={() => toggleCategory(user._id, category)}
                                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${
                                  isSelected 
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-slate-500'
                                }`}
                              >
                                {category}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right space-x-2">
                        <button 
                          disabled={updatingId === user._id}
                          onClick={() => handleUpdateAccess(user._id, 'REVOKE')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updatingId === user._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Revoke
                        </button>
                        
                        <button 
                          disabled={updatingId === user._id || userPermissions.length === 0}
                          onClick={() => handleUpdateAccess(user._id, 'UPDATE_ACCESS')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updatingId === user._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isPending ? <ShieldCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />)}
                          {isPending ? "Approve Access" : "Save Changes"}
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}