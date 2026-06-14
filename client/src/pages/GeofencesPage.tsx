import { useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

const GHANA_CENTER: LatLngExpression = [7.9465, -1.0232];

interface Geofence {
  id: number;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  type: 'restricted' | 'allowed' | 'charging';
  isActive: boolean;
  vehiclesInside?: number;
  totalVehicles?: number;
}

const MOCK: Geofence[] = [
  { id: 1, name: 'Depot Zone', lat: 7.9465, lng: -1.0232, radius: 500, type: 'allowed', isActive: true, vehiclesInside: 12, totalVehicles: 20 },
  { id: 2, name: 'Restricted Area A', lat: 8.0, lng: -1.1, radius: 300, type: 'restricted', isActive: true, vehiclesInside: 0, totalVehicles: 20 },
  { id: 3, name: 'Charging Station 1', lat: 7.9, lng: -0.95, radius: 100, type: 'charging', isActive: true, vehiclesInside: 3, totalVehicles: 20 },
  { id: 4, name: 'Warehouse Zone', lat: 8.02, lng: -0.98, radius: 400, type: 'allowed', isActive: true, vehiclesInside: 5, totalVehicles: 20 },
  { id: 5, name: 'Security Perimeter', lat: 7.88, lng: -1.05, radius: 200, type: 'restricted', isActive: false, vehiclesInside: 0, totalVehicles: 20 },
];

const typeColor: Record<string, string> = { restricted: '#ef4444', allowed: '#22c55e', charging: '#3b82f6' };
const typeLabel: Record<string, string> = { restricted: 'Restricted', allowed: 'Allowed', charging: 'Charging' };
const typeIcon: Record<string, string> = { restricted: 'ti-shield-off', allowed: 'ti-circle-check', charging: 'ti-bolt' };

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
);

const MapBounds = ({ geofences }: { geofences: Geofence[] }) => {
  const map = useMap();
  if (geofences.length > 0) {
    const lats = geofences.map(g => g.lat);
    const lngs = geofences.map(g => g.lng);
    const minLat = Math.min(...lats) - 0.05;
    const maxLat = Math.max(...lats) + 0.05;
    const minLng = Math.min(...lngs) - 0.05;
    const maxLng = Math.max(...lngs) + 0.05;
    map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [30, 30] });
  }
  return null;
};

export default function GeofencesPage() {
  const [geofences] = useState<Geofence[]>(MOCK);
  const [selectedZone, setSelectedZone] = useState<Geofence | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeZones = geofences.filter(g => g.isActive).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Geofences</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Manage geographic boundaries and zones</div>
        </div>
        <button style={btn} onClick={() => setShowAddModal(true)}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Zone</button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Zones', value: geofences.length, color: '#3b82f6', icon: 'ti-map-pins' },
          { label: 'Active', value: activeZones, color: '#22c55e', icon: 'ti-circle-check' },
          { label: 'Restricted', value: geofences.filter(g => g.type === 'restricted').length, color: '#ef4444', icon: 'ti-shield-off' },
          { label: 'Vehicles in Zones', value: geofences.reduce((s, g) => s + (g.vehiclesInside || 0), 0), color: '#f59e0b', icon: 'ti-car' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
        {/* Map */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', height: 400 }}>
          <MapContainer center={GHANA_CENTER} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
            <MapBounds geofences={geofences} />
            {geofences.filter(g => g.isActive).map(g => (
              <Circle
                key={g.id}
                center={[g.lat, g.lng]}
                radius={g.radius}
                pathOptions={{
                  color: typeColor[g.type], fillColor: typeColor[g.type], fillOpacity: 0.12, weight: 2,
                  ...(selectedZone?.id === g.id ? { weight: 4, fillOpacity: 0.2 } : {}),
                }}
                eventHandlers={{ click: () => setSelectedZone(g) }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Zone sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {geofences.map(g => {
            const sel = selectedZone?.id === g.id;
            const cc = typeColor[g.type];
            return (
              <div key={g.id}
                onClick={() => setSelectedZone(sel ? null : g)}
                style={{
                  padding: 12, borderRadius: 10, cursor: 'pointer',
                  background: sel ? `${cc}0A` : 'var(--bg2)',
                  border: sel ? `1px solid ${cc}40` : '1px solid var(--border)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `${cc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`ti ${typeIcon[g.type]}`} style={{ fontSize: 14, color: cc }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{typeLabel[g.type]} &middot; {g.radius}m</div>
                  </div>
                  {g.isActive ? (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0,
                    }} />
                  ) : null}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)' }}>
                  <span>{g.vehiclesInside} / {g.totalVehicles} vehicles</span>
                  <span style={{ fontWeight: 600, color: g.isActive ? '#22c55e' : 'var(--text3)' }}>{g.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Name</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Radius</th>
                <th style={hdrStyle}>Coordinates</th>
                <th style={hdrStyle}>Vehicles</th>
                <th style={hdrStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {geofences.map(g => (
                <tr key={g.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setSelectedZone(g)} style={{ cursor: 'pointer' }}>
                  <td style={cellStyle}><span style={{ fontWeight: 600 }}>{g.name}</span></td>
                  <td style={cellStyle}>{badge(typeLabel[g.type], typeColor[g.type])}</td>
                  <td style={cellStyle}>{g.radius}m</td>
                  <td style={{ ...cellStyle, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{Number(g.lat).toFixed(4)}, {Number(g.lng).toFixed(4)}</td>
                  <td style={cellStyle}>{g.vehiclesInside} / {g.totalVehicles}</td>
                  <td style={cellStyle}>{badge(g.isActive ? 'Active' : 'Inactive', g.isActive ? '#22c55e' : '#5c6f8a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowAddModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 450, maxWidth: '90vw' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Add Geofence Zone</div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                <i className="las la-times"></i>
              </button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Zone Name</label>
                  <input placeholder="e.g. Depot Zone" style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Latitude</label>
                    <input placeholder="7.9465" style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Longitude</label>
                    <input placeholder="-1.0232" style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Radius (meters)</label>
                  <input type="number" defaultValue={500} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Type</label>
                  <select style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%', cursor: 'pointer' }}>
                    <option value="allowed">Allowed</option>
                    <option value="restricted">Restricted</option>
                    <option value="charging">Charging</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={btn} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={{ ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' }} onClick={() => setShowAddModal(false)}>Create Zone</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
