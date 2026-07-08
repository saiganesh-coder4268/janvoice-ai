"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap, Pin } from "@vis.gl/react-google-maps";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint } from "@/types";
import { MoreHorizontal, Lightbulb, MapPin, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

const VIZAG_CENTER = { lat: 17.6868, lng: 83.2185 };

function MapController({ center, zoom }: { center: { lat: number, lng: number } | null, zoom: number }) {
  const map = useMap("DEMO_MAP_ID");
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export default function MPDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCenter, setActiveCenter] = useState<{ lat: number, lng: number } | null>(null);

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

  const getMarkerStyle = (priorityScore: number, status: string) => {
    if (status === 'resolved') {
      return { bg: '#00FF40', glow: '0 0 10px rgba(0,255,64,0.6)', blink: false };
    }
    if (priorityScore >= 70) {
      return { bg: '#FF003C', glow: '0 0 15px rgba(255,0,60,0.9)', blink: true };
    } else if (priorityScore >= 45) {
      return { bg: '#FF9D00', glow: '0 0 12px rgba(255,157,0,0.8)', blink: true };
    } else {
      return { bg: '#00D0FF', glow: '0 0 10px rgba(0,208,255,0.7)', blink: true };
    }
  };

  const getPriorityBgColor = (priorityScore: number, status: string) => {
    if (status === 'resolved') return '#00FF40';
    if (priorityScore >= 70) return '#FF003C';
    if (priorityScore >= 45) return '#FF9D00';
    return '#00D0FF';
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden">
      {/* Map Section */}
      <div className="flex-1 relative bg-slate-100 min-h-[50vh]">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Map
            defaultCenter={VIZAG_CENTER}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={false}
            minZoom={11} // Prevent zooming out too far from Vizag
          >
            <MapController center={activeCenter} zoom={16} />
            {complaints.map((complaint) => {
              const style = getMarkerStyle(complaint.priorityScore, complaint.status);
              
              // Add deterministic jitter so markers at the exact same location don't perfectly overlap
              const hash = complaint.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              const latJitter = ((hash % 100) - 50) * 0.00005; // approx +/- 5 meters
              const lngJitter = (((hash * 7) % 100) - 50) * 0.00005;

              return (
                <AdvancedMarker 
                  key={complaint.id}
                  position={{ lat: Number(complaint.location.lat) + latJitter, lng: Number(complaint.location.lng) + lngJitter }}
                  title={complaint.title}
                >
                  <div className="relative cursor-pointer hover:scale-110 transition-transform">
                    {style.blink && (
                      <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: style.bg }}></div>
                    )}
                    <div style={{ boxShadow: style.glow, borderRadius: '50%', backgroundColor: 'white', padding: '2px' }}>
                      <Pin background={style.bg} borderColor={style.bg} glyphColor="#fff" scale={1.1} />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 bg-white p-3 sm:p-4 rounded-xl shadow-lg border border-slate-200 z-10 hidden sm:block">
          <h4 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 sm:mb-3">Priority Score</h4>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,60,0.8)]" style={{ backgroundColor: '#FF003C' }}></span> High (70-100)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,157,0,0.8)]" style={{ backgroundColor: '#FF9D00' }}></span> Medium (45-69)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,208,255,0.8)]" style={{ backgroundColor: '#00D0FF' }}></span> Low (0-44)
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

      {/* Right Sidebar */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-1/2 lg:h-full overflow-y-auto">
        
        {/* AI Insights Panel */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">AI Development Recommendations</h2>
          <div className="border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50">
            <Lightbulb className="h-10 w-10 text-slate-400 mb-3" />
            <h3 className="font-semibold text-slate-700 mb-1">No active recommendations yet</h3>
            <p className="text-sm text-slate-500">Gemini is analyzing civic data. Check back later.</p>
          </div>
        </div>

        {/* Recent Issues List */}
        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Issues</h2>
            <Link href="/mp/issues" className="text-sm text-blue-600 font-medium hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-200 mt-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <p className="text-sm text-slate-500">No issues found.</p>
            ) : (
              complaints.slice(0, 5).map((complaint) => (
                <div 
                  key={complaint.id} 
                  onClick={() => setActiveCenter({ lat: complaint.location.lat, lng: complaint.location.lng })}
                  className="flex gap-3 items-start group p-2 -mx-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: getPriorityBgColor(complaint.priorityScore, complaint.status) }}></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-slate-900 truncate pr-2">{complaint.title}</h4>
                      <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {complaint.location.address}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Priority Score: <span className="font-semibold text-slate-600">{complaint.priorityScore}</span>
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
