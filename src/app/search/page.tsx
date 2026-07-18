"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { Search, MapPin, Tag, FileText, Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"), limit(200));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
        setAllComplaints(data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getFilteredResults = () => {
    if (!searchQuery.trim()) return [];
    const lowerQ = searchQuery.toLowerCase();
    return allComplaints.filter(c => 
      c.title?.toLowerCase().includes(lowerQ) ||
      c.description?.toLowerCase().includes(lowerQ) ||
      c.location?.address?.toLowerCase().includes(lowerQ) ||
      c.category?.toLowerCase().includes(lowerQ) ||
      c.id?.toLowerCase().includes(lowerQ)
    );
  };

  const results = getFilteredResults();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'resolved': return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'under_review': return <AlertTriangle className="h-3.5 w-3.5" />;
      case 'assigned': return <Clock className="h-3.5 w-3.5" />;
      default: return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-muted flex flex-col">
      <TopBar />
      
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 mt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">Search Civic Platform</h1>
          <p className="text-muted-foreground">Find issues by location, category, or tracking ID</p>
        </div>

        <div className="relative mb-8 shadow-sm rounded-2xl overflow-hidden">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-5 text-lg bg-card border border-border rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400"
            placeholder="Search for 'pothole', 'MVP Colony', or 'JV-123'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !searchQuery ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">By Location</h3>
              <p className="text-xs text-muted-foreground">Search for issues near a specific address or neighborhood.</p>
            </div>
            
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <Tag className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">By Category</h3>
              <p className="text-xs text-muted-foreground">Find specific types of complaints like roads, waste, or water.</p>
            </div>

            <div className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">By Issue ID</h3>
              <p className="text-xs text-muted-foreground">Track the exact status of a specific complaint using its ID.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
                <p className="text-muted-foreground">No issues found matching "{searchQuery}"</p>
              </div>
            ) : (
              results.map((issue, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={issue.id} 
                  className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                    {issue.imageURLs?.[0] && (
                      <div className="w-full sm:w-32 h-24 relative rounded-lg overflow-hidden shrink-0 bg-muted">
                        <Image 
                          src={issue.imageURLs[0]} 
                          alt={issue.title}
                          fill 
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base text-foreground line-clamp-1">
                          {issue.title}
                        </h3>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(issue.status)} shrink-0`}>
                          {getStatusIcon(issue.status)}
                          <span>{issue.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{issue.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{issue.location?.address || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(issue.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
