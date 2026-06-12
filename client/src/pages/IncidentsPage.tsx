import { useState, useEffect } from 'react';
import { incidentService, type IncidentReport } from '../services/incidentService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>;
const severityColors: Record<string, string> = { minor: '#22c55e', moderate: '#f59e0b', major: '#ef4444', critical: '#dc2626' };
const statusColors: Record<string, string> = { reported: '#3b82f6', investigating: '#8b5cf6', escalated: '#ef4444', resolved: '#22c55e', closed: '#5c6f8a' };

export default function IncidentsPage() {
  const [data, setData] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<IncidentReport | null>(null);
  const [form, setForm] = useState({ type: 'other', severity: 'moderate', driverId: '', vehicleId: '', dateOfIncident: '', location: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); setData(await incidentService.getAll()); }
    catch (err: any) { setError(err.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ type: 'other', severity: 'moderate', driverId: '', vehicleId: '', dateOfIncident: '', location: '', description: '' }); setFormError(null); setShowModal(true); };
  const openEdit = (r: IncidentReport) => {
    setEditItem(r);
    setForm({ type: r.type, severity: r.severity, driverId: String(r.driverId ?? ''), vehicleId: String(r.vehicleId ?? ''), dateOfIncident: r.dateOfIncident.slice(0, 10), location: r.location || '', description: r.description });
    setFormError(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const d: any = { ...form, driverId: form.driverId ? Number(form.driverId) : null, vehicleId: form.vehicleId ? Number(form.vehicleId) : null };
      if (editItem) await incidentService.update(editItem.id, d);
      else await incidentService.create(d);
      await load(); setShowModal(false);
    } catch (err: any) { setFormError(err.response?.data?.message || err.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (r: IncidentReport) => {
    if (!confirm(`Delete incident #${r.id}?`)) return;
    try { await incidentService.delete(r.id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const handleResolve = async (r: IncidentReport) => {
    try { await incidentService.update(r.id, { status: 'resolved', resolvedAt: new Date().toISOString() } as any); await load(); }
    catch (err: any) { setError(err.message || 'Resolve failed'); }
  };

  const filtered = data.filter(r => {
    const s = search.toLowerCase();
    return (!s || r.description.toLowerCase().includes(s) || r.type.includes(s) || `#${r.id}`.includes(s)) && (sevFilter === 'all' || r.severity === sevFilter);
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div>
      {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><i className="ti ti-alert-triangle" style={{ marginRight: 6 }}></i>{error}</span>
        <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Incidents', value: data.length, color: '#ef4444', icon: 'ti-alert-triangle' },
          { label: 'Open', value: data.filter(r => !['resolved', 'closed'].includes(r.status)).length, color: '#f59e0b', icon: 'ti-clock' },
          { label: 'Critical', value: data.filter(r => r.severity === 'critical').length, color: '#dc2626', icon: 'ti-bell' },
          { label: 'Resolved', value: data.filter(r => r.status === 'resolved' || r.status === 'closed').length, color: '#22c55e', icon: 'ti-check' },
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
            <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search incidents..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 200 }} />
          </div>
          <select value={sevFilter} onChange={e => { setSevFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 130, padding: '8px 10px' }}>
            <option value="all">All Severity</option>
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="major">Major</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Report Incident</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>ID</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Severity</th>
                <th style={hdrStyle}>Date</th>
                <th style={hdrStyle}>Description</th>
                <th style={hdrStyle}>Driver / Vehicle</th>
                <th style={hdrStyle}>Status</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={cellStyle}><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{r.id}</span></td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{r.type.replace(/_/g, ' ')}</td>
                  <td style={cellStyle}>{badge(r.severity, severityColors[r.severity])}</td>
                  <td style={cellStyle}>{new Date(r.dateOfIncident).toLocaleDateString()}</td>
                  <td style={{ ...cellStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                  <td style={cellStyle}>{r.driverId || r.vehicleId ? `${r.driverId ? `D#${r.driverId}` : ''}${r.driverId && r.vehicleId ? ' / ' : ''}${r.vehicleId ? `V#${r.vehicleId}` : ''}` : '-'}</td>
                  <td style={cellStyle}>{badge(r.status, statusColors[r.status])}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      {r.status !== 'resolved' && r.status !== 'closed' && <button style={{ ...btn, padding: '5px 10px', color: 'var(--success)' }} onClick={() => handleResolve(r)} title="Resolve"><i className="ti ti-check" style={{ fontSize: 14 }}></i></button>}
                      <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEdit(r)}><i className="ti ti-edit" style={{ fontSize: 14 }}></i></button>
                      <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(r)}><i className="ti ti-trash" style={{ fontSize: 14 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No incidents found</td></tr>}
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
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="ti ti-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 }} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="ti ti-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 540, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Incident' : 'Report Incident'}</div>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="ti ti-x"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="ti ti-alert-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={labelStyle}>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    <option value="accident">Accident</option><option value="theft">Theft</option><option value="damage">Damage</option>
                    <option value="traffic_violation">Traffic Violation</option><option value="passenger_complaint">Passenger Complaint</option>
                    <option value="disciplinary">Disciplinary</option><option value="mechanical">Mechanical</option><option value="other">Other</option>
                  </select></div>
                  <div><label style={labelStyle}>Severity</label><select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={inputStyle}>
                    <option value="minor">Minor</option><option value="moderate">Moderate</option><option value="major">Major</option><option value="critical">Critical</option>
                  </select></div>
                  <div><label style={labelStyle}>Driver ID</label><input type="number" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Vehicle ID</label><input type="number" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Date of Incident</label><input required type="date" value={form.dateOfIncident} onChange={e => setForm({ ...form, dateOfIncident: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={inputStyle} /></div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="ti ti-loader" style={{ animation: 'spin 0.8s linear infinite' }}></i> : <i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i>}
                  {editItem ? ' Update' : ' Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
