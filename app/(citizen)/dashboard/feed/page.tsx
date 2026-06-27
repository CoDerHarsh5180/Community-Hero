"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, AlertTriangle, ChevronUp, MessageSquare, Loader2, ChevronLeft, ChevronRight, Send, ThumbsUp } from "lucide-react";
import { useLocationStore } from "@/app/store/useLocationStore";
import { useUserStore } from "@/app/store/useUserStore";

// --- HAVERSINE MATH & CAROUSEL ---
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
}

function ImageCarousel({ urls }: { urls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!urls || urls.length === 0) return null;

  return (
    <div className="w-full h-52 bg-slate-200 dark:bg-zinc-800 relative group overflow-hidden">
      <img src={urls[currentIndex]} alt="Evidence" className="w-full h-full object-cover transition-all" />
      {urls.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p === 0 ? urls.length - 1 : p - 1)); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p === urls.length - 1 ? 0 : p + 1)); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronRight className="w-4 h-4" /></button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {urls.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${currentIndex === i ? "w-3 bg-emerald-500" : "w-1.5 bg-white/60"}`} />)}
          </div>
        </>
      )}
    </div>
  );
}

// --- INTERACTIVE ISSUE CARD COMPONENT ---
function IssueCard({ issue, currentUser }: { issue: any, currentUser: any }) {
  // Map state to your specific schema fields
  const [upvotesCount, setUpvotesCount] = useState<number>(issue.upvotesCount || 0);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(
    currentUser && issue.upvoters ? issue.upvoters.includes(currentUser._id || currentUser.id) : false
  );
  const [comments, setComments] = useState<any[]>(issue.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpvote = async () => {
    if (!currentUser) return alert("Log in to upvote");
    
    // 1. Optimistic UI Update
    const originalHasUpvoted = hasUpvoted;
    const originalCount = upvotesCount;
    
    setHasUpvoted(!originalHasUpvoted);
    setUpvotesCount((prev) => (originalHasUpvoted ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`/api/issue/${issue._id}/upvote`, { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to upvote");
      
      // 🚀 THE FIX: Use (data.upvoters || []) to guarantee it's always an array
      const upvotersArray = data.upvoters || [];
      const userIdToCheck = currentUser._id || currentUser.id;
      
      setUpvotesCount(data.upvotesCount);
      setHasUpvoted(upvotersArray.includes(userIdToCheck));
      
    } catch (error) {
      console.error("Upvote failed:", error);
      // Rollback only if the server failed
      setHasUpvoted(originalHasUpvoted);
      setUpvotesCount(originalCount);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      // Send the required "text" field to the backend[cite: 2]
      const res = await fetch(`/api/issue/${issue._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText })
      });
      
      const data = await res.json();
      if (res.ok && data.issue) {
        // The backend returns the updated issue inside data.issue[cite: 2]
        setComments(data.issue.comments);
        setCommentText(""); // Clear input
      }
    } catch (error) {
      console.error("Comment failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm overflow-hidden flex flex-col justify-between break-inside-avoid mb-6 inline-block w-full">
      <div>
        <ImageCarousel urls={issue.imagesArray} />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{issue.category}</h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
              {issue.status}
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">{issue.detail}</p>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span className="truncate">{issue.addressText || "Local Grid"}</span>
            </div>
            <div className="text-xs font-bold text-emerald-600 pl-5">{issue.distanceStr}</div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-slate-400">
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>@{issue.user?.username || "anonymous"}</span>
          </div>
          
          <div className="flex gap-2">
            {/* UPVOTE BUTTON */}
            <button 
              onClick={handleUpvote}
              className={`flex items-center gap-1 p-2 rounded-full transition-colors ${
                hasUpvoted ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${hasUpvoted ? "stroke-[3px]" : ""}`} />
              <span className="text-xs font-bold">{upvotesCount}</span>
            </button>
            
            {/* TOGGLE COMMENTS BUTTON */}
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-bold">{comments.length}</span>
            </button>
          </div>
        </div>

        {/* EXPANDABLE COMMENT SECTION */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="space-y-3 max-h-40 overflow-y-auto mb-3 pr-2 custom-scrollbar">
              {comments.length === 0 ? (
                <p className="text-xs text-center text-slate-400">No discussions yet. Be the first!</p>
              ) : (
                comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                      @{comment.user?.username || "user"}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">{comment.text}</span>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleComment} className="flex gap-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a field note..."
                className="flex-1 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-xs px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !commentText.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN FEED PAGE ---
// --- MAIN FEED PAGE ---
export default function FeedPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  
  // 🚀 NEW: Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const { lat: userLat, lng: userLng, isLoading: isLocationLoading } = useLocationStore();
  const { user: currentUser } = useUserStore(); 

  useEffect(() => {
    if (isLocationLoading) return;
    const fetchFeed = async () => {
      setIsFeedLoading(true);
      try {
        let url = '/api/issue';
        if (userLat && userLng) url += `?lat=${userLat}&lng=${userLng}&radius=500000`; 
        const res = await fetch(url);
        if (!res.ok) { setIssues([]); return; }
        const data = await res.json();
        if (Array.isArray(data)) setIssues(data);
        else if (data.issues) setIssues(data.issues); 
      } catch (error) {
        console.error("Feed error:", error);
      } finally {
        setIsFeedLoading(false);
      }
    };
    fetchFeed();
  }, [userLat, userLng, isLocationLoading]); 

  // 1. Process distances and normalize arrays (Your existing logic)
  const processedIssues = [...issues].map((issue) => {
    const issueLng = issue.location?.coordinates[0];
    const issueLat = issue.location?.coordinates[1];
    let distanceNum = Infinity; 
    let distanceStr = "Unknown distance";
    
    if (userLat && userLng && issueLat && issueLng) {
      const rawDistance = getDistanceInKm(userLat, userLng, issueLat, issueLng);
      distanceNum = parseFloat(rawDistance);
      distanceStr = `${rawDistance} km away`;
    }
    
    const imagesArray = issue.mediaUrl || [];
    return { ...issue, distanceNum, distanceStr, imagesArray };
  });

  // 🚀 2. NEW: Multi-layer Filtering Logic
  const filteredAndSortedIssues = processedIssues
    .filter((issue) => {
      // A. Text Search (Matches Username, Category, or Description)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        searchQuery === "" ||
        issue.user?.username?.toLowerCase().includes(searchLower) ||
        issue.category?.toLowerCase().includes(searchLower) ||
        issue.detail?.toLowerCase().includes(searchLower);

      // B. Category Dropdown Match
      const matchesCategory = filterCategory === "ALL" || issue.category === filterCategory;

      // C. Status Dropdown Match
      const matchesStatus = filterStatus === "ALL" || issue.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => a.distanceNum - b.distanceNum); // Always keep nearest at the top

  if (isLocationLoading || isFeedLoading) return (
    <div className="h-[calc(100dvh-130px)] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 dark:bg-zinc-950 p-4 pb-12 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Community Feed</h1>
        <p className="text-sm text-slate-500">Recent infrastructural anomalies relative to your grid position.</p>
      </div>

      {/* 🚀 NEW: Search and Filter Control Bar */}
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search by username, issue, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
          />
          <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Filter */}
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border-none rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="Pothole">Pothole</option>
          <option value="Water Leakage">Water Leakage</option>
          <option value="Streetlight Broken">Streetlight Broken</option>
          <option value="Garbage Dump">Garbage Dump</option>
          <option value="Fallen Tree">Fallen Tree</option>
        </select>

        {/* Status Filter */}
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border-none rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="REPORTED">Reported</option>
          <option value="VERIFIED">Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Grid Display */}
      {filteredAndSortedIssues.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reports match your current filters.</p>
          {(searchQuery || filterCategory !== "ALL" || filterStatus !== "ALL") && (
            <button 
              onClick={() => { setSearchQuery(""); setFilterCategory("ALL"); setFilterStatus("ALL"); }}
              className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {filteredAndSortedIssues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}