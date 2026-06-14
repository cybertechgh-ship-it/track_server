import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import api from '../services/api';
import { CYTRACK_LOGO } from '../constants/logo';

interface AlertItem {
  id: number;
  type: string;
  severity: string;
  vehicleId: number;
  driverId: number | null;
  sessionId: number | null;
  message: string;
  data: any;
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedBy: number | null;
  acknowledgedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: { id: number; plateNumber: string };
}

const typeIcons: Record<string, string> = {
  speed: 'ti-speedometer', unauthorized: 'ti-shield-off',
  geofence_enter: 'ti-border-corner', geofence_exit: 'ti-border-corner',
  maintenance: 'ti-tool', idle: 'ti-clock-pause',
};
const typeColors: Record<string, string> = {
  speed: '#3b82f6', unauthorized: '#ef4444',
  geofence_enter: '#8b5cf6', geofence_exit: '#8b5cf6',
  maintenance: '#f59e0b', idle: '#5c6f8a',
};
const severityColors: Record<string, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626',
};
const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: '#3b82f6' },
  read: { label: 'Read', color: '#5c6f8a' },
  acknowledged: { label: 'Acknowledged', color: '#22c55e' },
};

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '10px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s ease',
};
const btnPrimary: React.CSSProperties = {
  ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)',
};
const inputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 14, fontSize: 13, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', outline: 'none', minWidth: 200,
};
const cardStyle: React.CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18,
  padding: 18, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
};
const cellStyle: React.CSSProperties = { padding: '14px 18px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 700, fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' };

const badge = (label: string, color: string) => (
  <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${color}18`, color }}>{label}</span>
);

function getAlertStatus(a: AlertItem): string {
  if (a.isAcknowledged) return 'acknowledged';
  if (a.isRead) return 'read';
  return 'new';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const DEMO_ALERTS: AlertItem[] = [
    { id: 1, type: 'speed', severity: 'high', vehicleId: 1, driverId: 1, sessionId: 101, message: 'Speed limit exceeded: 115 km/h in 80 zone', data: null, isRead: false, isAcknowledged: true, acknowledgedBy: 1, acknowledgedAt: '2026-06-12T03:00:00Z', latitude: 5.623, longitude: -0.131, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T03:00:00Z', vehicle: { id: 1, plateNumber: 'GT-1018-20' } },
    { id: 2, type: 'speed', severity: 'low', vehicleId: 2, driverId: 2, sessionId: 102, message: 'Speed limit exceeded: 106 km/h in 80 zone', data: null, isRead: false, isAcknowledged: true, acknowledgedBy: 2, acknowledgedAt: '2026-06-12T03:00:00Z', latitude: 5.640, longitude: -0.170, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T03:00:00Z', vehicle: { id: 2, plateNumber: 'GT-1016-20' } },
    { id: 3, type: 'maintenance', severity: 'critical', vehicleId: 3, driverId: 3, sessionId: 103, message: 'Maintenance due soon (172 km remaining)', data: null, isRead: false, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: null, longitude: null, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T02:14:00Z', vehicle: { id: 3, plateNumber: 'GT-1015-20' } },
    { id: 4, type: 'speed', severity: 'low', vehicleId: 4, driverId: 4, sessionId: 104, message: 'Speed limit exceeded: 110 km/h in 80 zone', data: null, isRead: false, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: 5.603, longitude: -0.252, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T02:14:00Z', vehicle: { id: 4, plateNumber: 'GT-1014-20' } },
    { id: 5, type: 'maintenance', severity: 'medium', vehicleId: 5, driverId: 5, sessionId: 105, message: 'Maintenance due soon (291 km remaining)', data: null, isRead: true, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: null, longitude: null, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T02:14:00Z', vehicle: { id: 5, plateNumber: 'GT-1013-20' } },
    { id: 6, type: 'speed', severity: 'medium', vehicleId: 6, driverId: 6, sessionId: 106, message: 'Speed limit exceeded: 92 km/h in 60 zone', data: null, isRead: false, isAcknowledged: true, acknowledgedBy: 1, acknowledgedAt: '2026-06-12T03:00:00Z', latitude: 5.630, longitude: -0.190, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T03:00:00Z', vehicle: { id: 6, plateNumber: 'GT-1012-20' } },
    { id: 7, type: 'idle', severity: 'high', vehicleId: 7, driverId: 7, sessionId: 107, message: 'Engine idling for 11 minutes at Kumasi terminal', data: null, isRead: true, isAcknowledged: true, acknowledgedBy: 2, acknowledgedAt: '2026-06-12T03:00:00Z', latitude: 6.683, longitude: -1.624, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T03:00:00Z', vehicle: { id: 7, plateNumber: 'GT-1010-20' } },
    { id: 8, type: 'idle', severity: 'low', vehicleId: 8, driverId: 8, sessionId: 108, message: 'Engine idling for 9 minutes at Tema depot', data: null, isRead: true, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: 5.628, longitude: -0.001, createdAt: '2026-06-12T02:14:00Z', updatedAt: '2026-06-12T02:14:00Z', vehicle: { id: 8, plateNumber: 'GT-1009-20' } },
    { id: 9, type: 'maintenance', severity: 'critical', vehicleId: 9, driverId: 9, sessionId: 109, message: 'Maintenance due soon (2091 km remaining)', data: null, isRead: false, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: null, longitude: null, createdAt: '2026-06-12T02:13:00Z', updatedAt: '2026-06-12T02:13:00Z', vehicle: { id: 9, plateNumber: 'GT-1007-20' } },
    { id: 10, type: 'maintenance', severity: 'medium', vehicleId: 10, driverId: 10, sessionId: 110, message: 'Maintenance due soon (3392 km remaining)', data: null, isRead: true, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: null, longitude: null, createdAt: '2026-06-12T02:13:00Z', updatedAt: '2026-06-12T02:13:00Z', vehicle: { id: 10, plateNumber: 'GT-1006-20' } },
    { id: 11, type: 'maintenance', severity: 'high', vehicleId: 11, driverId: 11, sessionId: 111, message: 'Maintenance due soon (1393 km remaining)', data: null, isRead: true, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: null, longitude: null, createdAt: '2026-06-12T02:13:00Z', updatedAt: '2026-06-12T02:13:00Z', vehicle: { id: 11, plateNumber: 'GT-1004-20' } },
    { id: 12, type: 'idle', severity: 'high', vehicleId: 12, driverId: 12, sessionId: 112, message: 'Engine idling for 28 minutes at Accra central', data: null, isRead: true, isAcknowledged: true, acknowledgedBy: 1, acknowledgedAt: '2026-06-12T03:00:00Z', latitude: 5.550, longitude: -0.200, createdAt: '2026-06-12T02:13:00Z', updatedAt: '2026-06-12T03:00:00Z', vehicle: { id: 12, plateNumber: 'GT-1003-20' } },
    { id: 13, type: 'maintenance', severity: 'critical', vehicleId: 13, driverId: 13, sessionId: 113, message: 'Maintenance due soon (1383 km remaining)', data: null, isRead: false, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: null, longitude: null, createdAt: '2026-06-12T02:13:00Z', updatedAt: '2026-06-12T02:13:00Z', vehicle: { id: 13, plateNumber: 'GT-1001-20' } },
    { id: 14, type: 'idle', severity: 'low', vehicleId: 14, driverId: 14, sessionId: 114, message: 'Engine idling for 27 minutes at Spintex Road', data: null, isRead: true, isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, latitude: 5.610, longitude: -0.160, createdAt: '2026-06-12T02:13:00Z', updatedAt: '2026-06-12T02:13:00Z', vehicle: { id: 14, plateNumber: 'GT-1000-20' } },
  ];

  const DEMO_STATS_DATA = { total: 10, unread: 5, bySeverity: [{ severity: 'critical', count: 2 }, { severity: 'high', count: 2 }, { severity: 'medium', count: 3 }, { severity: 'low', count: 3 }] };

  const translateAlert = (msg: string): string => {
    const trMap: Record<string, string> = {
      'HÄ±z limiti aÅŸÄ±ldÄ±': 'Speed limit exceeded',
      'BakÄ±m zamanÄ± yaklaÅŸÄ±yor': 'Maintenance due soon',
      'km kaldÄ±': 'km remaining',
      'dakika rÃ¶lanti': 'minutes idling',
      'rÃ¶lanti': 'idling',
    };
    let result = msg;
    for (const [tr, en] of Object.entries(trMap)) {
      result = result.replace(new RegExp(tr, 'g'), en);
    }
    return result;
  };

  const fetchAlerts = useCallback(async () => {
    try { setLoading(true); setError(null);
      const res = await api.get('/alerts', { params: { limit: 100 } });
      const data = (res.data.data || []).map((a: AlertItem) => ({ ...a, message: translateAlert(a.message) }));
      setAlerts(data.length ? data : DEMO_ALERTS);
    } catch (err: any) { setAlerts(DEMO_ALERTS); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try { const res = await api.get('/alerts/stats'); setStats(res.data.data || DEMO_STATS_DATA); }
    catch { setStats(DEMO_STATS_DATA); }
  }, []);

  useEffect(() => { fetchAlerts(); fetchStats(); }, [fetchAlerts, fetchStats]);

  const acknowledge = async (id: number) => {
    try { await api.patch(`/alerts/${id}/acknowledge`); fetchAlerts(); fetchStats(); }
    catch (err: any) { setError(err.message || 'Acknowledge failed'); }
  };

  const filtered = alerts.filter(a => {
    if (search && !a.message.toLowerCase().includes(search.toLowerCase())) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && alerts.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}><img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />Alerts & Notifications</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text3)' }}>Real-time fleet alerts and notifications</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--success)', fontWeight: 700, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
              LIVE
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={btnPrimary} onClick={fetchAlerts}><i className="las la-sync" style={{ fontSize: 14 }}></i> Refresh</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
          <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Alerts', value: stats?.total ?? alerts.length, color: '#5c6f8a', icon: 'ti-bell' },
          { label: 'Unread', value: stats?.unread ?? alerts.filter(a => !a.isRead).length, color: '#3b82f6', icon: 'ti-bell-ringing' },
          { label: 'Critical', value: stats?.bySeverity?.find((s: any) => s.severity === 'critical')?.count ?? 0, color: '#dc2626', icon: 'ti-alert-triangle' },
          { label: 'High', value: stats?.bySeverity?.find((s: any) => s.severity === 'high')?.count ?? 0, color: '#ef4444', icon: 'ti-alert-circle' },
        ].map(s => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search alerts..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 240 }} />
          </div>
          <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 120, padding: '8px 10px' }}>
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 130, padding: '8px 10px' }}>
            <option value="all">All Types</option>
            <option value="speed">Speed</option>
            <option value="maintenance">Maintenance</option>
            <option value="idle">Idle</option>
            <option value="unauthorized">Unauthorized</option>
            <option value="geofence_enter">Geofence</option>
          </select>
        </div>
        <button style={btn}><i className="las la-sliders-h" style={{ fontSize: 14 }}></i> Manage Rules</button>
      </div>

      {/* Alert Rules Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Message</th>
                <th style={hdrStyle}>Severity</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Date</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => {
                const status = getAlertStatus(a);
                const st = statusLabels[status];
                const tc = typeColors[a.type] || '#5c6f8a';
                const sc = severityColors[a.severity] || '#5c6f8a';
                return (
                  <tr key={a.id}
                    onClick={() => setSelectedAlert(a)}
                    style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className={`ti ${typeIcons[a.type] || 'ti-alert'}`} style={{ fontSize: 14, color: tc }}></i>
                        <span style={{ fontWeight: 600, fontSize: 12, color: tc, textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td style={{ ...cellStyle, maxWidth: 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.vehicle?.plateNumber && (
                          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text3)', whiteSpace: 'nowrap' }}>{a.vehicle.plateNumber}</span>
                        )}
                        <span style={{ color: !a.isRead ? 'var(--text)' : 'var(--text2)' }}>{a.message}</span>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      {badge(a.severity.toUpperCase(), sc)}
                    </td>
                    <td style={cellStyle}>
                      {badge(st.label, st.color)}
                    </td>
                    <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                      {dayjs(a.createdAt).format('DD.MM.YYYY HH:mm')}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        {!a.isAcknowledged && (
                          <button style={{ ...btn, padding: '5px 10px', color: 'var(--success)' }}
                            onClick={() => acknowledge(a.id)}
                            title="Acknowledge">
                            <i className="las la-check" style={{ fontSize: 14 }}></i>
                          </button>
                        )}
                        {a.isAcknowledged && (
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>â€”</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No alerts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows: </span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: 70, padding: '4px 8px', fontSize: 12 }}>
              <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="las la-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 }} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="las la-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>

      {/* Alert Info Popup */}
      {selectedAlert && (
        <div onClick={() => setSelectedAlert(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 480, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'relative', padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${severityColors[selectedAlert.severity] || '#5c6f8a'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ti ${typeIcons[selectedAlert.type] || 'ti-alert'}`} style={{ fontSize: 20, color: severityColors[selectedAlert.severity] || '#5c6f8a' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{selectedAlert.type.replace('_', ' ')} Alert</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selectedAlert.vehicle?.plateNumber || 'N/A'}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedAlert(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border2)', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="las la-times" style={{ fontSize: 16 }}></i>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                {badge(selectedAlert.severity.toUpperCase(), severityColors[selectedAlert.severity] || '#5c6f8a')}
                {badge(getAlertStatus(selectedAlert) === 'acknowledged' ? 'Acknowledged' : getAlertStatus(selectedAlert) === 'read' ? 'Read' : 'New', statusLabels[getAlertStatus(selectedAlert)].color)}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, background: 'var(--bg3)', borderRadius: 8, padding: 12, marginBottom: 16 }}>{selectedAlert.message}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Date & Time', value: dayjs(selectedAlert.createdAt).format('DD.MM.YYYY HH:mm'), icon: 'ti-clock' },
                  { label: 'Vehicle', value: selectedAlert.vehicle?.plateNumber || 'N/A', icon: 'ti-truck' },
                  { label: 'Driver ID', value: selectedAlert.driverId ? `D#${selectedAlert.driverId}` : 'N/A', icon: 'ti-user' },
                  { label: 'Coordinates', value: selectedAlert.latitude && selectedAlert.longitude ? `${selectedAlert.latitude.toFixed(4)}, ${selectedAlert.longitude.toFixed(4)}` : 'N/A', icon: 'ti-map-pin' },
                ].map(d => (
                  <div key={d.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className={`ti ${d.icon}`} style={{ fontSize: 14, color: 'var(--accent)' }}></i>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{d.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: d.label === 'Coordinates' ? "'JetBrains Mono', monospace" : 'inherit' }}>{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
