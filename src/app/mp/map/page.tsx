"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { AlertCircle, X, MapPin, Maximize2, Minimize2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Strictly Visakhapatnam center fallback
const VIZAG_CENTER = { lat: 17.6868, lng: 83.2185 };

function MapBoundsFitter({ complaints }: { complaints: Complaint[] }) {
  const map = useMap();

  useEffect(() => {
    if (map && complaints && complaints.length > 0 && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidPoints = false;
      
      complaints.forEach(c => {
        const lat = Number(c.location?.lat);
        const lng = Number(c.location?.lng);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          bounds.extend({ lat, lng });
          hasValidPoints = true;
        }
      });

      if (hasValidPoints) {
        map.fitBounds(bounds, 50); // 50px padding so dots aren't cut off
      }
    }
  }, [map, complaints]);

  return null;
}

export default function FullMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Reset expanded state when active complaint changes
  useEffect(() => {
    setIsExpanded(false);
  }, [activeComplaint]);

  const getPriorityColor = (priorityScore: number, status: string) => {
    if (status === 'resolved') return '#00FF40'; // neon green
    if (priorityScore >= 70) return '#FF003C'; // sharp red
    if (priorityScore >= 45) return '#FF9D00'; // sharp orange
    return '#A855F7'; // purple
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="flex-1 relative bg-muted h-full w-full overflow-hidden">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={VIZAG_CENTER}
          defaultZoom={13}
          mapId="DEMO_FULL_MAP_ID"
          disableDefaultUI={false}
        >
          <MapBoundsFitter complaints={complaints} />
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
              onClick={() => setActiveComplaint(complaint)}
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

      {/* Slide-out Issue Panel */}
      <AnimatePresence>
        {activeComplaint && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute top-0 right-0 h-full bg-card shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "w-full md:w-[600px] lg:w-[800px]" : "w-full max-w-sm sm:w-96"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/90 backdrop-blur-md z-10">
              <h2 className="font-bold text-lg text-foreground line-clamp-1 pr-2">{activeComplaint.title}</h2>
              <div className="flex items-center gap-1 shrink-0">
                 <button 
                   onClick={() => setIsExpanded(!isExpanded)} 
                   className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                   title={isExpanded ? "Collapse View" : "Expand View"}
                 >
                   {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                 </button>
                 <button 
                   onClick={() => setActiveComplaint(null)} 
                   className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                 >
                   <X size={18} />
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {/* Main Image */}
              {activeComplaint.imageURLs && activeComplaint.imageURLs.length > 0 && (
                <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-muted/50 flex justify-center items-center transition-all duration-300">
                   <img 
                     src={activeComplaint.imageURLs[0]} 
                     alt={activeComplaint.title} 
                     className={`w-full h-auto object-contain transition-all duration-700 ${isExpanded ? "max-h-[500px]" : "max-h-[250px]"}`} 
                   />
                </div>
              )}
              
              {/* Info Grid */}
              <div className={`grid gap-4 text-sm ${isExpanded ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}>
                 <div className="bg-muted p-3 rounded-xl border border-border">
                   <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1.5"><Clock size={14}/> Reported At</p>
                   <p className="font-medium text-foreground">
                     {formatTime(activeComplaint.createdAt)}
                   </p>
                 </div>
                 <div className={`bg-muted p-3 rounded-xl border border-border ${isExpanded ? "lg:col-span-3" : "col-span-1 sm:col-span-1"}`}>
                   <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1.5"><MapPin size={14}/> Location</p>
                   <p className="font-medium text-foreground line-clamp-2" title={activeComplaint.location.address}>
                     {activeComplaint.location.address}
                   </p>
                 </div>
              </div>

              {/* Categories/Tags */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                 <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize border border-blue-100">
                   {activeComplaint.category}
                 </span>
                 <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${
                   activeComplaint.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' : 
                   activeComplaint.status === 'under_review' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                   'bg-muted text-muted-foreground border-border'
                 }`}>
                   {activeComplaint.status.replace('_', ' ')}
                 </span>
                 <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                   activeComplaint.priorityScore >= 70 ? 'bg-red-50 text-red-700 border-red-100' : 
                   activeComplaint.priorityScore >= 45 ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                   'bg-cyan-50 text-cyan-700 border-cyan-100'
                 }`}>
                   Priority: {activeComplaint.priorityScore}
                 </span>
              </div>

              {/* Description */}
              <div>
                 <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                 <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-xl border border-slate-50">
                   {activeComplaint.description}
                 </p>
              </div>
              
              {/* If translated text exists and is different, optionally show it */}
              {activeComplaint.translatedText && activeComplaint.originalLanguage !== 'en' && activeComplaint.translatedText !== activeComplaint.description && (
                 <div>
                   <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                     Translation ({activeComplaint.originalLanguage})
                   </h3>
                   <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap bg-indigo-50/50 p-4 rounded-xl border border-indigo-50">
                     {activeComplaint.translatedText}
                   </p>
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Legend */}
      <div className="absolute bottom-6 left-6 bg-card p-3 sm:p-4 rounded-xl shadow-lg border border-border z-10 hidden sm:block">
        <h4 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wider mb-2 sm:mb-3">Priority Score</h4>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(255,0,60,0.8)]" style={{ backgroundColor: '#FF003C' }}></span> High (70-100)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(255,157,0,0.8)]" style={{ backgroundColor: '#FF9D00' }}></span> Medium (45-69)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" style={{ backgroundColor: '#A855F7' }}></span> Low (0-44)
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(0,255,64,0.8)]" style={{ backgroundColor: '#00FF40' }}></span> Resolved
          </div>
        </div>
      </div>

      {/* Error / Empty State Overlay */}
      {(!loading && complaints.length === 0) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card px-6 py-3 rounded-full shadow-lg border border-orange-200 flex items-center gap-2 z-10 text-orange-700 font-medium text-sm">
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

