"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useState } from 'react';

// Mock data for MVP
const complaints = [
  { id: '1', lat: 28.6139, lng: 77.2090, severity: 'critical', title: 'Water Main Burst' },
  { id: '2', lat: 28.6150, lng: 77.2100, severity: 'high', title: 'Pothole on Main Road' },
  { id: '3', lat: 28.6120, lng: 77.2050, severity: 'medium', title: 'Streetlight Out' },
];

export function GISMap() {
  const [zoom, setZoom] = useState(14);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // New Delhi

  return (
    <div className="w-full h-full relative">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          zoom={zoom}
          center={center}
          onCameraChanged={(ev: any) => {
            setZoom(ev.detail.zoom);
            setCenter(ev.detail.center);
          }}
          mapId="DEMO_MAP_ID"
          colorScheme="DARK"
          disableDefaultUI={true}
        >
          {complaints.map((c) => (
            <AdvancedMarker key={c.id} position={{ lat: c.lat, lng: c.lng }}>
              <Pin 
                background={
                  c.severity === 'critical' ? '#D32F2F' : 
                  c.severity === 'high' ? '#FF9800' : 
                  '#FFEB3B'
                }
                borderColor={'#0B1118'}
                glyphColor={'#fff'}
              />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
      
      {/* Map Controls UI Overlay */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <div className="bg-panel border border-border p-3 rounded-md flex flex-col gap-3 shadow-lg">
          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest border-b border-border pb-1">Layers</div>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" className="accent-primary" defaultChecked />
            <span className="text-foreground">Markers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" className="accent-primary" />
            <span className="text-foreground">Heatmap</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" className="accent-primary" />
            <span className="text-foreground">Ward Boundaries</span>
          </label>
        </div>
      </div>
    </div>
  );
}