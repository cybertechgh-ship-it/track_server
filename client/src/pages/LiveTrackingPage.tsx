import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { vehicleService } from '../services/vehicleService';
import { analyticsService } from '../services/analyticsService';
import { useSimulation } from '../hooks/useSimulation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
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
  dark: { url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', attribution: '&copy; Stadia Maps' },
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

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};

const activityData = [
  { name: 'Mon', trips: 24, distance: 420 },
  { name: 'Tue', trips: 18, distance: 380 },
  { name: 'Wed', trips: 31, distance: 510 },
  { name: 'Thu', trips: 27, distance: 465 },
  { name: 'Fri', trips: 22, distance: 395 },
  { name: 'Sat', trips: 14, distance: 210 },
  { name: 'Sun', trips: 9, distance: 145 },
];

const statusPieDataTemplate = [
  { name: 'Moving', color: '#10b981' },
  { name: 'Idle', color: '#f59e0b' },
  { name: 'Parked', color: '#5c6f8a' },
  { name: 'Offline', color: '#ef4444' },
];

const speedViolationsData = [
  { name: 'Mon', violations: 12 },
  { name: 'Tue', violations: 8 },
  { name: 'Wed', violations: 15 },
  { name: 'Thu', violations: 10 },
  { name: 'Fri', violations: 18 },
  { name: 'Sat', violations: 6 },
  { name: 'Sun', violations: 4 },
];

export default function LiveTrackingPage() {
  const [sessions, setSessions] = useState<LiveVehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicleData | null>(null);
  const [tileStyle, setTileStyle] = useState<'street' | 'dark' | 'satellite'>('dark');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
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
      const routePoint = Math.floor(Math.random() * GHANA_ROUTES.length);
      const target = GHANA_ROUTES[routePoint];
      const lat = loc.latitude + (target.lat - loc.latitude) * 0.02 + (Math.random() - 0.5) * 0.005;
      const lng = loc.longitude + (target.lng - loc.longitude) * 0.02 + (Math.random() - 0.5) * 0.005;
      const heading = Math.atan2(target.lng - loc.longitude, target.lat - loc.latitude) * (180 / Math.PI);
      const speedVar = speed + (Math.random() - 0.5) * 8;
      return {
        ...s,
        totalDistance: (s.totalDistance || 0) + 0.3,
        currentLocation: { ...loc, latitude: lat, longitude: lng, speed: Math.max(0, speedVar), heading: (heading + 360) % 360, accuracy: 5 + Math.random() * 5 },
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
      setLoading(true);
      setError(null);
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
        setSessions(DEMO_SESSIONS);
        startSimulation();
      }
    } catch (err: any) {
      setSessions(DEMO_SESSIONS);
      startSimulation();
    } finally { setLoading(false); }
  }, [startSimulation]);

  useEffect(() => {
    loadSessions();
    try {
      const url = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:9040';
      socketRef.current = io(url, { transports: ['websocket', 'polling'] });
      socketRef.current.on('locationUpdate', (data: any) => {
        setSessions(prev => prev.map(s =>
          s.id === data.sessionId ? { ...s, currentLocation: data, lastUpdate: new Date().toISOString() } : s
        ));
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
    const map: Record<string, string> = { moving: '#10b981', idle: '#f59e0b', offline: '#5c6f8a' };
    return map[status] || '#5c6f8a';
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
  const totalKm = sessions.reduce((s, v) => s + (v.totalDistance || 0), 0);
  const maxSpeed = Math.max(0, ...sessions.map(v => (v.currentLocation as any)?.speed || 0));

  const statusPieData = statusPieDataTemplate.map((entry, index) => ({
    ...entry,
    value: index === 0 ? moving : index === 1 ? idle : index === 2 ? 0 : offline,
  }));

  const currentTile = TILES[tileStyle];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 102px)', margin: '-22px -24px', overflow: 'hidden' }}>
      {/* Stats row */}
      <div style={{
        display: 'flex', gap: 0,
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '10px 20px', flexShrink: 0,
      }}>
        {[
          { label: 'Moving Now', value: moving, color: '#10b981', icon: 'ti-car' },
          { label: 'Idle', value: idle, color: '#f59e0b', icon: 'ti-clock-pause' },
          { label: 'Parked', value: 0, color: '#5c6f8a', icon: 'ti-square-off' },
          { label: 'Offline', value: offline, color: '#ef4444', icon: 'ti-wifi-off' },
          { label: 'km Today', value: `${Math.round(totalKm)}`, color: 'var(--accent)', icon: 'ti-route' },
        ].map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 20px',
            borderRight: i < 4 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 16, color: s.color }}></i>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            <i className="ti ti-speedometer" style={{ marginRight: 3 }}></i>Max: <strong style={{ color: 'var(--text)' }}>{Math.round(maxSpeed)} km/h</strong>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Vehicle sidebar */}
        <div style={{
          width: 320, background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Live Tracking</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Real-time fleet overview</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>{moving} Moving</span>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: 'var(--warn)' }}>{idle} Idle</span>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}>{offline} Offline</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={btnStyle} onClick={loadSessions}><i className="ti ti-refresh" style={{ fontSize: 15 }}></i> Refresh</button>
              <button style={{ ...btnStyle, background: onlineOnly ? 'rgba(0,201,167,0.12)' : 'var(--bg3)', color: onlineOnly ? 'var(--accent)' : 'var(--text2)' }} onClick={() => setOnlineOnly(!onlineOnly)}>
                <i className="ti ti-wifi" style={{ fontSize: 15 }}></i> Online
              </button>
              <button style={{ ...btnStyle, background: showCharts ? 'rgba(0,201,167,0.12)' : 'var(--bg3)', color: showCharts ? 'var(--accent)' : 'var(--text2)' }} onClick={() => setShowCharts(!showCharts)}>
                <i className="ti ti-chart-bar" style={{ fontSize: 15 }}></i> Charts
              </button>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {(['street', 'dark', 'satellite'] as const).map(t => (
                <button key={t} style={{
                  ...btnStyle, padding: '4px 10px', fontSize: 11,
                  background: tileStyle === t ? 'var(--accent)' : 'var(--bg3)',
                  color: tileStyle === t ? '#00221c' : 'var(--text2)',
                  borderColor: tileStyle === t ? 'var(--accent)' : 'var(--border2)',
                }} onClick={() => setTileStyle(t)}>
                  <i className={`ti ${t === 'street' ? 'ti-road' : t === 'satellite' ? 'ti-planet' : 'ti-moon'}`} style={{ fontSize: 13 }}></i>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {error && (
              <div style={{ margin: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--danger)' }}>
                <i className="ti ti-alert-triangle" style={{ marginRight: 6 }}></i>{error}
              </div>
            )}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: 28, height: 28, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                <i className="ti ti-car-off" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}></i>
                No active vehicles
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
                      padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      transition: 'all 0.15s',
                      borderLeft: sel ? '3px solid var(--accent)' : '3px solid transparent',
                      background: sel ? 'rgba(0,201,167,0.04)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg3)'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `${sc}1A`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="ti ti-car" style={{ fontSize: 14, color: sc }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {session.vehicle?.plateNumber || 'N/A'}
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc, animation: status === 'moving' ? 'pulse 1.5s infinite' : 'none', flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                          {session.vehicle?.brand} {session.vehicle?.model}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${sc}1A`, color: sc, whiteSpace: 'nowrap' }}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--text3)', marginLeft: 42 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <i className="ti ti-user" style={{ fontSize: 11 }}></i>
                        {session.driver?.firstName} {session.driver?.lastName || 'N/A'}
                      </span>
                      {loc?.speed > 0 && (
                        <span style={{ fontWeight: 600, color: sc }}>
                          {Math.round(loc.speed)} km/h
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                        <i className="ti ti-clock" style={{ fontSize: 11 }}></i>
                        {formatTime(session.lastUpdate)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Simulation Controls */}
          {!selectedVehicle && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', background: sim.status.running ? 'rgba(16,185,129,0.03)' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 10px 2px 6px', borderRadius: 20, background: sim.status.running ? 'rgba(16,185,129,0.12)' : 'var(--bg3)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sim.status.running ? 'var(--success)' : 'var(--text3)', animation: sim.status.running ? 'pulse 1.5s infinite' : 'none' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: sim.status.running ? 'var(--success)' : 'var(--text3)', letterSpacing: '0.5px' }}>SIMULATION</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>
                  {sim.status.running ? `${sessions.length} vehicles tracked` : 'Not running'}
                </span>
                <div style={{ flex: 1 }} />
                <button onClick={sim.refresh} style={{ ...btnStyle, padding: '4px 8px', fontSize: 10, background: 'transparent' }} title="Reload route data">
                  <i className="ti ti-refresh" style={{ fontSize: 13 }}></i>
                </button>
                <button onClick={sim.status.running ? sim.stop : sim.start} disabled={sim.loading} style={{ ...btnStyle, padding: '6px 14px', fontSize: 11, fontWeight: 700, background: sim.status.running ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', color: sim.status.running ? 'var(--danger)' : 'var(--success)', borderColor: sim.status.running ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)' }}>
                  <i className={`ti ${sim.status.running ? 'ti-player-stop-filled' : 'ti-player-play-filled'}`} style={{ fontSize: 13 }}></i>
                  {sim.status.running ? 'STOP' : 'START'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'var(--text3)' }}>
                <span>Active routes: <strong style={{ color: 'var(--text2)' }}>{sessions.length}</strong></span>
                <span>Moving: <strong style={{ color: 'var(--success)' }}>{moving}</strong></span>
                <span>Idle: <strong style={{ color: 'var(--warn)' }}>{idle}</strong></span>
                <span>Offline: <strong style={{ color: 'var(--danger)' }}>{offline}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Map + Charts */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Map */}
          <div style={{ flex: showCharts ? 1 : 1, position: 'relative' }}>
            <MapContainer center={GHANA_CENTER} zoom={GHANA_ZOOM} style={{ height: '100%', width: '100%' }}>
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
                      <div style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${color}, ${color}77)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
                            <i className="ti ti-car"></i>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{session.vehicle?.plateNumber || 'N/A'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{session.vehicle?.brand} {session.vehicle?.model}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${color}1A`, color }}>
                              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: color, marginRight: 4, verticalAlign: 'middle', animation: status === 'moving' ? 'pulse 1.5s infinite' : 'none' }} />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{formatTime(session.lastUpdate)}</div>
                          </div>
                        </div>
                        {session.driver && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                              {session.driver.firstName?.[0]}{session.driver.lastName?.[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{session.driver.firstName} {session.driver.lastName}</div>
                              <div style={{ fontSize: 10, color: 'var(--text3)' }}><i className="ti ti-phone" style={{ marginRight: 2, fontSize: 9 }}></i>{session.driver.phone || 'N/A'}</div>
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 10, background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8 }}>
                          <div><div style={{ fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}><i className="ti ti-speedometer" style={{ fontSize: 10 }}></i> Speed</div><div style={{ fontSize: 14, fontWeight: 700, color: loc.speed > 80 ? '#ef4444' : 'var(--text)' }}>{Math.round(loc.speed || 0)} km/h</div></div>
                          <div><div style={{ fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}><i className="ti ti-compass" style={{ fontSize: 10 }}></i> Heading</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{Math.round(loc.heading || 0)}°</div></div>
                          <div><div style={{ fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}><i className="ti ti-route" style={{ fontSize: 10 }}></i> Distance</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{Math.round(session.totalDistance || 0)} km</div></div>
                          <div><div style={{ fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}><i className="ti ti-target" style={{ fontSize: 10 }}></i> Accuracy</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{Math.round(loc.accuracy || 0)}m</div></div>
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' }}>
                          {Number(loc.latitude).toFixed(6)}, {Number(loc.longitude).toFixed(6)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Map Legend */}
            <div style={{
              position: 'absolute', bottom: 20, left: 20, zIndex: 1000,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Legend</div>
              {[
                { label: 'Moving', color: '#10b981', icon: 'ti-car' },
                { label: 'Idle', color: '#f59e0b', icon: 'ti-clock-pause' },
                { label: 'Parked', color: '#5c6f8a', icon: 'ti-square-off' },
                { label: 'Offline', color: '#ef4444', icon: 'ti-wifi-off' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', fontSize: 11, color: 'var(--text2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <i className={`ti ${l.icon}`} style={{ fontSize: 11, color: 'var(--text3)' }}></i>
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Charts section */}
          {showCharts && (
            <div style={{
              height: 220, borderTop: '1px solid var(--border)',
              background: 'var(--bg2)', flexShrink: 0,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
            }}>
              {/* Activity chart */}
              <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ti ti-activity" style={{ color: 'var(--accent)' }}></i> Activity
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="trips" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status breakdown */}
              <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ti ti-pie-chart" style={{ color: '#3b82f6' }}></i> Status Breakdown
                </div>
                <div style={{ display: 'flex', alignItems: 'center', height: 160 }}>
                  <ResponsiveContainer width="50%" height={140}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={3} dataKey="value">
                        {statusPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.8 }}>
                    {statusPieData.filter(d => d.value > 0).map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }}></span>
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Speed violations */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ti ti-speedometer" style={{ color: '#ef4444' }}></i> Speed Violations
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={speedViolationsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text3)' }} stroke="var(--border)" />
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="violations" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trip Replay Bar */}
      <div style={{
        padding: '10px 20px', borderTop: '1px solid var(--border)',
        background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 16,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{ ...btnStyle, padding: '6px 10px', borderRadius: '50%' }} title="Play/Pause">
            <i className="ti ti-player-play-filled" style={{ fontSize: 14 }}></i>
          </button>
          <button style={{ ...btnStyle, padding: '6px 10px', borderRadius: '50%' }} title="Stop">
            <i className="ti ti-player-stop-filled" style={{ fontSize: 14 }}></i>
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Trip Replay</span>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: 'var(--bg4)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              width: '30%', height: '100%',
              background: 'linear-gradient(90deg, var(--accent), #00e5c8)',
              borderRadius: 2, transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>00:12</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>/</span>
            <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>04:32</span>
          </div>
          <select style={{
            padding: '4px 8px', borderRadius: 6, fontSize: 10,
            border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
            outline: 'none', cursor: 'pointer',
          }}>
            <option>1x</option>
            <option>2x</option>
            <option>4x</option>
            <option>8x</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
            <i className="ti ti-map-pin" style={{ marginRight: 2 }}></i>
            <strong style={{ color: 'var(--text2)' }}>{sessions.length}</strong> vehicles on map
          </span>
        </div>
      </div>

      {/* Global Overlay */}
      {selectedVehicle && (
        <div onClick={() => setSelectedVehicle(null)} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.15s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 25px 60px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
            {/* Header */}
            <div style={{ position: 'relative', background: `linear-gradient(135deg, ${getStatusColor(getStatus(selectedVehicle))}22, transparent)`, padding: '20px 20px 0' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${getStatusColor(getStatus(selectedVehicle))}, transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `linear-gradient(135deg, ${getStatusColor(getStatus(selectedVehicle))}, ${getStatusColor(getStatus(selectedVehicle))}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22 }}>
                  <i className="ti ti-car"></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{selectedVehicle.vehicle?.plateNumber || 'N/A'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>{selectedVehicle.vehicle?.brand} {selectedVehicle.vehicle?.model} &middot; {selectedVehicle.vehicle?.year}</div>
                </div>
                <button onClick={() => setSelectedVehicle(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border2)', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg4)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text3)'; }}>
                  <i className="ti ti-x" style={{ fontSize: 16 }}></i>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${getStatusColor(getStatus(selectedVehicle))}1A`, color: getStatusColor(getStatus(selectedVehicle)), display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: getStatusColor(getStatus(selectedVehicle)), animation: getStatus(selectedVehicle) === 'moving' ? 'pulse 1.5s infinite' : 'none' }} />
                  {getStatus(selectedVehicle).charAt(0).toUpperCase() + getStatus(selectedVehicle).slice(1)}
                </span>
                <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, background: 'var(--bg3)', color: 'var(--text3)' }}>
                  <i className="ti ti-clock" style={{ marginRight: 4, fontSize: 10 }}></i>
                  {formatTime(selectedVehicle.lastUpdate)}
                </span>
              </div>
            </div>

            <div style={{ padding: 16 }}>
              {selectedVehicle.driver && (
                <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    <i className="ti ti-user" style={{ marginRight: 4 }}></i> Driver
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {selectedVehicle.driver.firstName?.[0]}{selectedVehicle.driver.lastName?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{selectedVehicle.driver.firstName} {selectedVehicle.driver.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 16, marginTop: 4 }}>
                        <span><i className="ti ti-id-badge" style={{ marginRight: 3 }}></i>{selectedVehicle.driver.rfidCardId || 'N/A'}</span>
                        <span><i className="ti ti-phone" style={{ marginRight: 3 }}></i>{selectedVehicle.driver.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedVehicle.currentLocation && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    <i className="ti ti-activity" style={{ marginRight: 4 }}></i> Telemetry
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Speed', value: `${Math.round((selectedVehicle.currentLocation as any).speed || 0)} km/h`, icon: 'ti-speedometer', color: (selectedVehicle.currentLocation as any).speed > 80 ? '#ef4444' : '#00c9a7' },
                      { label: 'Heading', value: `${Math.round((selectedVehicle.currentLocation as any).heading || 0)}°`, icon: 'ti-compass', color: 'var(--text)' },
                      { label: 'Distance', value: `${Math.round(selectedVehicle.totalDistance || 0)} km`, icon: 'ti-route', color: 'var(--text)' },
                      { label: 'Accuracy', value: `${Math.round((selectedVehicle.currentLocation as any).accuracy || 0)}m`, icon: 'ti-target', color: 'var(--text)' },
                    ].map(metric => (
                      <div key={metric.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className={`ti ${metric.icon}`} style={{ fontSize: 12 }}></i>
                          {metric.label}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: metric.color }}>{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {selectedVehicle.currentLocation && (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}><i className="ti ti-map-pin" style={{ marginRight: 3 }}></i> Coordinates</div>
                    <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text2)' }}>
                      {Number((selectedVehicle.currentLocation as any).latitude).toFixed(6)}<br />
                      {Number((selectedVehicle.currentLocation as any).longitude).toFixed(6)}
                    </div>
                  </div>
                )}
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}><i className="ti ti-info-circle" style={{ marginRight: 3 }}></i> Session</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>
                    Started<br />{new Date(selectedVehicle.startTime).toLocaleString()}
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
