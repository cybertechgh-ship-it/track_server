import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { vehicleService } from '../services/vehicleService';
import { analyticsService } from '../services/analyticsService';
import { useSimulation } from '../hooks/useSimulation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { DrivingSession, LocationLog } from '../types';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const toSvgDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const createCarIcon = (status: string) => {
  const colors: Record<string, string> = { moving: '#10b981', idle: '#f59e0b', parked: '#5c6f8a', offline: '#ef4444' };
  const c = colors[status] || '#5c6f8a';
  return new Icon({
    iconUrl: toSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="18" fill="${c}" stroke="white" stroke-width="3"/>
      <path d="M33 16c-.4-1.1-1.5-2-2.7-2H17.7c-1.2 0-2.3.9-2.7 2L12 26v10c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5v-2h18v2c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5V26l-3-10zM16 31c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM14 24l2.5-7h15l2.5 7H14z" fill="white"/>
    </svg>`),
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

const GHANA_CENTER: LatLngExpression = [7.9465, -1.0232];
const GHANA_ZOOM = 8;

const TILES = {
  street: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CARTO' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
};

interface LiveVehicleData extends DrivingSession {
  currentLocation?: LocationLog;
  lastUpdate?: string;
}

const MapCenterUpdater = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center, zoom]);
  return null;
};

const activityData = [
  { name: 'Mon', trips: 24 }, { name: 'Tue', trips: 18 }, { name: 'Wed', trips: 31 },
  { name: 'Thu', trips: 27 }, { name: 'Fri', trips: 22 }, { name: 'Sat', trips: 14 }, { name: 'Sun', trips: 9 },
];

const statusPieTemplate = [
  { name: 'Moving', color: '#10b981' }, { name: 'Idle', color: '#f59e0b' },
  { name: 'Parked', color: '#5c6f8a' }, { name: 'Offline', color: '#ef4444' },
];

const speedData = [
  { name: 'Mon', v: 12 }, { name: 'Tue', v: 8 }, { name: 'Wed', v: 15 },
  { name: 'Thu', v: 10 }, { name: 'Fri', v: 18 }, { name: 'Sat', v: 6 }, { name: 'Sun', v: 4 },
];

export default function LiveTrackingPage() {
  const [sessions, setSessions] = useState<LiveVehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicleData | null>(null);
  const [tileStyle, setTileStyle] = useState<'street' | 'dark' | 'satellite'>('dark');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sim = useSimulation();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const GHANA_ROUTES = [
    { lat: 5.6037, lng: -0.1870 }, { lat: 5.6137, lng: -0.2000 }, { lat: 5.6237, lng: -0.2100 },
    { lat: 5.6400, lng: -0.2300 }, { lat: 5.6600, lng: -0.2600 }, { lat: 5.6900, lng: -0.3000 },
    { lat: 5.7200, lng: -0.3500 }, { lat: 5.7600, lng: -0.4000 }, { lat: 5.8000, lng: -0.4500 },
    { lat: 5.8500, lng: -0.5000 }, { lat: 5.9000, lng: -0.5500 }, { lat: 5.9500, lng: -0.6000 },
    { lat: 6.0000, lng: -0.6500 }, { lat: 6.0500, lng: -0.7000 }, { lat: 6.1000, lng: -0.7500 },
    { lat: 6.1500, lng: -0.8000 }, { lat: 6.2000, lng: -0.8500 }, { lat: 6.2500, lng: -0.9000 },
    { lat: 6.3000, lng: -0.9500 }, { lat: 6.3500, lng: -1.0000 }, { lat: 6.4000, lng: -1.0500 },
    { lat: 6.4500, lng: -1.1000 }, { lat: 6.5000, lng: -1.1500 }, { lat: 6.5500, lng: -1.2000 },
    { lat: 6.6000, lng: -1.2500 }, { lat: 6.6500, lng: -1.3500 }, { lat: 6.6800, lng: -1.5000 },
    { lat: 6.6900, lng: -1.6000 }, { lat: 6.6950, lng: -1.6230 },
  ];

  const DEMO_SESSIONS: LiveVehicleData[] = [
    { id: 201, driverId: 1, vehicleId: 81, startTime: new Date(Date.now() - 7200000).toISOString(), endTime: undefined, status: 'active', totalDistance: 58, totalDuration: 7200, maxSpeed: 95, isActive: true, startLocation: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), driver: { id: 1, firstName: 'Kwame', lastName: 'Asante', rfidCardId: 'RFID-001', phone: '+233 24 100 0001', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, vehicle: { id: 81, plateNumber: 'GT-1000-20', brand: 'Toyota', model: 'Hilux', year: 2023, esp32DeviceId: 'ESP32_GH_1001', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentLocation: { latitude: 5.620, longitude: -0.180, speed: 42, heading: 210, accuracy: 8, id: 0, sessionId: 201, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() }, lastUpdate: new Date().toISOString() },
    { id: 202, driverId: 2, vehicleId: 82, startTime: new Date(Date.now() - 5400000).toISOString(), endTime: undefined, status: 'active', totalDistance: 42, totalDuration: 5400, maxSpeed: 88, isActive: true, startLocation: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), driver: { id: 2, firstName: 'Akua', lastName: 'Mensah', rfidCardId: 'RFID-002', phone: '+233 24 100 0002', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, vehicle: { id: 82, plateNumber: 'GT-1001-20', brand: 'Nissan', model: 'Navara', year: 2023, esp32DeviceId: 'ESP32_GH_1002', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentLocation: { latitude: 6.100, longitude: -0.750, speed: 35, heading: 320, accuracy: 6, id: 0, sessionId: 202, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() }, lastUpdate: new Date().toISOString() },
    { id: 203, driverId: 3, vehicleId: 83, startTime: new Date(Date.now() - 3600000).toISOString(), endTime: undefined, status: 'active', totalDistance: 31, totalDuration: 3600, maxSpeed: 72, isActive: true, startLocation: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), driver: { id: 3, firstName: 'Yaw', lastName: 'Owusu', rfidCardId: 'RFID-003', phone: '+233 24 100 0003', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, vehicle: { id: 83, plateNumber: 'GT-1002-20', brand: 'Hyundai', model: 'Tucson', year: 2024, esp32DeviceId: 'ESP32_GH_1003', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentLocation: { latitude: 6.650, longitude: -1.350, speed: 28, heading: 80, accuracy: 10, id: 0, sessionId: 203, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() }, lastUpdate: new Date().toISOString() },
    { id: 204, driverId: 4, vehicleId: 84, startTime: new Date(Date.now() - 9000000).toISOString(), endTime: undefined, status: 'active', totalDistance: 75, totalDuration: 9000, maxSpeed: 105, isActive: true, startLocation: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), driver: { id: 4, firstName: 'Esi', lastName: 'Boateng', rfidCardId: 'RFID-004', phone: '+233 24 100 0004', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, vehicle: { id: 84, plateNumber: 'GT-1003-20', brand: 'Kia', model: 'Sorento', year: 2023, esp32DeviceId: 'ESP32_GH_1004', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentLocation: { latitude: 5.550, longitude: -0.210, speed: 0, heading: 0, accuracy: 12, id: 0, sessionId: 204, timestamp: new Date(Date.now() - 600000).toISOString(), createdAt: new Date().toISOString() }, lastUpdate: new Date(Date.now() - 600000).toISOString() },
    { id: 205, driverId: 5, vehicleId: 85, startTime: new Date(Date.now() - 1800000).toISOString(), endTime: undefined, status: 'active', totalDistance: 15, totalDuration: 1800, maxSpeed: 55, isActive: true, startLocation: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), driver: { id: 5, firstName: 'Kofi', lastName: 'Adjei', rfidCardId: 'RFID-005', phone: '+233 24 100 0005', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, vehicle: { id: 85, plateNumber: 'GT-1004-20', brand: 'Mercedes', model: 'Sprinter', year: 2024, esp32DeviceId: 'ESP32_GH_1005', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentLocation: { latitude: 5.630, longitude: -0.010, speed: 18, heading: 90, accuracy: 5, id: 0, sessionId: 205, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() }, lastUpdate: new Date().toISOString() },
  ];

  const simulateMovement = useCallback(() => {
    setSessions(prev => prev.map(s => {
      if (!s.currentLocation) return s;
      const loc = s.currentLocation as any;
      const speed = loc.speed || 0;
      if (speed <= 1) return s;
      const target = GHANA_ROUTES[Math.floor(Math.random() * GHANA_ROUTES.length)];
      const lat = loc.latitude + (target.lat - loc.latitude) * 0.02 + (Math.random() - 0.5) * 0.005;
      const lng = loc.longitude + (target.lng - loc.longitude) * 0.02 + (Math.random() - 0.5) * 0.005;
      const heading = Math.atan2(target.lng - loc.longitude, target.lat - loc.latitude) * (180 / Math.PI);
      return {
        ...s, totalDistance: (s.totalDistance || 0) + 0.3,
        currentLocation: { ...loc, latitude: lat, longitude: lng, speed: Math.max(0, speed + (Math.random() - 0.5) * 8), heading: (heading + 360) % 360, accuracy: 5 + Math.random() * 5 },
        lastUpdate: new Date().toISOString(),
      } as LiveVehicleData;
    }));
  }, []);

  const startSimulation = useCallback(() => {
    if (simRef.current) return;
    simRef.current = setInterval(simulateMovement, 3000);
  }, [simulateMovement]);

  const stopSimulation = useCallback(() => {
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const active = await vehicleService.getActiveSessions();
      if (active.length > 0) {
        const withLoc = await Promise.all(
          active.map(async (s) => {
            try {
              const rd = await analyticsService.getRouteData(s.id);
              const last = rd.locations[rd.locations.length - 1];
              return { ...s, currentLocation: last, lastUpdate: new Date().toISOString() } as LiveVehicleData;
            } catch { return s as LiveVehicleData; }
          })
        );
        setSessions(withLoc);
      } else {
        setSessions(DEMO_SESSIONS); startSimulation();
      }
    } catch {
      setSessions(DEMO_SESSIONS); startSimulation();
    } finally { setLoading(false); }
  }, [startSimulation]);

  useEffect(() => {
    loadSessions();
    try {
      const url = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:9040';
      socketRef.current = io(url, { transports: ['websocket', 'polling'] });
      socketRef.current.on('locationUpdate', (data: any) => {
        setSessions(prev => prev.map(s => s.id === data.sessionId ? { ...s, currentLocation: data, lastUpdate: new Date().toISOString() } : s));
      });
      socketRef.current.on('sessionStart', loadSessions);
      socketRef.current.on('sessionEnd', loadSessions);
    } catch { /* ignore */ }
    return () => { stopSimulation(); socketRef.current?.disconnect(); };
  }, [loadSessions, stopSimulation]);

  const getStatus = (v: LiveVehicleData): string => {
    if (!v.currentLocation) return 'offline';
    if ((v.currentLocation as any).speed > 0) return 'moving';
    return 'idle';
  };

  const getStatusColor = (status: string) => {
    const m: Record<string, string> = { moving: '#10b981', idle: '#f59e0b', offline: '#5c6f8a' };
    return m[status] || '#5c6f8a';
  };

  const formatTime = (t?: string) => {
    if (!t) return 'Unknown';
    const s = Math.floor((Date.now() - new Date(t).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  const filtered = sessions.filter(s => (onlineOnly ? s.currentLocation : true));
  const moving = sessions.filter(s => s.currentLocation && (s.currentLocation as any).speed > 0).length;
  const idle = sessions.filter(s => s.currentLocation && !((s.currentLocation as any).speed > 0)).length;
  const offline = sessions.filter(s => !s.currentLocation).length;
  const totalKm = sessions.reduce((a, v) => a + (v.totalDistance || 0), 0);

  const statusPie = statusPieTemplate.map((e, i) => ({
    ...e, value: i === 0 ? moving : i === 1 ? idle : i === 2 ? 0 : offline,
  }));

  const currentTile = TILES[tileStyle];
  const sidebarW = sidebarOpen ? 280 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 102px)', margin: '-22px -24px', overflow: 'hidden' }}>
      {/* Top toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        flexShrink: 0, zIndex: 20,
      }}>
        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border2)',
          background: sidebarOpen ? 'rgba(0,201,167,0.1)' : 'var(--bg3)',
          color: sidebarOpen ? 'var(--accent)' : 'var(--text2)',
          cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
        }}>
          <i className="las la-columns-sidebar" style={{ fontSize: 14 }} />
        </button>

        {/* Compact stats */}
        {[
          { label: 'Moving', value: moving, color: '#10b981', icon: 'ti-car' },
          { label: 'Idle', value: idle, color: '#f59e0b', icon: 'ti-clock-pause' },
          { label: 'Offline', value: offline, color: '#ef4444', icon: 'ti-wifi-off' },
          { label: 'km', value: Math.round(totalKm), color: 'var(--accent)', icon: 'ti-route' },
        ].map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 6,
            background: `${s.color}10`,
            borderLeft: i > 0 ? 'none' : undefined,
          }}>
            <i className={`ti ${s.icon}`} style={{ fontSize: 12, color: s.color }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.value}</span>
            <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />

        {/* Controls */}
        <button onClick={loadSessions} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
          border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
          transition: 'all 0.15s', flexShrink: 0,
        }}>
          <i className="las la-sync" style={{ fontSize: 13 }} /> Refresh
        </button>
        <button onClick={() => setOnlineOnly(!onlineOnly)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
          border: '1px solid var(--border2)',
          background: onlineOnly ? 'rgba(0,201,167,0.12)' : 'var(--bg3)',
          color: onlineOnly ? 'var(--accent)' : 'var(--text2)',
          transition: 'all 0.15s', flexShrink: 0,
        }}>
          <i className="las la-wifi" style={{ fontSize: 13 }} /> Online
        </button>
        <button onClick={() => setShowCharts(!showCharts)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
          border: '1px solid var(--border2)',
          background: showCharts ? 'rgba(0,201,167,0.12)' : 'var(--bg3)',
          color: showCharts ? 'var(--accent)' : 'var(--text2)',
          transition: 'all 0.15s', flexShrink: 0,
        }}>
          <i className="las la-chart-bar" style={{ fontSize: 13 }} /> Charts
        </button>

        {/* Tile selector */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 4, flexShrink: 0 }}>
          {(['street', 'dark', 'satellite'] as const).map(t => (
            <button key={t} onClick={() => setTileStyle(t)} style={{
              padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 500, cursor: 'pointer',
              border: '1px solid', transition: 'all 0.15s',
              background: tileStyle === t ? 'var(--accent)' : 'transparent',
              color: tileStyle === t ? '#00221c' : 'var(--text3)',
              borderColor: tileStyle === t ? 'var(--accent)' : 'var(--border)',
            }}>
              <i className={`ti ${t === 'street' ? 'ti-road' : t === 'satellite' ? 'ti-planet' : 'ti-moon'}`} style={{ fontSize: 10, marginRight: 2 }} />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Right side stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
            <i className="las la-tachometer-alt" style={{ marginRight: 2 }} />
            Max: <strong style={{ color: 'var(--text)' }}>{Math.round(Math.max(0, ...sessions.map(v => (v.currentLocation as any)?.speed || 0)))} km/h</strong>
          </span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
            <i className="las la-map-pin" style={{ marginRight: 2 }} />
            <strong style={{ color: 'var(--text)' }}>{sessions.length}</strong> vehicles
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{
            width: sidebarW, flexShrink: 0, background: 'var(--bg2)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Sidebar header */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Vehicles</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>{moving}</span>
                  <span style={{ padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: 'var(--warn)' }}>{idle}</span>
                  <span style={{ padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}>{offline}</span>
                </div>
              </div>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <i className="las la-search" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text3)' }} />
                <input placeholder="Search vehicles..." style={{
                  width: '100%', padding: '5px 8px 5px 26px', borderRadius: 6, fontSize: 11,
                  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)',
                  outline: 'none', boxSizing: 'border-box',
                }} />
              </div>
            </div>

            {/* Vehicle list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {error && (
                <div style={{ margin: 8, padding: '8px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 11, color: 'var(--danger)' }}>
                  <i className="las la-exclamation-triangle" style={{ marginRight: 4 }} />{error}
                </div>
              )}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                  <div style={{ width: 24, height: 24, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
                  <i className="las la-car-off" style={{ fontSize: 28, display: 'block', marginBottom: 6 }} />No vehicles
                </div>
              ) : (
                filtered.map(session => {
                  const status = getStatus(session);
                  const sc = getStatusColor(status);
                  const loc = session.currentLocation as any;
                  const sel = selectedVehicle?.id === session.id;
                  return (
                    <div key={session.id}
                      onClick={() => setSelectedVehicle(sel ? null : session)}
                      style={{
                        padding: '8px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                        transition: 'all 0.15s', borderLeft: sel ? '3px solid var(--accent)' : '3px solid transparent',
                        background: sel ? 'rgba(0,201,167,0.04)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg3)'; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: `${sc}1A`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <i className="las la-car" style={{ fontSize: 12, color: sc }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            {session.vehicle?.plateNumber || 'N/A'}
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc, animation: status === 'moving' ? 'pulse 1.5s infinite' : 'none', flexShrink: 0 }} />
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                            {session.driver?.firstName} {session.driver?.lastName}
                          </div>
                        </div>
                        {loc?.speed > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: sc, flexShrink: 0 }}>
                            {Math.round(loc.speed)} km/h
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--text3)', marginLeft: 36 }}>
                        <span>{session.vehicle?.brand} {session.vehicle?.model}</span>
                        <span style={{ marginLeft: 'auto' }}>{formatTime(session.lastUpdate)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Simulation */}
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px 2px 5px', borderRadius: 20, background: sim.status.running ? 'rgba(16,185,129,0.12)' : 'var(--bg3)' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: sim.status.running ? 'var(--success)' : 'var(--text3)', animation: sim.status.running ? 'pulse 1.5s infinite' : 'none' }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: sim.status.running ? 'var(--success)' : 'var(--text3)' }}>SIM</span>
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={sim.refresh} style={{
                  width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border2)',
                  background: 'transparent', color: 'var(--text3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                }} title="Reload">
                  <i className="las la-sync" />
                </button>
                <button onClick={sim.status.running ? sim.stop : sim.start} disabled={sim.loading} style={{
                  padding: '4px 12px', borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  border: '1px solid', transition: 'all 0.15s',
                  background: sim.status.running ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                  color: sim.status.running ? 'var(--danger)' : 'var(--success)',
                  borderColor: sim.status.running ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
                }}>
                  {sim.status.running ? 'STOP' : 'START'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map + Charts */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Map fills all space */}
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer center={GHANA_CENTER} zoom={GHANA_ZOOM} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url={currentTile.url} attribution={currentTile.attribution} />
              <MapCenterUpdater center={GHANA_CENTER} zoom={GHANA_ZOOM} />
              {filtered.map(session => {
                if (!session.currentLocation) return null;
                const loc = session.currentLocation as any;
                const pos: LatLngExpression = [loc.latitude, loc.longitude];
                const status = getStatus(session);
                const color = getStatusColor(status);
                const sel = selectedVehicle?.id === session.id;
                return (
                  <Marker key={session.id} position={pos} icon={createCarIcon(status)} opacity={sel ? 1 : 0.7}>
                    <Popup>
                      <div style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5, minWidth: 220 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${color}, ${color}77)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
                            <i className="las la-car" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{session.vehicle?.plateNumber || 'N/A'}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{session.vehicle?.brand} {session.vehicle?.model}</div>
                          </div>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 9, fontWeight: 700, background: `${color}1A`, color }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        {session.driver && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                              {session.driver.firstName?.[0]}{session.driver.lastName?.[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{session.driver.firstName} {session.driver.lastName}</div>
                              <div style={{ fontSize: 9, color: 'var(--text3)' }}>{session.driver.phone || 'N/A'}</div>
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 6, background: 'var(--bg2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                          <div><div style={{ fontSize: 8, color: 'var(--text3)' }}>Speed</div><div style={{ fontSize: 12, fontWeight: 700, color: loc.speed > 80 ? '#ef4444' : 'var(--text)' }}>{Math.round(loc.speed || 0)} km/h</div></div>
                          <div><div style={{ fontSize: 8, color: 'var(--text3)' }}>Heading</div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{Math.round(loc.heading || 0)}</div></div>
                          <div><div style={{ fontSize: 8, color: 'var(--text3)' }}>Distance</div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{Math.round(session.totalDistance || 0)} km</div></div>
                          <div><div style={{ fontSize: 8, color: 'var(--text3)' }}>Accuracy</div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{Math.round(loc.accuracy || 0)}m</div></div>
                        </div>
                        <div style={{ fontSize: 8, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', marginTop: 4 }}>
                          {Number(loc.latitude).toFixed(6)}, {Number(loc.longitude).toFixed(6)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Legend - bottom left */}
            <div style={{
              position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}>
              {[
                { label: 'Moving', color: '#10b981' }, { label: 'Idle', color: '#f59e0b' },
                { label: 'Offline', color: '#ef4444' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '1px 0', fontSize: 10, color: 'var(--text2)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Charts - collapsible bottom panel */}
          {showCharts && (
            <div style={{
              height: 180, borderTop: '1px solid var(--border)',
              background: 'var(--bg2)', flexShrink: 0,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
            }}>
              <div style={{ padding: '8px 10px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <i className="las la-chart-line" style={{ color: 'var(--accent)', fontSize: 11 }} /> Activity
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <YAxis tick={{ fontSize: 8, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                    <Bar dataKey="trips" fill="var(--accent)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '8px 10px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <i className="las la-chart-pie" style={{ color: '#3b82f6', fontSize: 11 }} /> Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', height: 140 }}>
                  <ResponsiveContainer width="50%" height={120}>
                    <PieChart>
                      <Pie data={statusPie} cx="50%" cy="50%" innerRadius={20} outerRadius={42} paddingAngle={3} dataKey="value">
                        {statusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ fontSize: 9, color: 'var(--text3)', lineHeight: 1.8 }}>
                    {statusPie.filter(d => d.value > 0).map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.color }} />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <i className="las la-tachometer-alt" style={{ color: '#ef4444', fontSize: 11 }} /> Speed
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={speedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <YAxis tick={{ fontSize: 8, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                    <Bar dataKey="v" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trip Replay - slim bottom bar */}
      <div style={{
        padding: '5px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <button style={{
          width: 24, height: 24, borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
          cursor: 'pointer', flexShrink: 0,
        }} title="Play">
          <i className="las la-play-circle-filled" style={{ fontSize: 11 }} />
        </button>
        <span style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Replay</span>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--bg4)', overflow: 'hidden' }}>
          <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, var(--accent), #00e5c8)', borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 9, color: 'var(--text2)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>00:12 / 04:32</span>
        <select style={{
          padding: '2px 6px', borderRadius: 4, fontSize: 9,
          border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
          outline: 'none', cursor: 'pointer',
        }}>
          <option>1x</option><option>2x</option><option>4x</option><option>8x</option>
        </select>
      </div>

      {/* Vehicle Detail Overlay */}
      {selectedVehicle && (
        <div onClick={() => setSelectedVehicle(null)} style={{
          position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 360, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto',
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease',
          }}>
            {/* Header */}
            <div style={{ position: 'relative', background: `linear-gradient(135deg, ${getStatusColor(getStatus(selectedVehicle))}22, transparent)`, padding: '16px 16px 0' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${getStatusColor(getStatus(selectedVehicle))}, transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${getStatusColor(getStatus(selectedVehicle))}, ${getStatusColor(getStatus(selectedVehicle))}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
                  <i className="las la-car" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{selectedVehicle.vehicle?.plateNumber || 'N/A'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{selectedVehicle.vehicle?.brand} {selectedVehicle.vehicle?.model} {selectedVehicle.vehicle?.year}</div>
                </div>
                <button onClick={() => setSelectedVehicle(null)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--bg3)',
                  border: '1px solid var(--border2)', cursor: 'pointer', color: 'var(--text3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="las la-times" style={{ fontSize: 14 }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, padding: '10px 0' }}>
                <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: `${getStatusColor(getStatus(selectedVehicle))}1A`, color: getStatusColor(getStatus(selectedVehicle)) }}>
                  {getStatus(selectedVehicle).charAt(0).toUpperCase() + getStatus(selectedVehicle).slice(1)}
                </span>
                <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 10, background: 'var(--bg3)', color: 'var(--text3)' }}>
                  {formatTime(selectedVehicle.lastUpdate)}
                </span>
              </div>
            </div>
            <div style={{ padding: 14 }}>
              {selectedVehicle.driver && (
                <div style={{ marginBottom: 12, padding: 10, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                    <i className="las la-user" style={{ marginRight: 3 }} /> Driver
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {selectedVehicle.driver.firstName?.[0]}{selectedVehicle.driver.lastName?.[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{selectedVehicle.driver.firstName} {selectedVehicle.driver.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        <i className="las la-id-card-badge" style={{ marginRight: 2, fontSize: 9 }} />{selectedVehicle.driver.rfidCardId || 'N/A'}
                        <span style={{ margin: '0 4px' }}>|</span>
                        <i className="las la-phone" style={{ marginRight: 2, fontSize: 9 }} />{selectedVehicle.driver.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedVehicle.currentLocation && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                  {[
                    { label: 'Speed', value: `${Math.round((selectedVehicle.currentLocation as any).speed || 0)} km/h`, icon: 'ti-speedometer', color: (selectedVehicle.currentLocation as any).speed > 80 ? '#ef4444' : '#00c9a7' },
                    { label: 'Heading', value: `${Math.round((selectedVehicle.currentLocation as any).heading || 0)}`, icon: 'ti-compass', color: 'var(--text)' },
                    { label: 'Distance', value: `${Math.round(selectedVehicle.totalDistance || 0)} km`, icon: 'ti-route', color: 'var(--text)' },
                    { label: 'Accuracy', value: `${Math.round((selectedVehicle.currentLocation as any).accuracy || 0)}m`, icon: 'ti-target', color: 'var(--text)' },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <i className={`ti ${m.icon}`} style={{ fontSize: 10 }} /> {m.label}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {selectedVehicle.currentLocation && (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                    <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}><i className="las la-map-pin" style={{ marginRight: 2 }} /> Coordinates</div>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text2)' }}>
                      {Number((selectedVehicle.currentLocation as any).latitude).toFixed(6)}, {Number((selectedVehicle.currentLocation as any).longitude).toFixed(6)}
                    </div>
                  </div>
                )}
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}><i className="las la-info-circle" style={{ marginRight: 2 }} /> Session</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>
                    {new Date(selectedVehicle.startTime).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
