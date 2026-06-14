import { useState, useEffect } from 'react';
import { bookingService, type VehicleBooking } from '../services/bookingService';
import type { Vehicle } from '../types';
import { vehicleService } from '../services/vehicleService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const statusColors: Record<string, string> = { pending: '#f59e0b', approved: '#3b82f6', in_progress: '#22c55e', completed: '#5c6f8a', cancelled: '#ef4444' };

const demoVehicles: Vehicle[] = [
  { id: 81, plateNumber: 'GT-8121-21', brand: 'Toyota', model: 'Hiace', year: 2020, esp32DeviceId: 'ESP-081', isActive: true, createdAt: '', updatedAt: '' },
  { id: 82, plateNumber: 'GT-8122-21', brand: 'Nissan', model: 'Urvan', year: 2021, esp32DeviceId: 'ESP-082', isActive: true, createdAt: '', updatedAt: '' },
  { id: 83, plateNumber: 'GT-8123-21', brand: 'Mercedes', model: 'Sprinter', year: 2022, esp32DeviceId: 'ESP-083', isActive: true, createdAt: '', updatedAt: '' },
  { id: 84, plateNumber: 'GT-8124-21', brand: 'Ford', model: 'Transit', year: 2019, esp32DeviceId: 'ESP-084', isActive: true, createdAt: '', updatedAt: '' },
  { id: 85, plateNumber: 'GT-8125-21', brand: 'Isuzu', model: 'N-Series', year: 2023, esp32DeviceId: 'ESP-085', isActive: true, createdAt: '', updatedAt: '' },
];

const demoBookings: VehicleBooking[] = [
  { id: 1, vehicleId: 81, driverId: 3, bookedById: 1, purpose: 'School run - morning shift', startTime: '2025-06-10T06:00:00', endTime: '2025-06-10T08:00:00', status: 'approved', notes: 'Regular route', createdAt: '', updatedAt: '' },
  { id: 2, vehicleId: 82, driverId: 5, bookedById: 1, purpose: 'Staff pickup - airport', startTime: '2025-06-10T09:00:00', endTime: '2025-06-10T11:30:00', status: 'in_progress', notes: 'VIP guests', createdAt: '', updatedAt: '' },
  { id: 3, vehicleId: 83, driverId: 2, bookedById: 1, purpose: 'Field inspection tour', startTime: '2025-06-11T07:00:00', endTime: '2025-06-11T16:00:00', status: 'pending', notes: 'Full day', createdAt: '', updatedAt: '' },
  { id: 4, vehicleId: 84, driverId: 7, bookedById: 1, purpose: 'Equipment delivery', startTime: '2025-06-10T10:00:00', endTime: '2025-06-10T12:00:00', status: 'completed', notes: 'Delivered', createdAt: '', updatedAt: '' },
  { id: 5, vehicleId: 85, driverId: 4, bookedById: 1, purpose: 'Maintenance run', startTime: '2025-06-12T08:00:00', endTime: '2025-06-12T10:00:00', status: 'cancelled', notes: 'Rescheduled', createdAt: '', updatedAt: '' },
  { id: 6, vehicleId: 81, driverId: 6, bookedById: 1, purpose: 'Evening courier service', startTime: '2025-06-10T17:00:00', endTime: '2025-06-10T19:00:00', status: 'approved', notes: null, createdAt: '', updatedAt: '' },
  { id: 7, vehicleId: 82, driverId: 3, bookedById: 1, purpose: 'Inter-branch transfer', startTime: '2025-06-11T11:00:00', endTime: '2025-06-11T13:00:00', status: 'pending', notes: 'Documents only', createdAt: '', updatedAt: '' },
  { id: 8, vehicleId: 83, driverId: 5, bookedById: 1, purpose: 'Client site visit', startTime: '2025-06-12T09:00:00', endTime: '2025-06-12T12:00:00', status: 'approved', notes: '', createdAt: '', updatedAt: '' },
  { id: 9, vehicleId: 84, driverId: 2, bookedById: 1, purpose: 'Fuel replenishment run', startTime: '2025-06-10T13:00:00', endTime: '2025-06-10T15:00:00', status: 'in_progress', notes: 'Station visit', createdAt: '', updatedAt: '' },
  { id: 10, vehicleId: 85, driverId: 7, bookedById: 1, purpose: 'Weekend community event', startTime: '2025-06-14T08:00:00', endTime: '2025-06-14T18:00:00', status: 'pending', notes: 'Outreach program', createdAt: '', updatedAt: '' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<VehicleBooking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vehicleId: 0, driverId: 0, purpose: '', startTime: '', endTime: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { loadVehicles(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await bookingService.getAll(); setBookings(d.length ? d : demoBookings); }
    catch { setBookings(demoBookings); }
    finally { setLoading(false); }
  };

  const loadVehicles = async () => {
    try { const d = await vehicleService.getAll(); setVehicles(d.length ? d : demoVehicles); }
    catch { setVehicles(demoVehicles); }
  };

  const openAdd = () => { setForm({ vehicleId: vehicles[0]?.id || 81, driverId: 0, purpose: '', startTime: '', endTime: '', notes: '' }); setFormError(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      await bookingService.create(form);
      await load(); setShowModal(false);
    } catch (err: any) { setFormError(err.response?.data?.message || err.message || 'Failed to save booking'); }
    finally { setFormLoading(false); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try { await bookingService.updateStatus(id, status); await load(); }
    catch (err: any) { setError(err.message || 'Status update failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this booking?')) return;
    try { await bookingService.delete(id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const badge = (label: string, color: string) => (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString();
  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toISOString().slice(0, 10);

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (dateFilter && !b.startTime.startsWith(dateFilter)) return false;
    if (search) {
      const v = vehicles.find(v => v.id === b.vehicleId);
      const txt = `${v?.plateNumber || ''} ${v?.brand || ''} ${b.purpose} ${b.notes || ''}`.toLowerCase();
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
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Vehicle Bookings</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Reserve vehicles, check availability, and manage schedules</div>
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
          { label: 'Total Bookings', value: bookings.length, color: '#3b82f6', icon: 'ti-calendar' },
          { label: 'Active / In Progress', value: bookings.filter(b => b.status === 'in_progress').length, color: '#22c55e', icon: 'ti-player-play' },
          { label: 'Pending Approval', value: bookings.filter(b => b.status === 'pending').length, color: '#f59e0b', icon: 'ti-clock' },
          { label: "Today's Bookings", value: bookings.filter(b => b.startTime.startsWith(today)).length, color: '#8b5cf6', icon: 'ti-calendar-event' },
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
            <input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 140, cursor: 'pointer' }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 150, cursor: 'pointer' }} />
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> New Booking</button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Vehicle</th>
                <th style={hdrStyle}>Driver</th>
                <th style={hdrStyle}>Purpose</th>
                <th style={hdrStyle}>Start Time</th>
                <th style={hdrStyle}>End Time</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Notes</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(b => {
                const v = vehicles.find(v => v.id === b.vehicleId);
                return (
                  <tr key={b.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 600 }}>{v?.plateNumber || `#${b.vehicleId}`}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{v?.brand} {v?.model}</div>
                    </td>
                    <td style={cellStyle}>
                      <span>#{b.driverId}</span>
                    </td>
                    <td style={{ ...cellStyle, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.purpose}</td>
                    <td style={cellStyle}>
                      <div style={{ fontSize: 12 }}>{formatDate(b.startTime)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(b.startTime)}</div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ fontSize: 12 }}>{formatDate(b.endTime)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(b.endTime)}</div>
                    </td>
                    <td style={cellStyle}>{badge(b.status.replace('_', ' '), statusColors[b.status] || '#5c6f8a')}</td>
                    <td style={{ ...cellStyle, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)' }}>{b.notes || '-'}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        {b.status === 'pending' && (
                          <button style={{ ...btn, padding: '5px 10px', color: '#3b82f6' }} onClick={() => handleStatusUpdate(b.id, 'approved')} title="Approve">
                            <i className="las la-check" style={{ fontSize: 14 }}></i>
                          </button>
                        )}
                        {b.status === 'approved' && (
                          <button style={{ ...btn, padding: '5px 10px', color: '#22c55e' }} onClick={() => handleStatusUpdate(b.id, 'in_progress')} title="Start">
                            <i className="las la-play-circle" style={{ fontSize: 14 }}></i>
                          </button>
                        )}
                        {b.status === 'in_progress' && (
                          <button style={{ ...btn, padding: '5px 10px', color: '#5c6f8a' }} onClick={() => handleStatusUpdate(b.id, 'completed')} title="Complete">
                            <i className="las la-checkbox" style={{ fontSize: 14 }}></i>
                          </button>
                        )}
                        {(b.status === 'pending' || b.status === 'approved') && (
                          <button style={{ ...btn, padding: '5px 10px', color: '#ef4444' }} onClick={() => handleStatusUpdate(b.id, 'cancelled')} title="Cancel">
                            <i className="las la-times" style={{ fontSize: 14 }}></i>
                          </button>
                        )}
                        <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(b.id)} title="Delete">
                          <i className="las la-trash-alt" style={{ fontSize: 14 }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No bookings found</td></tr>
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
                <div style={{ fontSize: 16, fontWeight: 700 }}>New Booking</div>
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
                    <label style={labelStyle}>Vehicle</label>
                    <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: Number(e.target.value) })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value={0}>Select vehicle</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Driver ID</label>
                    <input type="number" value={form.driverId || ''} onChange={e => setForm({ ...form, driverId: Number(e.target.value) })} placeholder="e.g. 3" min={1} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Purpose</label>
                    <input required value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Reason for booking" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time</label>
                    <input required type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Time</label>
                    <input required type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={inputStyle} />
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
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
