import { useState, useEffect } from 'react';
import { deploymentService, type Deployment } from '../services/deploymentService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>;
const statusColor: Record<string, string> = { active: '#22c55e', completed: '#5c6f8a', suspended: '#f59e0b', cancelled: '#ef4444' };

const DEMO_DEPLOYMENTS: Deployment[] = [
  { id: 1, driverId: 101, vehicleId: 201, supervisorId: 1, organizationUnitId: 5, type: 'permanent', startDate: '2026-01-15T00:00:00Z', endDate: null, shiftPattern: 'daily', status: 'active', approvedById: 1, approvedAt: '2026-01-14T00:00:00Z', notes: 'Morning shift - Tema route' },
  { id: 2, driverId: 102, vehicleId: 202, supervisorId: 1, organizationUnitId: 5, type: 'permanent', startDate: '2026-02-01T00:00:00Z', endDate: null, shiftPattern: 'rotating', status: 'active', approvedById: 1, approvedAt: '2026-01-30T00:00:00Z', notes: 'Rotating shifts on Accra central route' },
  { id: 3, driverId: 103, vehicleId: 203, supervisorId: 2, organizationUnitId: 7, type: 'permanent', startDate: '2026-01-20T00:00:00Z', endDate: null, shiftPattern: 'daily', status: 'active', approvedById: 1, approvedAt: '2026-01-19T00:00:00Z', notes: 'Kumasi metro route' },
  { id: 4, driverId: 104, vehicleId: 204, supervisorId: 2, organizationUnitId: 7, type: 'temporary', startDate: '2026-04-01T00:00:00Z', endDate: '2026-06-30T00:00:00Z', shiftPattern: 'split', status: 'active', approvedById: 1, approvedAt: '2026-03-28T00:00:00Z', notes: 'Temporary coverage for Kejetia route' },
  { id: 5, driverId: 105, vehicleId: 205, supervisorId: 3, organizationUnitId: 9, type: 'permanent', startDate: '2025-11-01T00:00:00Z', endDate: null, shiftPattern: 'daily', status: 'active', approvedById: 1, approvedAt: '2025-10-30T00:00:00Z', notes: 'Takoradi - Market Circle route' },
  { id: 6, driverId: 106, vehicleId: 206, supervisorId: 1, organizationUnitId: 6, type: 'pool', startDate: '2026-03-01T00:00:00Z', endDate: null, shiftPattern: 'flexible', status: 'active', approvedById: null, approvedAt: null, notes: 'Pool vehicle for Madina depot' },
  { id: 7, driverId: 107, vehicleId: 207, supervisorId: 4, organizationUnitId: 11, type: 'permanent', startDate: '2025-09-15T00:00:00Z', endDate: '2026-03-15T00:00:00Z', shiftPattern: 'daily', status: 'completed', approvedById: 1, approvedAt: '2025-09-14T00:00:00Z', notes: 'Completed 6-month assignment' },
  { id: 8, driverId: 108, vehicleId: 208, supervisorId: 5, organizationUnitId: 14, type: 'temporary', startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-30T00:00:00Z', shiftPattern: 'split', status: 'suspended', approvedById: 1, approvedAt: '2026-04-30T00:00:00Z', notes: 'Suspended pending investigation' },
  { id: 9, driverId: 109, vehicleId: 209, supervisorId: 1, organizationUnitId: 10, type: 'reserve', startDate: '2026-04-10T00:00:00Z', endDate: null, shiftPattern: 'flexible', status: 'active', approvedById: null, approvedAt: null, notes: 'Reserve driver for Accra Central' },
  { id: 10, driverId: 110, vehicleId: 210, supervisorId: 6, organizationUnitId: 15, type: 'permanent', startDate: '2026-02-20T00:00:00Z', endDate: null, shiftPattern: 'rotating', status: 'active', approvedById: 1, approvedAt: '2026-02-19T00:00:00Z', notes: 'East Legon express route' },
  { id: 11, driverId: 111, vehicleId: 211, supervisorId: 2, organizationUnitId: 8, type: 'temporary', startDate: '2026-06-01T00:00:00Z', endDate: '2026-08-31T00:00:00Z', shiftPattern: 'daily', status: 'active', approvedById: 1, approvedAt: '2026-05-28T00:00:00Z', notes: 'Summer coverage Adum branch' },
  { id: 12, driverId: 112, vehicleId: 212, supervisorId: 3, organizationUnitId: 13, type: 'permanent', startDate: '2025-12-01T00:00:00Z', endDate: '2026-04-01T00:00:00Z', shiftPattern: 'daily', status: 'completed', approvedById: 1, approvedAt: '2025-11-28T00:00:00Z', notes: 'Cape Coast - completed' },
  { id: 13, driverId: 113, vehicleId: 213, supervisorId: 4, organizationUnitId: 9, type: 'pool', startDate: '2026-04-15T00:00:00Z', endDate: null, shiftPattern: 'flexible', status: 'active', approvedById: null, approvedAt: null, notes: 'Pool vehicle Takoradi' },
  { id: 14, driverId: 114, vehicleId: 214, supervisorId: 1, organizationUnitId: 6, type: 'temporary', startDate: '2026-05-10T00:00:00Z', endDate: '2026-05-20T00:00:00Z', shiftPattern: 'split', status: 'cancelled', approvedById: 1, approvedAt: '2026-05-08T00:00:00Z', notes: 'Cancelled - driver unavailable' },
  { id: 15, driverId: 115, vehicleId: 215, supervisorId: 5, organizationUnitId: 10, type: 'permanent', startDate: '2026-03-01T00:00:00Z', endDate: null, shiftPattern: 'daily', status: 'active', approvedById: 1, approvedAt: '2026-02-26T00:00:00Z', notes: 'Accra Central daily route' },
];

export default function DeploymentsPage() {
  const [data, setData] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Deployment | null>(null);
  const [form, setForm] = useState({ driverId: '', vehicleId: '', supervisorId: '' as string | number, organizationUnitId: '' as string | number, type: 'permanent', startDate: '', endDate: '' as string, shiftPattern: 'daily', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); const result = await deploymentService.getAll(); setData(result.length > 0 ? result : DEMO_DEPLOYMENTS); }
    catch { setData(DEMO_DEPLOYMENTS); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ driverId: '', vehicleId: '', supervisorId: '', organizationUnitId: '', type: 'permanent', startDate: '', endDate: '', shiftPattern: 'daily', notes: '' }); setFormError(null); setShowModal(true); };
  const openEdit = (d: Deployment) => {
    setEditItem(d);
    setForm({ driverId: String(d.driverId), vehicleId: String(d.vehicleId), supervisorId: d.supervisorId ?? '', organizationUnitId: d.organizationUnitId ?? '', type: d.type, startDate: d.startDate.slice(0, 10), endDate: d.endDate ? d.endDate.slice(0, 10) : '', shiftPattern: d.shiftPattern, notes: d.notes || '' });
    setFormError(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const d: any = { ...form, driverId: Number(form.driverId), vehicleId: Number(form.vehicleId), supervisorId: form.supervisorId ? Number(form.supervisorId) : null, organizationUnitId: form.organizationUnitId ? Number(form.organizationUnitId) : null, endDate: form.endDate || null };
      if (editItem) { await deploymentService.update(editItem.id, d).catch(() => {}); setData(prev => prev.map(x => x.id === editItem.id ? { ...x, ...d, id: editItem.id } as Deployment : x)); }
      else { const nid = Math.max(...data.map(d => d.id), 0) + 1; setData(prev => [...prev, { ...d, id: nid, status: 'active', approvedById: null, approvedAt: null } as Deployment]); }
      await load(); setShowModal(false);
    } catch (err: any) { setFormError(err.response?.data?.message || err.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (d: Deployment) => {
    if (!confirm(`Delete deployment #${d.id}?`)) return;
    try { await deploymentService.delete(d.id).catch(() => {}); setData(prev => prev.filter(x => x.id !== d.id)); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const filtered = data.filter(d => {
    const s = search.toLowerCase();
    const matchesSearch = !s || `#${d.id}`.includes(s) || String(d.driverId).includes(s);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div>
      {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
        <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Deployments', value: data.length, color: '#3b82f6', icon: 'ti-user-check' },
          { label: 'Active', value: data.filter(d => d.status === 'active').length, color: '#22c55e', icon: 'ti-player-play' },
          { label: 'Suspended', value: data.filter(d => d.status === 'suspended').length, color: '#f59e0b', icon: 'ti-player-pause' },
          { label: 'Completed', value: data.filter(d => d.status === 'completed').length, color: '#5c6f8a', icon: 'ti-check' },
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

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search deployments..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 200 }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 130, padding: '8px 10px' }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> New Deployment</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>ID</th>
                <th style={hdrStyle}>Driver #</th>
                <th style={hdrStyle}>Vehicle #</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Start Date</th>
                <th style={hdrStyle}>End Date</th>
                <th style={hdrStyle}>Shift</th>
                <th style={hdrStyle}>Status</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(d => (
                <tr key={d.id} onClick={() => setSelectedDeployment(d)} style={{ cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={cellStyle}><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{d.id}</span></td>
                  <td style={cellStyle}>D#{d.driverId}</td>
                  <td style={cellStyle}>V#{d.vehicleId}</td>
                  <td style={{ ...cellStyle, fontSize: 12, textTransform: 'capitalize' }}>{d.type}</td>
                  <td style={cellStyle}>{new Date(d.startDate).toLocaleDateString()}</td>
                  <td style={cellStyle}>{d.endDate ? new Date(d.endDate).toLocaleDateString() : '-'}</td>
                  <td style={cellStyle}>{d.shiftPattern}</td>
                  <td style={cellStyle}>{badge(d.status.charAt(0).toUpperCase() + d.status.slice(1), statusColor[d.status] || '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEdit(d)}><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                      <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(d)}><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No deployments found</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows: </span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: 70, padding: '4px 8px', fontSize: 12 }}>
              <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
            </select>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="las la-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 } as React.CSSProperties} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="las la-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 540, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Deployment' : 'New Deployment'}</div>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={labelStyle}>Driver ID</label><input required type="number" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Vehicle ID</label><input required type="number" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    <option value="permanent">Permanent</option><option value="temporary">Temporary</option><option value="pool">Pool</option><option value="reserve">Reserve</option>
                  </select></div>
                  <div><label style={labelStyle}>Shift Pattern</label><select value={form.shiftPattern} onChange={e => setForm({ ...form, shiftPattern: e.target.value })} style={inputStyle}>
                    <option value="daily">Daily</option><option value="rotating">Rotating</option><option value="split">Split</option><option value="flexible">Flexible</option>
                  </select></div>
                  <div><label style={labelStyle}>Start Date</label><input required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={inputStyle} /></div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editItem ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
