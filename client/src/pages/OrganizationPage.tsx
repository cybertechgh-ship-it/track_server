import { useState, useEffect } from 'react';
import { organizationService, type OrganizationUnit } from '../services/organizationService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const typeColors: Record<string, string> = { headquarters: '#8b5cf6', region: '#3b82f6', depot: '#22c55e', branch: '#f59e0b', team: '#ef4444' };
const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>;

const DEMO_UNITS: OrganizationUnit[] = [
  { id: 1, name: 'TGNE Fleet Services HQ', type: 'headquarters', parentId: null, managerId: 1, status: 'active', code: 'HQ-001', location: 'Accra, Ghana' },
  { id: 2, name: 'Greater Accra Region', type: 'region', parentId: 1, managerId: 2, status: 'active', code: 'REG-01', location: 'Accra' },
  { id: 3, name: 'Ashanti Region', type: 'region', parentId: 1, managerId: 3, status: 'active', code: 'REG-02', location: 'Kumasi' },
  { id: 4, name: 'Western Region', type: 'region', parentId: 1, managerId: 4, status: 'active', code: 'REG-03', location: 'Takoradi' },
  { id: 5, name: 'Tema Depot', type: 'depot', parentId: 2, managerId: 5, status: 'active', code: 'DP-001', location: 'Tema' },
  { id: 6, name: 'Madina Depot', type: 'depot', parentId: 2, managerId: 6, status: 'active', code: 'DP-002', location: 'Madina, Accra' },
  { id: 7, name: 'Kejetia Branch', type: 'branch', parentId: 3, managerId: 7, status: 'active', code: 'BR-001', location: 'Kejetia, Kumasi' },
  { id: 8, name: 'Adum Branch', type: 'branch', parentId: 3, managerId: 8, status: 'active', code: 'BR-002', location: 'Adum, Kumasi' },
  { id: 9, name: 'Takoradi Market Circle', type: 'branch', parentId: 4, managerId: 9, status: 'active', code: 'BR-003', location: 'Market Circle, Takoradi' },
  { id: 10, name: 'Accra Central Team', type: 'team', parentId: 5, managerId: 10, status: 'active', code: 'TM-001', location: 'Accra Central' },
  { id: 11, name: 'Spintex Team', type: 'team', parentId: 6, managerId: 11, status: 'active', code: 'TM-002', location: 'Spintex Road' },
  { id: 12, name: 'Lapaz Branch', type: 'branch', parentId: 2, managerId: 12, status: 'inactive', code: 'BR-004', location: 'Lapaz, Accra' },
  { id: 13, name: 'Cape Coast Branch', type: 'branch', parentId: 4, managerId: null, status: 'active', code: 'BR-005', location: 'Cape Coast' },
  { id: 14, name: 'Kumasi Central Team', type: 'team', parentId: 7, managerId: 13, status: 'active', code: 'TM-003', location: 'Kumasi Central' },
  { id: 15, name: 'East Legon Depot', type: 'depot', parentId: 2, managerId: 14, status: 'active', code: 'DP-003', location: 'East Legon, Accra' },
];

export default function OrganizationPage() {
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<OrganizationUnit | null>(null);
  const [form, setForm] = useState({ name: '', type: 'branch' as string, code: '', parentId: '' as string | number, managerId: '' as string | number, location: '', status: 'active' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); const result = await organizationService.getAll(); setUnits(result.length > 0 ? result : DEMO_UNITS); }
    catch { setUnits(DEMO_UNITS); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditItem(null); setForm({ name: '', type: 'branch', code: '', parentId: '', managerId: '', location: '', status: 'active' });
    setFormError(null); setShowModal(true);
  };
  const openEdit = (u: OrganizationUnit) => {
    setEditItem(u);
    setForm({ name: u.name, type: u.type, code: u.code || '', parentId: u.parentId ?? '', managerId: u.managerId ?? '', location: u.location || '', status: u.status });
    setFormError(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const data: any = { ...form };
      if (data.parentId === '' || data.parentId === 'none') data.parentId = null;
      else data.parentId = Number(data.parentId);
      if (data.managerId === '' || data.managerId === 'none') data.managerId = null;
      else data.managerId = Number(data.managerId);
      if (editItem) { await organizationService.update(editItem.id, data).catch(() => {}); setUnits(u => u.map(x => x.id === editItem.id ? { ...x, ...data, id: editItem.id } as OrganizationUnit : x)); }
      else { const nid = Math.max(...units.map(u => u.id), 0) + 1; setUnits(u => [...u, { ...data, id: nid, children: undefined } as OrganizationUnit]); }
      await load(); setShowModal(false);
    } catch (err: any) { setFormError(err.response?.data?.message || err.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (u: OrganizationUnit) => {
    if (!confirm(`Delete "${u.name}"?`)) return;
    try { await organizationService.delete(u.id).catch(() => {}); setUnits(prev => prev.filter(x => x.id !== u.id)); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const filtered = units.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
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
          { label: 'Total Units', value: units.length, color: '#8b5cf6', icon: 'ti-building-community' },
          { label: 'Headquarters', value: units.filter(u => u.type === 'headquarters').length, color: '#3b82f6', icon: 'ti-crown' },
          { label: 'Regions / Depots', value: units.filter(u => ['region', 'depot'].includes(u.type)).length, color: '#22c55e', icon: 'ti-map-pin' },
          { label: 'Branches / Teams', value: units.filter(u => ['branch', 'team'].includes(u.type)).length, color: '#f59e0b', icon: 'ti-users' },
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

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
          <input placeholder="Search units..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 260 }} />
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Unit</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Name</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Code</th>
                <th style={hdrStyle}>Location</th>
                <th style={hdrStyle}>Parent</th>
                <th style={hdrStyle}>Status</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={cellStyle}><div style={{ fontWeight: 600 }}>{u.name}</div></td>
                  <td style={cellStyle}>{badge(u.type, typeColors[u.type] || '#5c6f8a')}</td>
                  <td style={cellStyle}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{u.code || '-'}</span></td>
                  <td style={cellStyle}>{u.location || '-'}</td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>
                    {u.parentId ? units.find(p => p.id === u.parentId)?.name || `#${u.parentId}` : '-'}
                  </td>
                  <td style={cellStyle}>{badge(u.status === 'active' ? 'Active' : 'Inactive', u.status === 'active' ? '#22c55e' : '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEdit(u)}><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                      <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(u)}><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No units found</td></tr>}
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
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Unit' : 'Add Unit'}</div>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Unit Name</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                      <option value="headquarters">Headquarters</option>
                      <option value="region">Region</option>
                      <option value="depot">Depot</option>
                      <option value="branch">Branch</option>
                      <option value="team">Team</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Code</label>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. HQ-001" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Parent Unit</label>
                    <select value={String(form.parentId)} onChange={e => setForm({ ...form, parentId: e.target.value })} style={inputStyle}>
                      <option value="none">None (Root)</option>
                      {units.filter(u => !editItem || u.id !== editItem.id).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Location</label>
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
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
