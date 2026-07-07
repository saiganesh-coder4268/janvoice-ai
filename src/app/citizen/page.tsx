"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { MapPin, Clock, AlertCircle, CheckCircle, FileText } from "lucide-react";

export default function CitizenDashboard() {
  const { user, loading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'reported' | 'pending' | 'resolved'>('reported');

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
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
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
        <p className="text-slate-600 mb-8 max-w-md">You need to sign in to view the public complaints and track issues in Visakhapatnam.</p>
      </div>
    );
  }

  // Filter complaints based on status
  const reportedIssues = complaints.filter(c => c.status === 'reported');
  const pendingIssues = complaints.filter(c => c.status === 'under_review' || c.status === 'assigned');
  const resolvedIssues = complaints.filter(c => c.status === 'resolved');

  const getActiveList = () => {
    switch (activeTab) {
      case 'reported':
        return reportedIssues;
      case 'pending':
        return pendingIssues;
      case 'resolved':
        return resolvedIssues;
    }
  };

  const activeComplaints = getActiveList();

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'reported':
        return {
          title: "No Reported Issues",
          desc: "There are currently no newly reported civic issues. Everything is clean or undergoing review!"
        };
      case 'pending':
        return {
          title: "No Pending Issues",
          desc: "All reported complaints have been resolved or are up-to-date! No issues are currently pending."
        };
      case 'resolved':
        return {
          title: "No Resolved Issues",
          desc: "No issues have been marked as resolved yet. Authorities are currently reviewing reported complaints."
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Public Complaints</h1>
        <p className="text-slate-500 mt-1">Track reported, pending, and resolved community issues in Visakhapatnam.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reported')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'reported'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <AlertCircle className="h-4.5 w-4.5" />
            Reported Issues
            <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'reported' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {reportedIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'pending'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Clock className="h-4.5 w-4.5" />
            Pending Issues
            <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {pendingIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'resolved'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <CheckCircle className="h-4.5 w-4.5" />
            Resolved Issues
            <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {resolvedIssues.length}
            </span>
          </button>
        </div>
      </div>

      {/* Grid List or Empty State */}
      {activeComplaints.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center text-center shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{getEmptyStateMessage().title}</h3>
          <p className="text-slate-500 max-w-sm">{getEmptyStateMessage().desc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
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
              <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{complaint.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{complaint.description}</p>
              
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{complaint.location.address} (Ward {complaint.location.ward})</span>
                </div>
                <div className="flex items-center text-xs text-slate-500 gap-2">
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
