"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import TopBar from "@/components/layout/TopBar";
import { CheckCircle2, Clock, MapPin, Bell } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function NotificationsPage() {
  const [resolvedIssues, setResolvedIssues] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResolved = async () => {
      try {
        const q = query(
          collection(db, "complaints"),
          orderBy("createdAt", "desc"),
          limit(100)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
        
        // Filter in memory to avoid needing a Firestore composite index
        const resolved = data.filter(c => c.status === "resolved");
        setResolvedIssues(resolved);
      } catch (error) {
        console.error("Error fetching resolved issues:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResolved();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Civic Updates</h1>
            <p className="text-sm text-slate-500">Recently resolved issues and community updates</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : resolvedIssues.length > 0 ? (
          <div className="space-y-4">
            {resolvedIssues.map((issue, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={issue.id} 
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
                  {issue.imageURLs?.[0] && (
                    <div className="w-full sm:w-48 h-32 relative rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <Image 
                        src={issue.imageURLs[0]} 
                        alt="Issue resolution" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-slate-900 line-clamp-2">
                        {issue.description || "Civic issue successfully resolved"}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{issue.location?.address || "Vizag Area"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(issue.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Link href="/map" className="text-sm font-semibold text-green-600 hover:text-green-700 inline-flex items-center gap-1">
                        View on Live Map <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No recent resolutions</h3>
            <p className="text-slate-500">There are no recently solved issues in your area.</p>
          </div>
        )}
      </div>
    </main>
  );
}
