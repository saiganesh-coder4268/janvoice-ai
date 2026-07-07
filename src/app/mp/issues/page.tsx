"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { MapPin, Search, Clock, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IssuesPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const handleResolve = async (id: string) => {
    try {
      const complaintRef = doc(db, "complaints", id);
      await updateDoc(complaintRef, { status: "resolved" });
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: "resolved" } : c));
    } catch (error) {
      console.error("Failed to resolve complaint", error);
      alert("Failed to resolve issue.");
    }
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const q = query(collection(db, "complaints"), orderBy("priorityScore", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
        setComplaints(data);
      } catch (error) {
        console.error("Failed to fetch complaints", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getSeverityBadge = (severity: string, status: string) => {
    if (status === 'resolved') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Resolved</span>;
    }
    switch (severity) {
      case 'critical': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">Critical</span>;
      case 'high': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">High</span>;
      case 'medium': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Medium</span>;
      case 'low': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
      default: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Unknown</span>;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Issues</h1>
            <p className="text-slate-500 mt-1">Review and manage all civic complaints in Visakhapatnam.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search issues..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex gap-4 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No issues found</h3>
              <p className="text-slate-500">There are currently no civic complaints reported.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Issue Details</th>
                    <th className="px-6 py-4">Location & Ward</th>
                    <th className="px-6 py-4 text-center">Priority Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-base mb-1">{complaint.title}</p>
                        <p className="text-slate-500 line-clamp-1 max-w-md">{complaint.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Reported {complaint.createdAt instanceof Date ? complaint.createdAt.toLocaleDateString() : (complaint.createdAt as any)?.toDate?.().toLocaleDateString() || 'Unknown date'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{complaint.location.address}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-5">Ward {complaint.location.ward}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-slate-800">{complaint.priorityScore}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">/ 100</span>
                      </td>
                      <td className="px-6 py-4">
                        {getSeverityBadge(complaint.severity, complaint.status)}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">View Details</Button>
                        {complaint.status !== 'resolved' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleResolve(complaint.id!)}
                          >
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
