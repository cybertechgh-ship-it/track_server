import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vehicleService } from '../services/vehicleService';
import { uploadService } from '../services/uploadService';
import { maintenanceService } from '../services/maintenanceService';
import type { Vehicle, DrivingSession, MaintenanceRecord } from '../types';
import { AnimatedDetailModal, type DetailSection } from '../components/layout/AnimatedDetailModal';
import { UNIQUE_VEHICLE_PHOTOS, getStablePhoto } from '../constants/photos';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const toSvgDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const createCarIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
    <defs>
      <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${adjustColor(color, -30)}"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/>
      </filter>
    </defs>
    <circle cx="30" cy="30" r="27" fill="rgba(0,0,0,0.15)"/>
    <circle cx="30" cy="30" r="26" fill="url(#bodyG)" stroke="white" stroke-width="2.5" filter="url(#shadow)"/>
    <path d="M32 14h-4l-4 14H16c-2.2 0-4 1.8-4 4v3c0 1.7 1.3 3 3 3h2c1.7 0 3-1.3 3-3v-1h20v1c0 1.7 1.3 3 3 3h2c1.7 0 3-1.3 3-3v-3c0-2.2-1.8-4-4-4h-8l-4-14z" fill="white" opacity="0.9"/>
    <rect x="18" y="28" width="6" height="4" rx="0.5" fill="white" opacity="0.6"/>
    <rect x="36" y="28" width="6" height="4" rx="0.5" fill="white" opacity="0.6"/>
    <rect x="28" y="18" width="4" height="6" rx="1" fill="white" opacity="0.5"/>
    <circle cx="17" cy="39" r="3.5" fill="white"/>
    <circle cx="43" cy="39" r="3.5" fill="white"/>
    <circle cx="17" cy="39" r="2" fill="#333"/>
    <circle cx="43" cy="39" r="2" fill="#333"/>
  </svg>`;
  return L.icon({
    iconUrl: toSvgDataUrl(svg),
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
  });
};

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xFF) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const VEHICLE_LOCATIONS: Record<number, { lat: number; lng: number }> = {
  81: { lat: 5.6037, lng: -0.1870 },    // Accra Central
  82: { lat: 5.6190, lng: -0.2450 },    // Madina
  83: { lat: 5.6350, lng: -0.1620 },    // Spintex
  84: { lat: 5.6500, lng: -0.1900 },    // Tema
  85: { lat: 5.5900, lng: -0.2100 },    // East Legon
  86: { lat: 5.6650, lng: -0.1550 },    // Teshie
  87: { lat: 5.5800, lng: -0.2300 },    // Airport Residential
};

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%',
};
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const SERVICE_COLORS: Record<string, string> = {
  oil_change: '#3b82f6', tire: '#22c55e', brake: '#ef4444', service: '#f59e0b',
  inspection: '#8b5cf6', fuel: '#06b6d4', other: '#64748b',
};
const TYPE_ICONS: Record<string, string> = {
  oil_change: 'ti-droplet', tire: 'ti-disc', brake: 'ti-tool', service: 'ti-wrench',
  inspection: 'ti-clipboard', fuel: 'ti-gas-station', other: 'ti-settings',
};
const TYPE_LABELS: Record<string, string> = {
  oil_change: 'Oil Change', tire: 'Tire', brake: 'Brake', service: 'Service',
  inspection: 'Inspection', fuel: 'Fuel System', other: 'Other',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sessions, setSessions] = useState<DrivingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecs, setMaintenanceRecs] = useState<MaintenanceRecord[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editV, setEditV] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ plateNumber: '', brand: '', model: '', year: new Date().getFullYear(), esp32DeviceId: '', photo: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const DEMO_VEHICLES: Vehicle[] = [
    { id: 81, plateNumber: 'GT-1000-20', brand: 'Toyota', model: 'Hilux', year: 2023, esp32DeviceId: 'ESP32_GH_0001', isActive: true, photo: '', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
    { id: 82, plateNumber: 'GT-1001-20', brand: 'Nissan', model: 'Navara', year: 2023, esp32DeviceId: 'ESP32_GH_0002', isActive: true, photo: '', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
    { id: 83, plateNumber: 'GT-1002-20', brand: 'Hyundai', model: 'Tucson', year: 2024, esp32DeviceId: 'ESP32_GH_0003', isActive: true, photo: '', createdAt: '2025-03-10T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
    { id: 84, plateNumber: 'GT-1003-20', brand: 'Kia', model: 'Sorento', year: 2023, esp32DeviceId: 'ESP32_GH_0004', isActive: true, photo: '', createdAt: '2025-01-20T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
    { id: 85, plateNumber: 'GT-1004-20', brand: 'Mercedes', model: 'Sprinter', year: 2024, esp32DeviceId: 'ESP32_GH_0005', isActive: true, photo: '', createdAt: '2025-04-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
    { id: 86, plateNumber: 'GT-1005-20', brand: 'Honda', model: 'CR-V', year: 2024, esp32DeviceId: 'ESP32_GH_0006', isActive: true, photo: '', createdAt: '2025-05-10T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
    { id: 87, plateNumber: 'GT-1006-20', brand: 'Ford', model: 'Ranger', year: 2023, esp32DeviceId: 'ESP32_GH_0007', isActive: true, photo: '', createdAt: '2025-06-15T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  ];

  useEffect(() => { load(); loadSessions(); }, []);

  useEffect(() => {
    if (!selectedVehicle) { setMaintenanceRecs([]); return; }
    setMaintenanceLoading(true);
    maintenanceService.getByVehicle(selectedVehicle.id).then(setMaintenanceRecs).catch(() => setMaintenanceRecs([])).finally(() => setMaintenanceLoading(false));
  }, [selectedVehicle]);

  const load = async () => {
    try { setLoading(true); setError(null); const data = await vehicleService.getAll(); setVehicles(data.length ? data : DEMO_VEHICLES); }
    catch (err: any) { setVehicles(DEMO_VEHICLES); }
    finally { setLoading(false); }
  };
  const loadSessions = async () => {
    try { setSessions(await vehicleService.getActiveSessions()); }
    catch { /* ignore */ }
  };

  const getVehiclePhoto = (v: Vehicle) => v.photo || getStablePhoto(v.id, `${v.plateNumber} ${v.brand} ${v.model}`, UNIQUE_VEHICLE_PHOTOS);

  const inUse = (id: number) => sessions.some(s => s.vehicleId === id);

  const openAdd = () => { setEditV(null); setForm({ plateNumber: '', brand: '', model: '', year: new Date().getFullYear(), esp32DeviceId: '', photo: '' }); setFormError(null); setShowModal(true); };
  const openEdit = (v: Vehicle) => { setEditV(v); setForm({ plateNumber: v.plateNumber, brand: v.brand, model: v.model, year: v.year, esp32DeviceId: v.esp32DeviceId, photo: v.photo || '' }); setFormError(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      if (editV) await vehicleService.update(editV.id, form);
      else await vehicleService.create(form);
      await load(); await loadSessions(); setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadService.vehicleImage(file);
      setForm({ ...form, photo: url });
    } catch {
      setFormError('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (v: Vehicle) => {
    if (!window.confirm(`Delete vehicle ${v.plateNumber}?`)) return;
    try { await vehicleService.delete(v.id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = `${v.plateNumber} ${v.brand} ${v.model} ${v.esp32DeviceId}`.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && v.isActive) || (filterStatus === 'inactive' && !v.isActive);
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const badge = (label: string, color: string) => (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
          <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Vehicles', value: vehicles.length, color: '#3b82f6', icon: 'ti-truck' },
          { label: 'Active', value: vehicles.filter(v => v.isActive).length, color: '#22c55e', icon: 'ti-check' },
          { label: 'In Use', value: sessions.length, color: '#f59e0b', icon: 'ti-player-play' },
          { label: 'Available', value: vehicles.filter(v => v.isActive && !inUse(v.id)).length, color: '#06b6d4', icon: 'ti-parking' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 240 }} />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); setPage(0); }} style={{ ...inputStyle, width: 120, cursor: 'pointer' }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Vehicle</button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ ...hdrStyle, width: 60 }}>Image</th>
                <th style={hdrStyle}>Vehicle</th>
                <th style={hdrStyle}>Brand / Model</th>
                <th style={hdrStyle}>Year</th>
                <th style={hdrStyle}>Odometer</th>
                <th style={hdrStyle}>Registered</th>
                <th style={hdrStyle}>Device ID</th>
                <th style={hdrStyle}>Status</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => (
                <tr key={v.id} onClick={() => setDetailVehicle(v)} style={{ cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, width: 60 }}>
                    {getVehiclePhoto(v) ? (
                      <img src={getVehiclePhoto(v)} alt={v.plateNumber} style={{ width: 50, height: 36, borderRadius: 6, objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style'); }}
                      />
                    ) : null}
                    <div style={{ width: 50, height: 36, borderRadius: 6, background: v.isActive ? 'rgba(59,130,246,0.15)' : 'var(--bg3)', display: getVehiclePhoto(v) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="las la-truck" style={{ fontSize: 16, color: v.isActive ? '#3b82f6' : 'var(--text3)' }}></i>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v.plateNumber}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>ID: {v.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div style={{ fontWeight: 500 }}>{v.brand}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.model}</div>
                  </td>
                  <td style={cellStyle}>{badge(String(v.year), '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                    {v.totalOdometer ? `${v.totalOdometer.toLocaleString()} km` : '-'}
                  </td>
                  <td style={cellStyle}>
                    {v.registrationDate ? new Date(v.registrationDate).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{v.esp32DeviceId}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {badge(v.isActive ? 'Active' : 'Inactive', v.isActive ? '#22c55e' : '#5c6f8a')}
                      {inUse(v.id) && badge('In Use', '#f59e0b')}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEdit(v)}>
                        <i className="las la-edit" style={{ fontSize: 14 }}></i>
                      </button>
                      <button style={{ ...btn, padding: '5px 10px', color: inUse(v.id) ? 'var(--text3)' : 'var(--danger)' }} onClick={() => handleDelete(v)} disabled={inUse(v.id)}>
                        <i className="las la-trash-alt" style={{ fontSize: 14 }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No vehicles found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows: </span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: 70, padding: '4px 8px', fontSize: 12 }}>
              <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
            </select>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <i className="las la-chevron-left" style={{ fontSize: 14 }}></i>
            </button>
            <span>{page + 1} / {Math.max(1, totalPages)}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= totalPages - 1 ? 0.4 : 1 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <i className="las la-chevron-right" style={{ fontSize: 14 }}></i>
            </button>
          </div>
                </div>
                {/* Maintenance History */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="las la-tools" style={{ fontSize: 13 }}></i> Maintenance History
                  </div>
                  {maintenanceLoading ? (
                    <div style={{ textAlign: 'center', padding: 12 }}>
                      <div style={{ width: 20, height: 20, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                    </div>
                  ) : maintenanceRecs.length === 0 ? (
                    <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', padding: 12 }}>No maintenance records</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {maintenanceRecs.slice(0, 5).map(r => (
                        <div key={r.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: `${SERVICE_COLORS[r.type]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className={`ti ${TYPE_ICONS[r.type]}`} style={{ fontSize: 12, color: SERVICE_COLORS[r.type] }}></i>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{r.description || TYPE_LABELS[r.type]}</div>
                              <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                                {new Date(r.performedAt).toLocaleDateString()} &middot; {r.odometer.toLocaleString()} km
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>GHS {r.cost.toLocaleString()}</div>
                        </div>
                      ))}
                      {maintenanceRecs.length > 5 && (
                        <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', paddingTop: 4 }}>+{maintenanceRecs.length - 5} more records</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

      {/* Vehicle Info Popup â€” Map with Beautiful Car */}
      {selectedVehicle && (() => {
        const loc = VEHICLE_LOCATIONS[selectedVehicle.id] || { lat: 5.6000, lng: -0.2000 };
        const carIcon = createCarIcon(selectedVehicle.isActive ? '#00c9a7' : '#5c6f8a');
        const MapAutoCenter = () => { const map = useMap(); useEffect(() => { map.setView([loc.lat, loc.lng], 16, { animate: true }); }, []); return null; };
        return (
          <div onClick={() => setSelectedVehicle(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
              {/* Map area */}
              <div style={{ height: 260, position: 'relative' }}>
                <MapContainer center={[loc.lat, loc.lng]} zoom={15} style={{ height: '100%', width: '100%' }}
                  zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; CARTO"
                  />
                  <Marker position={[loc.lat, loc.lng]} icon={carIcon}>
                    {/* Popup on click on marker */}
                    </Marker>
                  <MapAutoCenter />
                </MapContainer>
                {/* Close btn */}
                <button onClick={() => setSelectedVehicle(null)} style={{ position: 'absolute', top: 12, right: 12, zIndex: 1001, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <i className="las la-times" style={{ fontSize: 16 }}></i>
                </button>
                {/* Location label */}
                <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1001, padding: '5px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="las la-map-pin" style={{ fontSize: 13, color: 'var(--accent)' }}></i>
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </div>
              </div>
              {/* Vehicle info card overlay at bottom */}
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `rgba(0,201,167,0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="las la-truck" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{selectedVehicle.plateNumber}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selectedVehicle.brand} {selectedVehicle.model} &middot; ID: {selectedVehicle.id}</div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: selectedVehicle.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(92,111,138,0.12)', color: selectedVehicle.isActive ? '#22c55e' : '#5c6f8a' }}>
                    {selectedVehicle.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Year', value: selectedVehicle.year, icon: 'ti-calendar', color: '#f59e0b' },
                    { label: 'Odometer', value: selectedVehicle.totalOdometer ? `${selectedVehicle.totalOdometer.toLocaleString()} km` : '-', icon: 'ti-speedometer', color: '#3b82f6' },
                    { label: 'Registered', value: selectedVehicle.registrationDate ? new Date(selectedVehicle.registrationDate).toLocaleDateString() : '-', icon: 'ti-clipboard', color: '#22c55e' },
                    { label: 'Device ID', value: selectedVehicle.esp32DeviceId, icon: 'ti-chip', color: '#8b5cf6' },
                    { label: 'Status', value: inUse(selectedVehicle.id) ? 'In Use' : 'Available', icon: inUse(selectedVehicle.id) ? 'ti-player-play' : 'ti-parking', color: inUse(selectedVehicle.id) ? '#f59e0b' : '#06b6d4' },
                    { label: 'Last Service', value: selectedVehicle.lastServiceOdometer ? `${selectedVehicle.lastServiceOdometer.toLocaleString()} km` : '-', icon: 'ti-tool', color: '#ef4444' },
                  ].map(d => (
                    <div key={d.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${d.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`ti ${d.icon}`} style={{ fontSize: 13, color: d.color }}></i>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{d.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: d.label === 'Device ID' ? "'JetBrains Mono', monospace" : 'inherit' }}>{d.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editV ? 'Edit Vehicle' : 'Add Vehicle'}</div>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                  <i className="las la-times"></i>
                </button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && (
                  <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}>
                    <i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Plate Number</label>
                    <input required value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} placeholder="34 ABC 123" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Device ID</label>
                    <input required value={form.esp32DeviceId} onChange={e => setForm({ ...form, esp32DeviceId: e.target.value })} placeholder="ESP32_001" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Brand</label>
                    <input required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Toyota" style={inputStyle} list="brands" />
                    <datalist id="brands">
                      {['Toyota', 'Honda', 'Ford', 'Volkswagen', 'Renault', 'Fiat', 'Hyundai', 'Peugeot', 'Opel', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Skoda'].map(b => <option key={b} value={b} />)}
                    </datalist>
                  </div>
                  <div>
                    <label style={labelStyle}>Model</label>
                    <input required value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Corolla" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Year</label>
                    <input type="number" required value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} min={1990} max={2027} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Image (optional)</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button type="button" onClick={() => fileRef.current?.click()} style={{ ...btn, padding: '8px 14px', fontSize: 12 }}>
                        <i className="las la-upload" style={{ fontSize: 14 }}></i>
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>or</span>
                      <input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} placeholder="https://placehold.co/400x250... (URL)" style={inputStyle} />
                      {form.photo && (
                        <img src={form.photo} alt="preview" style={{ width: 48, height: 34, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editV ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AnimatedDetailModal
        open={!!detailVehicle}
        onClose={() => setDetailVehicle(null)}
        title={detailVehicle ? `${detailVehicle.brand} ${detailVehicle.model}` : ''}
        subtitle={detailVehicle ? detailVehicle.plateNumber : undefined}
        icon="car"
        iconBg="rgba(59,130,246,0.12)"
        iconColor="#3b82f6"
        accent="#3b82f6"
        sections={
          detailVehicle ? [
            { title: 'Vehicle Info', icon: 'car', iconColor: '#3b82f6', fields: [
              { label: 'Plate Number', value: detailVehicle.plateNumber, icon: 'hash', mono: true },
              { label: 'Brand', value: detailVehicle.brand, icon: 'building' },
              { label: 'Model', value: detailVehicle.model, icon: 'tag' },
              { label: 'Year', value: detailVehicle.year, icon: 'calendar' },
            ]},
            { title: 'Device', icon: 'cpu', iconColor: '#f59e0b', fields: [
              { label: 'ESP32 Device', value: detailVehicle.esp32DeviceId || 'Not assigned', icon: 'device-watch', mono: true },
              { label: 'Status', value: detailVehicle.isActive ? 'Active' : 'Inactive', icon: 'circle-check', badge: true, badgeColor: detailVehicle.isActive ? '#22c55e' : '#5c6f8a' },
            ]},
            { title: 'System', icon: 'settings', iconColor: '#8b5cf6', fields: [
              { label: 'Vehicle ID', value: `#${detailVehicle.id}`, icon: 'hashtag', mono: true },
              { label: 'Created', value: new Date(detailVehicle.createdAt).toLocaleDateString('en-GB'), icon: 'clock' },
              { label: 'Last Updated', value: new Date(detailVehicle.updatedAt).toLocaleDateString('en-GB'), icon: 'refresh' },
            ]},
          ] : []
        }
      />
    </div>
  );
}
