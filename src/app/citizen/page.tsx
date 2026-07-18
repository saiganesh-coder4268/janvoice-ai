"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { MapPin, Clock, AlertCircle, CheckCircle, FileText, Plus } from "lucide-react";

export default function CitizenDashboard() {
  const { user, loading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    if (!loading && user) {
      const fetchComplaints = async () => {
        try {
          const q = query(collection(db, "complaints"));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
          
          // Sort client side by createdAt desc to avoid needing a composite index
          data.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toDate?.().getTime() || 0;
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toDate?.().getTime() || 0;
            return dateB - dateA;
          });
          
          setComplaints(data);
        } catch (error) {
          console.error("Failed to fetch complaints", error);
        } finally {
          setFetching(false);
        }
      };
      fetchComplaints();
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  if (loading || fetching) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary rounded"></div>
              <div className="h-4 bg-secondary rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-muted-foreground mb-8 max-w-md">You need to sign in to view the public complaints and track issues in Visakhapatnam.</p>
      </div>
    );
  }

  // Filter complaints based on status
  const allIssues = complaints;
  const pendingIssues = complaints.filter(c => c.status !== 'resolved');
  const resolvedIssues = complaints.filter(c => c.status === 'resolved');

  const getActiveList = () => {
    switch (activeTab) {
      case 'all':
        return allIssues;
      case 'pending':
        return pendingIssues;
      case 'resolved':
        return resolvedIssues;
    }
  };

  const activeComplaints = getActiveList();

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'all':
        return {
          title: "No Issues Found",
          desc: "There are currently no civic issues reported in the system."
        };
      case 'pending':
        return {
          title: "No Pending Issues",
          desc: "All reported complaints have been resolved! No issues are currently pending."
        };
      case 'resolved':
        return {
          title: "No Resolved Issues",
          desc: "No issues have been marked as resolved yet. Authorities are currently reviewing reported complaints."
        };
    }
  };

  return (
    <div className="space-y-8 pb-16 sm:pb-0">
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Link href="/citizen/new" className="flex items-center justify-center h-14 w-14 bg-blue-600 text-primary-foreground rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all">
          <Plus className="h-6 w-6" />
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Public Complaints</h1>
          <p className="text-muted-foreground mt-1">Track reported, pending, and resolved community issues in Visakhapatnam.</p>
        </div>
        <Link href="/citizen/new" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-primary-foreground font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0 shadow-sm">
          <Plus className="h-5 w-5" />
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-border">
        <div className="flex space-x-8 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            All Issues
            <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
            }`}>
              {allIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'pending'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <Clock className="h-4.5 w-4.5" />
            Pending Issues
            <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
            }`}>
              {pendingIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'resolved'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <CheckCircle className="h-4.5 w-4.5" />
            Resolved Issues
            <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
            }`}>
              {resolvedIssues.length}
            </span>
          </button>
        </div>
      </div>

      {/* Grid List or Empty State */}
      {activeComplaints.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center text-center shadow-sm">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{getEmptyStateMessage().title}</h3>
          <p className="text-muted-foreground max-w-sm">{getEmptyStateMessage().desc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize
                  ${complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : ''}
                  ${complaint.status === 'reported' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${complaint.status === 'under_review' ? 'bg-blue-100 text-blue-700' : ''}
                  ${complaint.status === 'assigned' ? 'bg-purple-100 text-purple-700' : ''}
                `}>
                  {complaint.status.replace("_", " ")}
                </span>
                <span className={`h-3 w-3 rounded-full 
                  ${complaint.severity === 'critical' ? 'bg-red-500 animate-pulse' : ''}
                  ${complaint.severity === 'high' ? 'bg-red-500' : ''}
                  ${complaint.severity === 'medium' ? 'bg-orange-600' : ''}
                  ${complaint.severity === 'low' ? 'bg-purple-500' : ''}
                `} title={`Severity: ${complaint.severity}`}></span>
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1">{complaint.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{complaint.description}</p>
              
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{complaint.location.address} (Ward {complaint.location.ward})</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {complaint.createdAt instanceof Date 
                      ? complaint.createdAt.toLocaleDateString()
                      : (complaint.createdAt as any)?.toDate?.().toLocaleDateString() || 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
