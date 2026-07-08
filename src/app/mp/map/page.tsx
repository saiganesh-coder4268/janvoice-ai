"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { AlertCircle, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Strictly Visakhapatnam center
const VIZAG_CENTER = { lat: 17.6868, lng: 83.2185 };

export default function FullMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const q = query(collection(db, "complaints"), orderBy("priorityScore", "desc"), limit(200));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
        setComplaints(data);
      } catch (err: any) {
        console.error("Failed to fetch complaints", err);
        setError(err.message || "Failed to load map data.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getPriorityColor = (priorityScore: number, status: string) => {
    if (status === 'resolved') return '#22c55e';
    if (priorityScore >= 70) return '#ef4444';
    if (priorityScore >= 45) return '#f97316';
    return '#a855f7';
  };

  return (
    <div className="flex-1 relative bg-slate-100 h-full w-full">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={VIZAG_CENTER}
          defaultZoom={13}
          mapId="DEMO_FULL_MAP_ID"
          disableDefaultUI={false}
          minZoom={11} // Prevent zooming out of Vizag area
        >
          {complaints.map((complaint) => (
            <AdvancedMarker 
              key={complaint.id}
              position={{ lat: complaint.location.lat, lng: complaint.location.lng }}
              title={complaint.title}
            >
              <Pin 
                background={getPriorityColor(complaint.priorityScore, complaint.status)}
                borderColor={getPriorityColor(complaint.priorityScore, complaint.status)}
                glyphColor="#fff"
              />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Floating Legend */}
      <div className="absolute bottom-6 left-6 bg-white p-3 sm:p-4 rounded-xl shadow-lg border border-slate-200 z-10 hidden sm:block">
        <h4 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 sm:mb-3">Priority Score</h4>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></span> High (70-100)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500"></span> Medium (45-69)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500"></span> Low (0-44)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></span> Resolved
          </div>
        </div>
      </div>

      {/* Error / Empty State Overlay */}
      {(!loading && complaints.length === 0) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-orange-200 flex items-center gap-2 z-10 text-orange-700 font-medium text-sm">
          <AlertCircle className="h-5 w-5" />
          No issues found on the map. (Did you run the seed script?)
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-50 px-6 py-3 rounded-lg shadow-lg border border-red-200 flex items-center gap-2 z-10 text-red-700 font-medium text-sm max-w-lg">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="truncate">Database Error: Make sure your Firestore Indexes are built.</span>
        </div>
      )}
    </div>
  );
}
