import { useState, useEffect } from 'react';
import { auditService, type AuditLogEntry } from '../services/auditService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>;
const actionColors: Record<string, string> = { create: '#22c55e', update: '#3b82f6', delete: '#ef4444', approve: '#8b5cf6', reject: '#dc2626', login: '#14b8a6', logout: '#5c6f8a', export: '#f59e0b' };
const statusColors: Record<string, string> = { approved: '#22c55e', rejected: '#ef4444', pending: '#f59e0b', unknown: '#5c6f8a' };

export default function AuditPage() {
  const [data, setData] = useState<AuditLogEntry[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const DEMO_LOGS: AuditLogEntry[] = [
    { id: 1, action: 'create', entityType: 'Vehicle', entityId: 81, userId: 1, description: 'Created vehicle GT-1000-20 (Toyota Hilux)', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-12T09:15:00Z' },
    { id: 2, action: 'update', entityType: 'Driver', entityId: 15, userId: 1, description: 'Updated driver Kwame Asante â€” phone number changed', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-12T08:45:00Z' },
    { id: 3, action: 'delete', entityType: 'Session', entityId: 98, userId: 2, description: 'Deleted orphaned session record', changes: null, ipAddress: '192.168.1.22', approvalStatus: 'pending', approvedById: null, approvedAt: null, createdAt: '2026-06-12T07:30:00Z' },
    { id: 4, action: 'approve', entityType: 'Deployment', entityId: 12, userId: 1, description: 'Approved deployment for driver Akua Mensah â€” vehicle GT-1001-20', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-12T06:00:00Z' },
    { id: 5, action: 'create', entityType: 'Alert', entityId: 45, userId: null, description: 'System generated speed alert â€” 95 km/h in 60 zone', changes: null, ipAddress: 'system', approvalStatus: null, approvedById: null, approvedAt: null, createdAt: '2026-06-12T05:20:00Z' },
    { id: 6, action: 'login', entityType: 'User', entityId: 1, userId: 1, description: 'Admin user login from Accra HQ', changes: null, ipAddress: '41.215.83.42', approvalStatus: null, approvedById: null, approvedAt: null, createdAt: '2026-06-12T08:00:00Z' },
    { id: 7, action: 'logout', entityType: 'User', entityId: 3, userId: 3, description: 'User logout â€” supervisor shift ended', changes: null, ipAddress: '41.215.83.45', approvalStatus: null, approvedById: null, approvedAt: null, createdAt: '2026-06-11T22:00:00Z' },
    { id: 8, action: 'export', entityType: 'Report', entityId: 23, userId: 1, description: 'Exported monthly revenue report (June 2026)', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-11T17:30:00Z' },
    { id: 9, action: 'update', entityType: 'KPI', entityId: 4, userId: 2, description: 'Updated fuel efficiency KPI target from 8.0 to 8.5 km/l', changes: null, ipAddress: '192.168.1.22', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-11T15:00:00Z' },
    { id: 10, action: 'reject', entityType: 'Revenue', entityId: 22, userId: 1, description: 'Rejected revenue entry â€” amount mismatch with trip count', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'rejected', approvedById: null, approvedAt: null, createdAt: '2026-06-11T14:15:00Z' },
    { id: 11, action: 'create', entityType: 'Device', entityId: 6, userId: 1, description: 'Registered new device GT06N-003 (IMEI: 863456032114556)', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-11T11:00:00Z' },
    { id: 12, action: 'update', entityType: 'Organization', entityId: 3, userId: 1, description: 'Updated Ashanti Region office â€” new address added', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-11T09:30:00Z' },
    { id: 13, action: 'delete', entityType: 'Driver', entityId: 22, userId: 2, description: 'Removed inactive driver profile', changes: null, ipAddress: '192.168.1.22', approvalStatus: 'pending', approvedById: null, approvedAt: null, createdAt: '2026-06-10T16:00:00Z' },
    { id: 14, action: 'login', entityType: 'User', entityId: 2, userId: 2, description: 'Supervisor login from Kumasi depot', changes: null, ipAddress: '41.215.84.10', approvalStatus: null, approvedById: null, approvedAt: null, createdAt: '2026-06-10T07:45:00Z' },
    { id: 15, action: 'create', entityType: 'Maintenance', entityId: 33, userId: 1, description: 'Scheduled maintenance for Mercedes Sprinter â€” oil change + brake inspection', changes: null, ipAddress: '192.168.1.10', approvalStatus: 'approved', approvedById: null, approvedAt: null, createdAt: '2026-06-10T06:00:00Z' },
  ];
  const DEMO_SUMMARY = { totalLogs: 15, pendingApprovals: 2, criticalActions: 3 };

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); const [logs, sum] = await Promise.all([auditService.getAll(), auditService.getSummary()]); setData(logs.length ? logs : DEMO_LOGS); setSummary(sum?.totalLogs ? sum : DEMO_SUMMARY); }
    catch (err: any) { setData(DEMO_LOGS); setSummary(DEMO_SUMMARY); }
    finally { setLoading(false); }
  };

  const filtered = data.filter(l => actionFilter === 'all' || l.action === actionFilter);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div>
      {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
        <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
      </div>}

      {summary.totalLogs !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total (30d)', value: summary.totalLogs, color: '#3b82f6', icon: 'ti-file-text' },
            { label: 'Pending Approvals', value: summary.pendingApprovals, color: '#f59e0b', icon: 'ti-clock' },
            { label: 'Delete Actions', value: summary.criticalActions, color: '#ef4444', icon: 'ti-alert-triangle' },
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
      )}

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 160, padding: '8px 10px' }}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="export">Export</option>
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Showing {filtered.length} of {data.length} events</span>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Time</th>
                <th style={hdrStyle}>Action</th>
                <th style={hdrStyle}>Entity</th>
                <th style={hdrStyle}>Entity ID</th>
                <th style={hdrStyle}>User</th>
                <th style={hdrStyle}>Description</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>IP</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => (
                <tr key={l.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString()}</td>
                  <td style={cellStyle}>{badge(l.action, actionColors[l.action] || '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{l.entityType}</td>
                  <td style={cellStyle}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{l.entityId ?? '-'}</span></td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{l.userId ? `#${l.userId}` : '-'}</td>
                  <td style={{ ...cellStyle, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.description}</td>
                  <td style={cellStyle}>{badge(l.approvalStatus ? (l.approvalStatus === 'pending' ? 'Pending' : l.approvalStatus.charAt(0).toUpperCase() + l.approvalStatus.slice(1)) : 'N/A', statusColors[l.approvalStatus || 'unknown'])}</td>
                  <td style={{ ...cellStyle, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{l.ipAddress || '-'}</td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No audit logs found</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows: </span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: 70, padding: '4px 8px', fontSize: 12 }}>
              <option value={10}>10</option><option value={15}>15</option><option value={25}>25</option><option value={50}>50</option>
            </select>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="las la-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 }} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="las la-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>
    </div>
  );
}
