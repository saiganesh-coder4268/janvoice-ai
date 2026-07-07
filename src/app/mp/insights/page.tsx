"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { WeeklySummary } from "@/types";
import { Lightbulb, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

export default function InsightsPage() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const docRef = doc(db, "weeklySummaries", "week_current");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSummary(docSnap.data() as WeeklySummary);
        }
      } catch (error) {
        console.error("Failed to fetch summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Insights</h1>
          <p className="text-slate-500 mt-1">AI-generated summaries and development recommendations for Visakhapatnam.</p>
        </div>

        {/* AI Recommendations Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Active Recommendations</h2>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Lightbulb className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No active recommendations</h3>
            <p className="text-slate-500 max-w-md">Gemini is currently analyzing civic data across all wards. Check back later for clustered development recommendations.</p>
          </div>
        </div>

        {/* Weekly Summary Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Weekly Summary</h2>
            </div>
            {summary && (
              <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                Week of {summary.weekOf}
              </span>
            )}
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
            ) : summary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                    <AlertTriangle className="h-4 w-4 text-orange-500" /> Major Issues
                  </h3>
                  <ul className="space-y-3">
                    {summary.majorIssues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                    <TrendingUp className="h-4 w-4 text-green-500" /> Recommended Actions
                  </h3>
                  <ul className="space-y-3">
                    {summary.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No weekly summary generated yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
