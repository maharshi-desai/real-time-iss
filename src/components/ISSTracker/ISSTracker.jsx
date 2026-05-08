import React from 'react';
import { useISS } from '../../hooks/useISS';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ISSSpeedChart from './ISSSpeedChart';

// Fix leafet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ISS Icon
const issIcon = new L.DivIcon({
  className: 'bg-transparent',
  html: `<div class="text-3xl filter drop-shadow-md transform -translate-x-1/2 -translate-y-1/2">🛰️</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function ISSTracker() {
  const { position, trajectory, speedHistory, astronauts, autoRefresh, toggleAutoRefresh, manualRefresh } = useISS();

  const currentSpeed = position?.speed ? position.speed.toFixed(2) : (speedHistory.length > 0 ? speedHistory[speedHistory.length - 1].speed.toFixed(2) : 'Loading...');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Map & Stats Column */}
      <div className="lg:col-span-8 bg-card text-card-foreground border rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight">ISS Live Tracking</h2>
          <div className="flex gap-2">
            <button onClick={manualRefresh} className="px-4 py-2 rounded-full border bg-background hover:bg-border/50 transition-colors text-sm font-medium">
              Refresh Now
            </button>
            <button onClick={toggleAutoRefresh} className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${autoRefresh ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background hover:bg-border/50'}`}>
              Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-background border flex flex-col justify-center">
            <div className="text-xs text-foreground/60 font-medium mb-1">Latitude / Longitude</div>
            <div className="text-lg font-bold">
              {position ? `${position.lat.toFixed(3)}, ${position.lng.toFixed(3)}` : '...'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-background border flex flex-col justify-center">
            <div className="text-xs text-foreground/60 font-medium mb-1">Speed</div>
            <div className="text-lg font-bold">{currentSpeed} km/h</div>
          </div>
          <div className="p-4 rounded-xl bg-background border flex flex-col justify-center">
            <div className="text-xs text-foreground/60 font-medium mb-1">Crew Count</div>
            <div className="text-lg font-bold">
              {astronauts.count > 0 ? `${astronauts.count} Astronauts` : '...'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-background border flex flex-col justify-center">
            <div className="text-xs text-foreground/60 font-medium mb-1">Tracked Positions</div>
            <div className="text-lg font-bold">{trajectory.length}</div>
          </div>
        </div>

        <div className="h-[400px] w-full rounded-xl overflow-hidden border">
          {position ? (
            <MapContainer center={[position.lat, position.lng]} zoom={3} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[position.lat, position.lng]} icon={issIcon} />
              {trajectory.length > 1 && (
                <Polyline 
                  positions={trajectory.map(p => [p.lat, p.lng])} 
                  color="#ef4444" 
                  weight={3}
                  dashArray="5, 10"
                />
              )}
            </MapContainer>
          ) : (
            <div className="h-full w-full bg-border/20 animate-pulse flex items-center justify-center">
              <span className="text-foreground/50 font-medium">Initializing Map...</span>
            </div>
          )}
        </div>
      </div>

      {/* Speed Chart Column */}
      <div className="lg:col-span-4 bg-card text-card-foreground border rounded-2xl shadow-sm p-4 md:p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold tracking-tight mb-6">ISS Speed Trend</h2>
        <div className="flex-grow min-h-[300px]">
          <ISSSpeedChart speedHistory={speedHistory} />
        </div>
      </div>

    </div>
  );
}
