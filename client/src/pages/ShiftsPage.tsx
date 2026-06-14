import { useState, useEffect } from 'react';
import { shiftService, type DriverShift } from '../services/shiftService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const typeColors: Record<string, string> = { morning: '#f59e0b', afternoon: '#3b82f6', night: '#8b5cf6', full_day: '#22c55e', custom: '#64748b' };
const statusColors: Record<string, string> = { scheduled: '#3b82f6', checked_in: '#22c55e', checked_out: '#5c6f8a', absent: '#ef4444', swapped: '#f59e0b' };

const demoShifts: DriverShift[] = [
  { id: 1, driverId: 3, date: '2025-06-10', startTime: '2025-06-10T06:00:00', endTime: '2025-06-10T14:00:00', type: 'morning', status: 'checked_in', swappedWithDriverId: null, notes: null, createdAt: '', updatedAt: '' },
  { id: 2, driverId: 5, date: '2025-06-10', startTime: '2025-06-10T14:00:00', endTime: '2025-06-10T22:00:00', type: 'afternoon', status: 'scheduled', swappedWithDriverId: null, notes: 'Covering for Kofi', createdAt: '', updatedAt: '' },
  { id: 3, driverId: 2, date: '2025-06-10', startTime: '2025-06-10T22:00:00', endTime: '2025-06-11T06:00:00', type: 'night', status: 'scheduled', swappedWithDriverId: null, notes: null, createdAt: '', updatedAt: '' },
  { id: 4, driverId: 7, date: '2025-06-10', startTime: '2025-06-10T06:00:00', endTime: '2025-06-10T18:00:00', type: 'full_day', status: 'checked_in', swappedWithDriverId: null, notes: 'Double shift', createdAt: '', updatedAt: '' },
  { id: 5, driverId: 4, date: '2025-06-10', startTime: '2025-06-10T08:00:00', endTime: '2025-06-10T12:00:00', type: 'custom', status: 'checked_out', swappedWithDriverId: null, notes: 'Half-day', createdAt: '', updatedAt: '' },
  { id: 6, driverId: 6, date: '2025-06-11', startTime: '2025-06-11T06:00:00', endTime: '2025-06-11T14:00:00', type: 'morning', status: 'scheduled', swappedWithDriverId: null, notes: null, createdAt: '', updatedAt: '' },
  { id: 7, driverId: 3, date: '2025-06-11', startTime: '2025-06-11T06:00:00', endTime: '2025-06-11T14:00:00', type: 'morning', status: 'swapped', swappedWithDriverId: 8, notes: 'Swapped with Driver 8', createdAt: '', updatedAt: '' },
  { id: 8, driverId: 5, date: '2025-06-11', startTime: '2025-06-11T14:00:00', endTime: '2025-06-11T22:00:00', type: 'afternoon', status: 'absent', swappedWithDriverId: null, notes: 'No-show', createdAt: '', updatedAt: '' },
  { id: 9, driverId: 2, date: '2025-06-11', startTime: '2025-06-11T06:00:00', endTime: '2025-06-11T18:00:00', type: 'full_day', status: 'scheduled', swappedWithDriverId: null, notes: 'Weekend prep', createdAt: '', updatedAt: '' },
  { id: 10, driverId: 7, date: '2025-06-12', startTime: '2025-06-12T06:00:00', endTime: '2025-06-12T14:00:00', type: 'morning', status: 'scheduled', swappedWithDriverId: null, notes: null, createdAt: '', updatedAt: '' },
  { id: 11, driverId: 4, date: '2025-06-12', startTime: '2025-06-12T14:00:00', endTime: '2025-06-12T22:00:00', type: 'afternoon', status: 'scheduled', swappedWithDriverId: null, notes: null, createdAt: '', updatedAt: '' },
  { id: 12, driverId: 6, date: '2025-06-12', startTime: '2025-06-12T22:00:00', endTime: '2025-06-13T06:00:00', type: 'night', status: 'scheduled', swappedWithDriverId: null, notes: 'Night watch', createdAt: '', updatedAt: '' },
  { id: 13, driverId: 8, date: '2025-06-10', startTime: '2025-06-10T06:00:00', endTime: '2025-06-10T14:00:00', type: 'morning', status: 'checked_in', swappedWithDriverId: null, notes: 'New driver induction', createdAt: '', updatedAt: '' },
];

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<DriverShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ driverId: 0, date: '', startTime: '', endTime: '', type: 'morning' as DriverShift['type'], notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await shiftService.getAll(); setShifts(d.length ? d : demoShifts); }
    catch { setShifts(demoShifts); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ driverId: 0, date: '', startTime: '', endTime: '', type: 'morning', notes: '' });
    setFormError(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      await shiftService.create(form);
      await load(); setShowModal(false);
    } catch (err: any) { setFormError(err.response?.data?.message || err.message || 'Failed to save shift'); }
    finally { setFormLoading(false); }
  };

  const handleSwap = async (shift: DriverShift) => {
    const target = prompt(`Enter target Driver ID to swap shift #${shift.id} with:`);
    if (!target || !target.trim()) return;
    const targetId = parseInt(target, 10);
    if (isNaN(targetId)) return alert('Invalid driver ID');
    setSwapLoading(true);
    try { await shiftService.swap(shift.id, targetId); await load(); }
    catch (err: any) { alert(err.message || 'Swap failed'); }
    finally { setSwapLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this shift?')) return;
    try { await shiftService.delete(id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const badge = (label: string, color: string) => (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
  );

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toISOString().slice(0, 10);

  const filtered = shifts.filter(s => {
    if (dateFilter && s.date !== dateFilter) return false;
    if (search) {
      const txt = `#${s.driverId} ${s.type} ${s.notes || ''} ${s.swappedWithDriverId || ''}`.toLowerCase();
      if (!txt.includes(search.toLowerCase())) return false;
    }
    return true;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Driver Shifts</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Schedule shifts, manage swap requests, and track attendance</div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
          <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Scheduled', value: shifts.length, color: '#3b82f6', icon: 'ti-calendar' },
          { label: 'Checked In Today', value: shifts.filter(s => s.date === today && s.status !== 'absent' && s.status !== 'scheduled').length, color: '#22c55e', icon: 'ti-login' },
          { label: 'Absent', value: shifts.filter(s => s.status === 'absent').length, color: '#ef4444', icon: 'ti-user-x' },
          { label: 'Swaps', value: shifts.filter(s => s.status === 'swapped').length, color: '#f59e0b', icon: 'ti-arrows-exchange' },
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
            <input placeholder="Search shifts..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
          </div>
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 150, cursor: 'pointer' }} />
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Shift</button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Date</th>
                <th style={hdrStyle}>Driver ID</th>
                <th style={hdrStyle}>Shift Type</th>
                <th style={hdrStyle}>Start</th>
                <th style={hdrStyle}>End</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Swapped With</th>
                <th style={hdrStyle}>Notes</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(s => (
                <tr key={s.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={cellStyle}>{new Date(s.date).toLocaleDateString()}</td>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace" }}>#{s.driverId}</td>
                  <td style={cellStyle}>{badge(s.type.replace('_', ' '), typeColors[s.type] || '#64748b')}</td>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{formatTime(s.startTime)}</td>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.endTime ? formatTime(s.endTime) : '-'}</td>
                  <td style={cellStyle}>{badge(s.status.replace('_', ' '), statusColors[s.status] || '#5c6f8a')}</td>
                  <td style={cellStyle}>{s.swappedWithDriverId ? `#${s.swappedWithDriverId}` : '-'}</td>
                  <td style={{ ...cellStyle, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)' }}>{s.notes || '-'}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      {s.status !== 'swapped' && (
                        <button style={{ ...btn, padding: '5px 10px', color: '#f59e0b' }} onClick={() => handleSwap(s)} title="Swap" disabled={swapLoading}>
                          <i className="las la-exchange-alt" style={{ fontSize: 14 }}></i>
                        </button>
                      )}
                      <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(s.id)} title="Delete">
                        <i className="las la-trash-alt" style={{ fontSize: 14 }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No shifts found</td></tr>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Add Shift</div>
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
                    <label style={labelStyle}>Driver ID</label>
                    <input type="number" required value={form.driverId || ''} onChange={e => setForm({ ...form, driverId: Number(e.target.value) })} placeholder="e.g. 3" min={1} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time</label>
                    <input required type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Time</label>
                    <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Shift Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as DriverShift['type'] })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="full_day">Full Day</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Notes (optional)</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  Add Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
