"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
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
    const q = query(collection(db, "complaints"), orderBy("priorityScore", "desc"), limit(200));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      setComplaints(data);
      setLoading(false);
    }, (err: any) => {
      console.error("Failed to fetch complaints", err);
      setError(err.message || "Failed to load map data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getPriorityColor = (priorityScore: number, status: string) => {
    if (status === 'resolved') return '#00FF40'; // neon green
    if (priorityScore >= 70) return '#FF003C'; // sharp red
    if (priorityScore >= 45) return '#FF9D00'; // sharp orange
    return '#00D0FF'; // cyan
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
          {complaints.map((complaint) => {
            // Add deterministic jitter so markers at the exact same location don't perfectly overlap
            const hash = (complaint.id || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const latJitter = ((hash % 100) - 50) * 0.00005; // approx +/- 5 meters
            const lngJitter = (((hash * 7) % 100) - 50) * 0.00005;
            
            return (
            <AdvancedMarker 
              key={complaint.id}
              position={{ lat: Number(complaint.location.lat) + latJitter, lng: Number(complaint.location.lng) + lngJitter }}
              title={complaint.title}
            >
              <Pin 
                background={getPriorityColor(complaint.priorityScore, complaint.status)}
                borderColor={getPriorityColor(complaint.priorityScore, complaint.status)}
                glyphColor="#fff"
              />
            </AdvancedMarker>
          )})}
        </Map>
      </APIProvider>

      {/* Floating Legend */}
      <div className="absolute bottom-6 left-6 bg-white p-3 sm:p-4 rounded-xl shadow-lg border border-slate-200 z-10 hidden sm:block">
        <h4 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 sm:mb-3">Priority Score</h4>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(255,0,60,0.8)]" style={{ backgroundColor: '#FF003C' }}></span> High (70-100)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(255,157,0,0.8)]" style={{ backgroundColor: '#FF9D00' }}></span> Medium (45-69)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(0,208,255,0.8)]" style={{ backgroundColor: '#00D0FF' }}></span> Low (0-44)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(0,255,64,0.8)]" style={{ backgroundColor: '#00FF40' }}></span> Resolved
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
