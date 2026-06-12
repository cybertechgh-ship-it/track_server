import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import api from '../services/api';

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
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};
const btnPrimary: React.CSSProperties = {
  ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)',
};
const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', outline: 'none',
};
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
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

  const fetchAlerts = useCallback(async () => {
    try { setLoading(true); setError(null);
      const res = await api.get('/alerts', { params: { limit: 100 } });
      setAlerts(res.data.data || []);
    } catch (err: any) { setError(err.message || 'Failed to load alerts'); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try { const res = await api.get('/alerts/stats'); setStats(res.data.data); }
    catch { /* ignore */ }
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
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && alerts.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Alerts & Notifications</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Real-time fleet alerts and notifications</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20,
            color: 'var(--success)', fontSize: 12, fontWeight: 600,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
            LIVE
          </div>
          <button style={btn} onClick={fetchAlerts}><i className="ti ti-refresh" style={{ fontSize: 14 }}></i> Refresh</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="ti ti-alert-triangle" style={{ marginRight: 6 }}></i>{error}</span>
          <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Alerts', value: stats?.total ?? alerts.length, color: '#5c6f8a', icon: 'ti-bell' },
          { label: 'Unread', value: stats?.unread ?? alerts.filter(a => !a.isRead).length, color: '#3b82f6', icon: 'ti-bell-ringing' },
          { label: 'Critical', value: stats?.bySeverity?.find((s: any) => s.severity === 'critical')?.count ?? 0, color: '#dc2626', icon: 'ti-alert-triangle' },
          { label: 'High', value: stats?.bySeverity?.find((s: any) => s.severity === 'high')?.count ?? 0, color: '#ef4444', icon: 'ti-alert-circle' },
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

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
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
        <button style={btn}><i className="ti ti-adjustments" style={{ fontSize: 14 }}></i> Manage Rules</button>
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
                    style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className={`ti ${typeIcons[a.type] || 'ti-alert'}`} style={{ fontSize: 14, color: tc }}></i>
                        <span style={{ fontWeight: 600, fontSize: 12, color: tc, textTransform: 'capitalize' }}>{a.type}</span>
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
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        {!a.isAcknowledged && (
                          <button style={{ ...btn, padding: '5px 10px', color: 'var(--success)' }}
                            onClick={() => acknowledge(a.id)}
                            title="Acknowledge">
                            <i className="ti ti-check" style={{ fontSize: 14 }}></i>
                          </button>
                        )}
                        {a.isAcknowledged && (
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>—</span>
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
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="ti ti-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 }} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="ti ti-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>
    </div>
  );
}
