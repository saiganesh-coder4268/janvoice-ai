"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { motion } from "framer-motion";
import { Clock, CheckCircle, MapPin, AlertCircle } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MyComplaintsPage() {
  const { user, loading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    // Initial parse of URL for direct routing from profile
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    if (statusParam === 'reported' || statusParam === 'resolved') {
      setFilter(statusParam);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/"); // Redirect if not logged in
      return;
    }

    const fetchComplaints = async () => {
      try {
        const q = query(
          collection(db, "complaints"),
          where("createdBy", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const userComplaints = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Complaint[];
        
        // Sort client-side to avoid requiring a composite index in Firestore
        userComplaints.sort((a, b) => {
          const dateA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date(a.createdAt).getTime();
          const dateB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        setComplaints(userComplaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchComplaints();
  }, [user, loading, router]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Complaints</h1>
          <p className="text-muted-foreground">Track the status of the issues you've reported.</p>
        </div>

        {complaints.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-secondary items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No complaints found</h3>
            <p className="text-muted-foreground mb-6">You haven't reported any issues yet.</p>
            <button 
              onClick={() => router.push("/citizen/new")}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Report an Issue
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 border-b border-border pb-px">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${filter === 'all' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              >
                All Issues
              </button>
              <button 
                onClick={() => setFilter('reported')} 
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${filter === 'reported' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilter('resolved')} 
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${filter === 'resolved' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              >
                Resolved
              </button>
            </div>
            <div className="grid gap-6">
              {complaints
                .filter(c => filter === 'all' || (filter === 'reported' ? c.status !== 'resolved' : c.status === 'resolved'))
                .map((complaint, index) => {
                const isResolved = complaint.status === "resolved";
                
                return (
                <motion.div
                  key={complaint.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {complaint.imageURLs && complaint.imageURLs.length > 0 ? (
                      <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden shrink-0 border border-border">
                        <Image 
                          src={complaint.imageURLs[0]} 
                          alt={complaint.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-48 h-32 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border">
                        <MapPin className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-semibold line-clamp-1">{complaint.title}</h3>
                        
                        {/* Status Badge */}
                        <div className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isResolved 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" 
                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30"
                        }`}>
                          {isResolved ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Resolved</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{complaint.description}</p>
                      
                      <div className="mt-auto flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{complaint.location.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md">
                          <span className="capitalize">{complaint.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md">
                          <span>
                            {complaint.createdAt && typeof (complaint.createdAt as any).toDate === 'function' ? (complaint.createdAt as any).toDate().toLocaleDateString() : (complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Unknown Date')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
              })}
              {complaints.filter(c => filter === 'all' || (filter === 'reported' ? c.status !== 'resolved' : c.status === 'resolved')).length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border">
                  No issues found for this filter.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
