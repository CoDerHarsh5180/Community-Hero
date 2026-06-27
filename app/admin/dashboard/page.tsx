"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, ShieldAlert, CheckCircle2, Clock, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/issue");
        const data = await res.json();
        const rawIssues = Array.isArray(data) ? data : data.issues || [];
        setIssues(rawIssues);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- 1. DYNAMIC DATA AGGREGATION (Impact Metrics) ---
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === "RESOLVED").length;
  const activeIssues = issues.filter(i => i.status !== "RESOLVED").length;
  
  // Calculate Average AI Severity
  const avgSeverity = totalIssues > 0 
    ? (issues.reduce((sum, i) => sum + (Number(i.aiSeverity) || 0), 0) / totalIssues).toFixed(1) 
    : "0.0";

  // --- 2. PREDICTIVE INSIGHTS ENGINE (Gemini Integration) ---
  const generatePredictiveInsights = async () => {
    if (issues.length === 0) return alert("No active data to analyze.");
    
    setIsGeneratingInsights(true);
    try {
      // We pass a lightweight summary of our current issues database to the AI
      const dataSummary = issues.map(i => ({
        category: i.aiCategory || i.category,
        severity: i.aiSeverity,
        department: i.aiDepartment,
        landmark: i.addressText,
        date: i.createdAt
      }));

      // Reusing your text enhancement approach for an interactive data call
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `You are an advanced predictive urban intelligence model. 
                 Analyze this live JSON array of reported municipal issues and generate a highly professional 'Predictive Insights & Hazard Risk Report'. 
                 Identify spatial patterns, clusters of failures (e.g., multiple water leaks leading to potential road cave-ins), and recommend immediate preventive maintenance deployment.
                 Format your answer with bullet points and bold warning titles. Keep it under 5 sentences total.
                 
                 Live Data: ${JSON.stringify(dataSummary)}`
        }),
      });

      if (!res.ok) throw new Error("Failed to process data strings");
      const data = await res.json();
      setAiInsights(data.enhancedText);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiInsights("Error calculating predictive models. Please verify your Gemini connection.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Aggregating Grid Metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-500" />
          Impact & Predictive Analytics
        </h1>
        <p className="text-sm text-slate-500">Real-time overview of community health parameters and system throughput.</p>
      </div>

      {/* --- IMPACT DASHBOARD METRICS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Incidents</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalIssues}</h3>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-xl text-slate-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grid Resolved</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{resolvedIssues}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Threats</p>
            <h3 className="text-3xl font-black text-blue-500 mt-1">{activeIssues}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mean AI Severity</p>
            <h3 className="text-3xl font-black text-red-500 mt-1">{avgSeverity}/5.0</h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* --- PREDICTIVE INSIGHTS WIDGET --- */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">AI Predictive Modeling</h2>
              <p className="text-xs text-slate-500 mt-0.5">Scans structural incident histories to pre-emptively calculate grid failures.</p>
            </div>
          </div>

          <button
            onClick={generatePredictiveInsights}
            disabled={isGeneratingInsights}
            className="h-11 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGeneratingInsights ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Compiling Tensor Models...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Run Predictive Analysis</>
            )}
          </button>
        </div>

        {/* Insights Screen Output */}
        {aiInsights ? (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-5 rounded-2xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line animate-in fade-in duration-500">
            {aiInsights}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-zinc-700 mb-2" />
            <p className="text-sm text-slate-400 font-bold">Predictive buffer empty.</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">Click the button above to generate a live preventative risk report using your active MongoDB clusters.</p>
          </div>
        )}
      </div>

    </div>
  );
}