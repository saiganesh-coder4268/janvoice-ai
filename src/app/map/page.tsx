"use client";

import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import TopBar from "@/components/layout/TopBar";
import { MapPin, Search, Menu, X, ArrowUpRight, BarChart3, Users, Home, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const VIZAG_CENTER = { lat: 17.6868, lng: 83.2185 };

function MapController({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMap();
  
  // Track zoom level for dynamic marker sizing
  useEffect(() => {
    if (map) {
      const listener = map.addListener('zoom_changed', () => {
        onZoomChange(map.getZoom() || 13);
      });
      return () => {
        if (window.google?.maps) {
          window.google.maps.event.removeListener(listener);
        }
      };
    }
  }, [map, onZoomChange]);

  return null;
}

const landingTabs = [
  { name: "About", href: "/#about" },
  { name: "Features", href: "/#features" },
  { name: "Gallery", href: "/gallery" },
];

export default function PublicMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [globalZoom, setGlobalZoom] = useState(13);

  const [showLegend, setShowLegend] = useState(true);
  const legendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetLegendTimeout = () => {
    setShowLegend(true);
    if (legendTimeoutRef.current) clearTimeout(legendTimeoutRef.current);
    legendTimeoutRef.current = setTimeout(() => {
      setShowLegend(false);
    }, 5000);
  };

  useEffect(() => {
    resetLegendTimeout();
    return () => {
      if (legendTimeoutRef.current) clearTimeout(legendTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"), limit(200));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      setComplaints(data);
    }, (error: any) => {
      console.error("Failed to fetch complaints", error);
    });

    return () => unsubscribe();
  }, []);

  const getMarkerStyle = (score: number | string, status: string) => {
    const priorityScore = Number(score) || 0;
    if (status === 'resolved') {
      return { bg: '#00FF40', glow: '0 0 8px rgba(0,255,64,0.6)', blink: true };
    }
    if (priorityScore >= 70) {
      return { bg: '#FF003C', glow: '0 0 10px rgba(255,0,60,0.8)', blink: true };
    } else if (priorityScore >= 45) {
      return { bg: '#FF9D00', glow: '0 0 8px rgba(255,157,0,0.6)', blink: true };
    } else {
      return { bg: '#A855F7', glow: '0 0 6px rgba(168,85,247,0.5)', blink: true };
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <TopBar tabs={landingTabs} />
      
      <main 
        className="flex-1 relative bg-muted"
        onMouseMove={resetLegendTimeout}
        onMouseLeave={() => setShowLegend(false)}
      >
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Map
            defaultCenter={VIZAG_CENTER}
            defaultZoom={13}
            mapId="DEMO_PUBLIC_MAP_ID"
            disableDefaultUI={false}
          >
            <MapController onZoomChange={setGlobalZoom} />
            {[...complaints].sort((a, b) => {
              if (a.status === 'resolved' && b.status !== 'resolved') return 1;
              if (b.status === 'resolved' && a.status !== 'resolved') return -1;
              return (Number(a.priorityScore) || 0) - (Number(b.priorityScore) || 0);
            }).map((complaint) => {
              const style = getMarkerStyle(complaint.priorityScore, complaint.status);
              
              // Dynamic marker sizing based on zoom
              const markerSize = globalZoom > 13 ? 'w-6 h-6 border-2' : globalZoom > 11 ? 'w-4 h-4 border-[1.5px]' : 'w-3 h-3 border-[1px]';
              
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
                  <div 
                    className={`${markerSize} rounded-full border-white shadow-lg cursor-pointer hover:scale-110 transition-all`}
                    style={{ 
                      backgroundColor: style.bg,
                      boxShadow: style.glow 
                    }}
                  >
                    {style.blink && (
                      <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: style.bg, animationDuration: '2s' }}></div>
                    )}
                  </div>
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
              className="absolute top-6 right-6 w-80 bg-card/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/50 z-50 overflow-hidden"
            >
              <button 
                onClick={() => setActiveComplaint(null)}
                className="absolute top-3 right-3 p-1.5 bg-muted hover:bg-secondary text-muted-foreground rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="mb-3 pr-6">
                <h3 className="font-bold text-foreground text-lg leading-tight">{activeComplaint.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {activeComplaint.location.address}
                </p>
              </div>

              {activeComplaint.imageURLs && activeComplaint.imageURLs.length > 0 && (
                <div className="relative w-full mb-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl overflow-hidden shadow-inner flex justify-center items-center">
                  <img 
                    src={activeComplaint.imageURLs[0]} 
                    alt="Issue photo" 
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {activeComplaint.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${activeComplaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {activeComplaint.status.toUpperCase()}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Priority: <span className="text-muted-foreground font-bold">{activeComplaint.priorityScore}</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`absolute bottom-6 left-6 bg-card p-3 sm:p-4 rounded-xl shadow-lg border border-border z-10 hidden sm:block transition-opacity duration-700 ${showLegend ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h4 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wider">Priority Score</h4>
            <div className="relative group ml-4">
              <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-popover border text-popover-foreground text-xs rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-20">
                Calculated dynamically by AI, combining issue severity with local Ward population density.
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,60,0.8)]" style={{ backgroundColor: '#FF003C' }}></span> High (70-100)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,157,0,0.8)]" style={{ backgroundColor: '#FF9D00' }}></span> Medium (45-69)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" style={{ backgroundColor: '#A855F7' }}></span> Low (0-44)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(0,255,64,0.8)]" style={{ backgroundColor: '#00FF40' }}></span> Resolved
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
