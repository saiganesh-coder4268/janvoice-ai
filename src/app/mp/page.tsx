"use client";

import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMap, Pin } from "@vis.gl/react-google-maps";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { MoreHorizontal, Lightbulb, MapPin, Search, AlertCircle, X, Info } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const VIZAG_CENTER = { lat: 17.6868, lng: 83.2185 };

function MapController({ center, zoom, complaints, onZoomChange }: { center: { lat: number, lng: number } | null, zoom: number, complaints?: Complaint[], onZoomChange: (z: number) => void }) {
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
  
  // Handle click panning with smooth cinematic fly-to animation
  useEffect(() => {
    if (map && center) {
      const startZoom = map.getZoom() || 13;
      const startCenter = map.getCenter();
      if (!startCenter) {
        map.panTo(center);
        map.setZoom(zoom);
        return;
      }

      const startLat = startCenter.lat();
      const startLng = startCenter.lng();
      
      const frames = 45; // ~750ms at 60fps
      let frame = 0;
      
      const animate = () => {
        frame++;
        const progress = frame / frames;
        // Ease in-out cubic interpolation
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentLat = startLat + (center.lat - startLat) * ease;
        const currentLng = startLng + (center.lng - startLng) * ease;
        const currentZoom = startZoom + (zoom - startZoom) * ease;
        
        map.moveCamera({
          center: { lat: currentLat, lng: currentLng },
          zoom: currentZoom
        });
        
        if (frame < frames) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [map, center, zoom]);

  // Fit bounds to show all complaints if no specific center is active
  useEffect(() => {
    if (map && complaints && complaints.length > 0 && !center && window.google?.maps) {
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
  }, [map, complaints, center]);

  return null;
}

export default function MPDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCenter, setActiveCenter] = useState<{ lat: number, lng: number } | null>(null);
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

  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [hasFetchedInsights, setHasFetchedInsights] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("priorityScore", "desc"));
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

  const getMarkerStyle = (score: number | string, status: string) => {
    const priorityScore = Number(score) || 0;
    if (status === 'resolved') {
      return { bg: '#10B981', glow: '0 0 8px rgba(16,185,129,0.6)', blink: false }; // Emerald for resolved
    }
    if (priorityScore >= 70) {
      return { bg: '#FF4500', glow: '0 0 10px rgba(255,69,0,0.8)', blink: true };
    } else if (priorityScore >= 45) {
      return { bg: '#FFB300', glow: '0 0 8px rgba(255,179,0,0.6)', blink: true };
    } else {
      return { bg: '#008080', glow: '0 0 6px rgba(0,128,128,0.5)', blink: true };
    }
  };

  useEffect(() => {
    if (complaints.length > 0 && !hasFetchedInsights && !loadingInsights) {
      setLoadingInsights(true);
      setHasFetchedInsights(true); // Lock it so it never loops
      fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaints: complaints.slice(0, 15) }) // Send top 15 issues
      })
      .then(res => res.json())
      .then(data => {
        if (data.recommendations && data.recommendations.length > 0) {
          setInsights(data.recommendations);
        } else {
          setInsights(["Work with sanitation crews to maintain consistent pickup schedules.", "Monitor local reporting for emerging infrastructure risks."]);
        }
      })
      .catch(err => {
        console.error("Failed to load insights", err);
        setInsights(["Work with sanitation crews to maintain consistent pickup schedules.", "Monitor local reporting for emerging infrastructure risks."]);
      })
      .finally(() => setLoadingInsights(false));
    }
  }, [complaints, hasFetchedInsights, loadingInsights]);

  const getPriorityBgColor = (score: number | string, status: string) => {
    const priorityScore = Number(score) || 0;
    if (status === 'resolved') return '#10B981';
    if (priorityScore >= 70) return '#FF4500';
    if (priorityScore >= 45) return '#FFB300';
    return '#008080';
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden">
      {/* Map Section */}
      <div 
        className="flex-1 relative bg-muted min-h-[50vh]"
        onMouseMove={resetLegendTimeout}
      >
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Map
            defaultCenter={VIZAG_CENTER}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={false}
          >
            <MapController center={activeCenter} zoom={16} complaints={complaints} onZoomChange={setGlobalZoom} />
            {/* Sort complaints ascending so highest priority (and resolved) render ON TOP of low priority dots at the same location */}
            {[...complaints].sort((a, b) => {
              if (a.status === 'resolved' && b.status !== 'resolved') return 1;
              if (b.status === 'resolved' && a.status !== 'resolved') return -1;
              return (Number(a.priorityScore) || 0) - (Number(b.priorityScore) || 0);
            }).map((complaint) => {
              const style = getMarkerStyle(complaint.priorityScore, complaint.status);
              
              // Dynamic marker sizing based on zoom (slightly larger than before)
              const markerSize = globalZoom > 13 ? 'w-6 h-6 border-2' : globalZoom > 11 ? 'w-4 h-4 border-[1.5px]' : 'w-3 h-3 border-[1px]';
              
              // Add deterministic jitter so markers at the exact same location don't perfectly overlap
              const hash = (complaint.id || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              const latJitter = ((hash % 100) - 50) * 0.00005; // approx +/- 5 meters
              const lngJitter = (((hash * 7) % 100) - 50) * 0.00005;

              const lat = Number(complaint.location?.lat);
              const lng = Number(complaint.location?.lng);
              
              if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

              return (
                <AdvancedMarker 
                  key={complaint.id}
                  position={{ lat: lat + latJitter, lng: lng + lngJitter }}
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
                  <MapPin className="h-3 w-3 shrink-0" /> {activeComplaint.location.address}
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

        {/* Floating Legend */}
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
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,69,0,0.8)]" style={{ backgroundColor: '#FF4500' }}></span> High (70-100)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,179,0,0.8)]" style={{ backgroundColor: '#FFB300' }}></span> Medium (45-69)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_6px_rgba(0,128,128,0.8)]" style={{ backgroundColor: '#008080' }}></span> Low (0-44)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ backgroundColor: '#10B981' }}></span> Resolved
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

      {/* Right Sidebar */}
      <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col h-1/2 lg:h-full overflow-y-auto">
        
        {/* Strategic Insights Panel */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Strategic Development Insights</h2>
          {loadingInsights ? (
            <div className="border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted">
              <Lightbulb className="h-10 w-10 text-slate-400 mb-3 animate-pulse" />
              <h3 className="font-semibold text-muted-foreground mb-1">Analyzing civic data...</h3>
              <p className="text-sm text-muted-foreground">Generating strategic recommendations based on current map issues.</p>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
                  <div className="flex gap-2 items-start">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted">
              <Lightbulb className="h-10 w-10 text-slate-400 mb-3" />
              <h3 className="font-semibold text-muted-foreground mb-1">No active recommendations yet</h3>
              <p className="text-sm text-muted-foreground">Insufficient data to generate strategic insights.</p>
            </div>
          )}
        </div>

        {/* Recent Issues List */}
        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Issues</h2>
            <Link href="/mp/issues" className="text-sm text-blue-600 font-medium hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-secondary rounded w-3/4"></div>
                      <div className="h-3 bg-secondary rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No issues found.</p>
            ) : (
              complaints.slice(0, 5).map((complaint) => (
                <div 
                  key={complaint.id} 
                  onClick={() => {
                    setActiveCenter({ lat: Number(complaint.location.lat), lng: Number(complaint.location.lng) });
                    setActiveComplaint(complaint);
                  }}
                  className="flex gap-3 items-start group p-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: getPriorityBgColor(complaint.priorityScore, complaint.status) }}></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-foreground truncate pr-2">{complaint.title}</h4>
                      <button className="text-slate-400 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {complaint.location.address}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Priority Score: <span className="font-semibold text-muted-foreground">{complaint.priorityScore}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
