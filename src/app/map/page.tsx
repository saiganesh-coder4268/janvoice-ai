"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import TopBar from "@/components/layout/TopBar";
import { X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const VIZAG_CENTER = { lat: 17.6868, lng: 83.2185 };

const landingTabs = [
  { name: "About", href: "/#about" },
  { name: "Features", href: "/#features" },
  { name: "Gallery", href: "/gallery" },
];

export default function PublicMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"), limit(100));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
        setComplaints(data);
      } catch (error) {
        console.error("Failed to fetch complaints", error);
      }
    };
    fetchComplaints();
  }, []);

  const getMarkerStyle = (priorityScore: number, status: string) => {
    if (status === 'resolved') {
      return {
        bg: 'bg-green-500',
        glow: '',
        blink: false,
      };
    }
    
    let bg = 'bg-blue-500';
    let glow = '';
    
    if (priorityScore >= 70) {
      bg = 'bg-red-500';
      glow = 'glow-red';
    } else if (priorityScore >= 45) {
      bg = 'bg-orange-500';
      glow = 'glow-orange';
    } else {
      bg = 'bg-purple-500';
      glow = 'glow-purple';
    }
    
    return {
      bg,
      glow,
      blink: true,
    };
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <TopBar tabs={landingTabs} />
      
      <main className="flex-1 relative bg-slate-100">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Map
            defaultCenter={VIZAG_CENTER}
            defaultZoom={13}
            mapId="DEMO_PUBLIC_MAP_ID"
            disableDefaultUI={false}
          >
            {complaints.map((complaint) => {
              const style = getMarkerStyle(complaint.priorityScore, complaint.status);
              return (
                <AdvancedMarker 
                  key={complaint.id}
                  position={{ lat: complaint.location.lat, lng: complaint.location.lng }}
                  title={complaint.title}
                  onClick={() => setActiveComplaint(complaint)}
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-all ${style.bg} ${style.glow} ${style.blink ? 'animate-marker-blink' : ''}`}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Animated Issue Card Overlay */}
        <AnimatePresence>
          {activeComplaint && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-6 right-6 w-80 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/50 z-50 overflow-hidden"
            >
              <button 
                onClick={() => setActiveComplaint(null)}
                className="absolute top-3 right-3 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="mb-3 pr-6">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{activeComplaint.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {activeComplaint.location.address}
                </p>
              </div>

              {activeComplaint.imageURLs && activeComplaint.imageURLs.length > 0 && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 shadow-inner">
                  <Image 
                    src={activeComplaint.imageURLs[0]} 
                    alt="Issue photo" 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {activeComplaint.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${activeComplaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {activeComplaint.status.toUpperCase()}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Priority: <span className="text-slate-700 font-bold">{activeComplaint.priorityScore}</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 left-6 bg-white p-3 sm:p-4 rounded-xl shadow-lg border border-slate-200 z-10 hidden sm:block">
          <h4 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 sm:mb-3">Priority Score</h4>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span> High (70-100)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"></span> Medium (45-69)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse"></span> Low (0-44)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></span> Resolved
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
