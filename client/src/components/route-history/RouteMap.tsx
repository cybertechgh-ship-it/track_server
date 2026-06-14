import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ExtendedRouteData } from '../../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TILES = {
  light: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CARTO' },
};

const getStartIcon = () => new L.DivIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4caf50,#2e7d32);border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;color:white;">â–¶</div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18],
});
const getEndIcon = () => new L.DivIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f44336,#c62828);border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;color:white;">â– </div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18],
});
const getWpIcon = (color: string) => new L.DivIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
});

const FitBounds: React.FC<{ routes: ExtendedRouteData[] }> = ({ routes }) => {
  const map = useMap();
  useEffect(() => {
    if (routes.length === 0) return;
    const pts: LatLngExpression[] = routes.flatMap(r => r.locations.map(l => [l.latitude, l.longitude] as LatLngExpression));
    if (pts.length > 0) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
  }, [routes, map]);
  return null;
};

interface RouteMapProps { routes: ExtendedRouteData[]; center: LatLngExpression; zoom: number; }

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg2)', color: 'var(--text)',
  transition: 'all 0.12s',
};

export const RouteMap: React.FC<RouteMapProps> = ({ routes, center, zoom }) => {
  const [tileStyle, setTileStyle] = useState<'light' | 'dark'>('dark');
  const tile = TILES[tileStyle];

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ height: 600, borderRadius: 12, overflow: 'hidden', position: 'relative', background: tileStyle === 'dark' ? '#0f172a' : '#f8fafc' }}>
      {/* Tile toggle */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 4, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
        {(['light', 'dark'] as const).map(t => (
          <button key={t} style={{
            ...btn, padding: '4px 8px',
            background: tileStyle === t ? 'var(--accent)' : 'transparent',
            color: tileStyle === t ? '#00221c' : 'var(--text3)',
            border: 'none',
          }} onClick={() => setTileStyle(t)}>
            <i className={`ti ${t === 'dark' ? 'ti-moon' : 'ti-sun'}`} style={{ fontSize: 14 }}></i>
          </button>
        ))}
      </div>

      {routes.length === 0 ? (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <i className="las la-map" style={{ fontSize: 40, color: 'var(--text3)', opacity: 0.3 }}></i>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text3)', opacity: 0.5 }}>Ghana Map</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', opacity: 0.4 }}>Select a route from the left panel</div>
        </div>
      ) : (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} key={tileStyle}>
          <TileLayer url={tile.url} attribution={tile.attribution} />
          <FitBounds routes={routes} />
          {routes.map(r => {
            const pts: LatLngExpression[] = r.locations.map(l => [l.latitude, l.longitude]);
            if (pts.length < 2) return null;
            const start = r.locations[0];
            const end = r.locations[r.locations.length - 1];
            return (
              <div key={r.session.id}>
                <Polyline positions={pts} pathOptions={{ color: r.color, weight: 4, opacity: 0.9 }} />
                {r.locations.filter((_, i) => i > 0 && i < r.locations.length - 1 && i % Math.max(1, Math.floor(r.locations.length / 5)) === 0).map((loc, i) => (
                  <Marker key={`wp-${i}`} position={[loc.latitude, loc.longitude]} icon={getWpIcon(r.color)} />
                ))}
                <Marker position={[start.latitude, start.longitude]} icon={getStartIcon()}>
                  <Popup>
                    <div style={{ minWidth: 160, fontFamily: "'Inter', sans-serif" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Start</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.session.vehicle?.plateNumber}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{fmt(r.session.startTime)}</div>
                    </div>
                  </Popup>
                </Marker>
                {r.session.endTime && (
                  <Marker position={[end.latitude, end.longitude]} icon={getEndIcon()}>
                    <Popup>
                      <div style={{ minWidth: 160, fontFamily: "'Inter', sans-serif" }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>End</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.session.vehicle?.plateNumber}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{fmt(r.session.endTime)}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </div>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};
