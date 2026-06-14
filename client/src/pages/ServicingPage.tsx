import { useState, useEffect } from 'react';
import type { MaintenanceRecord, Vehicle } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedDetailModal } from '../components/layout/AnimatedDetailModal';

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

const TYPE_OPTIONS = [
  { value: 'oil_change', label: 'Oil Change', icon: 'ti-droplet' },
  { value: 'tire', label: 'Tire', icon: 'ti-disc' },
  { value: 'brake', label: 'Brake', icon: 'ti-tool' },
  { value: 'service', label: 'Service', icon: 'ti-wrench' },
  { value: 'inspection', label: 'Inspection', icon: 'ti-clipboard' },
  { value: 'fuel', label: 'Fuel System', icon: 'ti-gas-station' },
  { value: 'other', label: 'Other', icon: 'ti-settings' },
];

const SERVICE_COLORS: Record<string, string> = {
  oil_change: '#3b82f6',
  tire: '#22c55e',
  brake: '#ef4444',
  service: '#f59e0b',
  inspection: '#8b5cf6',
  fuel: '#06b6d4',
  other: '#64748b',
};

const DEMO_VEHICLES: Vehicle[] = [
  { id: 81, plateNumber: 'GT-1000-20', brand: 'Toyota', model: 'Hilux', year: 2023, esp32DeviceId: 'ESP32_GH_0001', isActive: true, photo: '', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 82, plateNumber: 'GT-1001-20', brand: 'Nissan', model: 'Navara', year: 2023, esp32DeviceId: 'ESP32_GH_0002', isActive: true, photo: '', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 83, plateNumber: 'GT-1002-20', brand: 'Hyundai', model: 'Tucson', year: 2024, esp32DeviceId: 'ESP32_GH_0003', isActive: true, photo: '', createdAt: '2025-03-10T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 84, plateNumber: 'GT-1003-20', brand: 'Kia', model: 'Sorento', year: 2023, esp32DeviceId: 'ESP32_GH_0004', isActive: true, photo: '', createdAt: '2025-01-20T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 85, plateNumber: 'GT-1004-20', brand: 'Mercedes', model: 'Sprinter', year: 2024, esp32DeviceId: 'ESP32_GH_0005', isActive: true, photo: '', createdAt: '2025-04-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
];

const DEMO_RECORDS: MaintenanceRecord[] = [
  { id: 1, vehicleId: 81, type: 'oil_change', description: 'Full synthetic oil change & filter', cost: 450, odometer: 15000, performedAt: '2026-05-20T00:00:00Z', nextDueDate: '2026-08-20T00:00:00Z', nextDueOdometer: 20000, performedBy: 'Kwame Auto Care', notes: 'Used 5W-30', createdAt: '', updatedAt: '' },
  { id: 2, vehicleId: 81, type: 'tire', description: 'Replaced 2 front tires', cost: 3200, odometer: 14800, performedAt: '2026-05-10T00:00:00Z', nextDueDate: null, nextDueOdometer: null, performedBy: 'Michelin Center', notes: '', createdAt: '', updatedAt: '' },
  { id: 3, vehicleId: 82, type: 'brake', description: 'Brake pad replacement all 4 wheels', cost: 1800, odometer: 22000, performedAt: '2026-04-15T00:00:00Z', nextDueDate: '2026-07-01T00:00:00Z', nextDueOdometer: 30000, performedBy: 'Servicio Central', notes: 'Ceramic pads', createdAt: '', updatedAt: '' },
  { id: 4, vehicleId: 82, type: 'inspection', description: 'Annual roadworthiness inspection', cost: 350, odometer: 21800, performedAt: '2026-03-01T00:00:00Z', nextDueDate: '2027-03-01T00:00:00Z', nextDueOdometer: null, performedBy: 'DVLA', notes: 'Passed', createdAt: '', updatedAt: '' },
  { id: 5, vehicleId: 83, type: 'service', description: '60,000 km major service', cost: 5200, odometer: 60000, performedAt: '2026-06-01T00:00:00Z', nextDueDate: '2026-12-01T00:00:00Z', nextDueOdometer: 70000, performedBy: 'Hyundai Dealer', notes: 'Timing belt replaced', createdAt: '', updatedAt: '' },
  { id: 6, vehicleId: 83, type: 'fuel', description: 'Fuel injector cleaning & flush', cost: 900, odometer: 58500, performedAt: '2026-04-20T00:00:00Z', nextDueDate: null, nextDueOdometer: null, performedBy: 'Quick Lube', notes: '', createdAt: '', updatedAt: '' },
  { id: 7, vehicleId: 84, type: 'oil_change', description: 'Regular oil change', cost: 380, odometer: 32000, performedAt: '2026-05-28T00:00:00Z', nextDueDate: '2026-07-15T00:00:00Z', nextDueOdometer: 37000, performedBy: 'Kwame Auto Care', notes: '', createdAt: '', updatedAt: '' },
  { id: 8, vehicleId: 84, type: 'other', description: 'AC compressor replacement', cost: 4100, odometer: 31000, performedAt: '2026-02-10T00:00:00Z', nextDueDate: null, nextDueOdometer: null, performedBy: 'Cool Tech Garage', notes: 'Warranty claim', createdAt: '', updatedAt: '' },
  { id: 9, vehicleId: 85, type: 'service', description: 'Pre-trip inspection & fluid top-up', cost: 250, odometer: 89000, performedAt: '2026-06-05T00:00:00Z', nextDueDate: '2026-07-05T00:00:00Z', nextDueOdometer: 91000, performedBy: 'Driver self-service', notes: '', createdAt: '', updatedAt: '' },
  { id: 10, vehicleId: 85, type: 'brake', description: 'Rear drum brake service', cost: 2100, odometer: 87500, performedAt: '2026-03-22T00:00:00Z', nextDueDate: null, nextDueOdometer: null, performedBy: 'Servicio Central', notes: 'Drum resurfaced', createdAt: '', updatedAt: '' },
];

export default function ServicingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editRec, setEditRec] = useState<MaintenanceRecord | null>(null);
  const [form, setForm] = useState({
    vehicleId: '', type: 'service', description: '', cost: '', odometer: '',
    performedAt: new Date().toISOString().split('T')[0],
    nextDueDate: '', nextDueOdometer: '', performedBy: '', notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [detailService, setDetailService] = useState<MaintenanceRecord | null>(null);

  useEffect(() => { load(); loadVehicles(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/maintenance${params}`);
      setRecords(res.data.data || []);
    } catch { setRecords(DEMO_RECORDS); }
    finally { setLoading(false); }
  };

  const loadVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch { setVehicles(DEMO_VEHICLES); }
  };

  const openAdd = () => {
    setEditRec(null);
    setForm({ vehicleId: '', type: 'service', description: '', cost: '', odometer: '',
      performedAt: new Date().toISOString().split('T')[0],
      nextDueDate: '', nextDueOdometer: '', performedBy: '', notes: '' });
    setFormError(null); setShowModal(true);
  };

  const openEdit = (r: MaintenanceRecord) => {
    setEditRec(r);
    setForm({
      vehicleId: String(r.vehicleId), type: r.type, description: r.description,
      cost: String(r.cost), odometer: String(r.odometer),
      performedAt: r.performedAt.split('T')[0],
      nextDueDate: r.nextDueDate ? r.nextDueDate.split('T')[0] : '',
      nextDueOdometer: r.nextDueOdometer ? String(r.nextDueOdometer) : '',
      performedBy: r.performedBy || '', notes: r.notes || '',
    });
    setFormError(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const body = {
        ...form,
        vehicleId: parseInt(form.vehicleId),
        cost: parseFloat(form.cost) || 0,
        odometer: parseInt(form.odometer) || 0,
        nextDueOdometer: parseInt(form.nextDueOdometer) || null,
        nextDueDate: form.nextDueDate || null,
      };
      if (editRec) {
        await api.put(`/maintenance/${editRec.id}`, body);
      } else {
        await api.post('/maintenance', body);
      }
      await load(); setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this maintenance record?')) return;
    try {
      await api.delete(`/maintenance/${id}`);
      await load();
    } catch (err: any) { alert(err.message); }
  };

  const getVehicleLabel = (id: number) => {
    const v = vehicles.find(x => x.id === id);
    return v ? `${v.plateNumber} - ${v.brand} ${v.model}` : `Vehicle #${id}`;
  };

  const isOverdue = (r: MaintenanceRecord) => r.nextDueDate && new Date(r.nextDueDate) < new Date();
  const isUpcoming = (r: MaintenanceRecord) => r.nextDueDate && !isOverdue(r) &&
    new Date(r.nextDueDate) < new Date(Date.now() + 30 * 86400000);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const getStatusBadge = (r: MaintenanceRecord) => {
    if (isOverdue(r)) return { label: 'Overdue', color: '#ef4444' };
    if (isUpcoming(r)) return { label: 'Due Soon', color: '#f59e0b' };
    if (r.nextDueDate) return { label: 'Scheduled', color: '#22c55e' };
    return null;
  };

  const pageStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 20,
  };

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Servicing & Maintenance</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Track vehicle service history, schedule maintenance, and manage documents</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} style={btnPrimary}>
            <i className="las la-plus" style={{ fontSize: 15 }}></i> Add Record
          </button>
        )}
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{records.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Total Records</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{records.filter(r => isUpcoming(r)).length}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Due Soon</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{records.filter(r => isOverdue(r)).length}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Overdue</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>GHS {records.reduce((s, r) => s + Number(r.cost), 0).toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Total Cost</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'upcoming', label: 'Due Soon' },
        ].map(t => (
          <button key={t.id} onClick={() => { setFilter(t.id); }} style={{
            ...btn, background: filter === t.id ? 'var(--accent)' : 'var(--bg3)',
            color: filter === t.id ? '#00221c' : 'var(--text2)',
            borderColor: filter === t.id ? 'var(--accent)' : 'var(--border2)',
            fontWeight: filter === t.id ? 600 : 500,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Vehicle</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Description</th>
                <th style={hdrStyle}>Date</th>
                <th style={hdrStyle}>Odometer</th>
                <th style={hdrStyle}>Cost</th>
                <th style={hdrStyle}>Next Due</th>
                <th style={hdrStyle}>Status</th>
                {isAdmin && <th style={hdrStyle}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={isAdmin ? 9 : 8} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No maintenance records found</td></tr>
              ) : records.map(r => {
                const badge = getStatusBadge(r);
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setDetailService(r)}>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {r.vehicle?.photo && <img src={r.vehicle.photo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />}
                        <span>{getVehicleLabel(r.vehicleId)}</span>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: `${SERVICE_COLORS[r.type]}18`, color: SERVICE_COLORS[r.type] }}>
                        <i className={`ti ${TYPE_OPTIONS.find(t => t.value === r.type)?.icon || 'ti-tool'}`} style={{ fontSize: 12 }}></i>
                        {TYPE_OPTIONS.find(t => t.value === r.type)?.label || r.type}
                      </span>
                    </td>
                    <td style={cellStyle}>{r.description}</td>
                    <td style={cellStyle}>{new Date(r.performedAt).toLocaleDateString()}</td>
                    <td style={cellStyle}>{r.odometer?.toLocaleString()} km</td>
                    <td style={cellStyle}>GHS {Number(r.cost).toLocaleString()}</td>
                    <td style={cellStyle}>{r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString() : '-'}</td>
                    <td style={cellStyle}>
                      {badge ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${badge.color}18`, color: badge.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.color }} />
                          {badge.label}
                        </span>
                      ) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>-</span>}
                    </td>
                    {isAdmin && (
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => openEdit(r)} style={{ ...btn, padding: '4px 8px', fontSize: 12 }}>
                            <i className="las la-edit" style={{ fontSize: 13 }}></i>
                          </button>
                          <button onClick={() => handleDelete(r.id)} style={{ ...btn, padding: '4px 8px', fontSize: 12, color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <i className="las la-trash-alt" style={{ fontSize: 13 }}></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '90%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{editRec ? 'Edit' : 'Add'} Maintenance Record</h2>
              <button onClick={() => setShowModal(false)} style={{ ...btn, padding: '6px 10px', border: 'none', fontSize: 16 }}><i className="las la-times"></i></button>
            </div>
            {formError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>{formError}</div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Vehicle *</label>
                <select value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} required style={inputStyle}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inputStyle}>
                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cost (GHS)</label>
                  <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={form.performedAt} onChange={e => setForm({...form, performedAt: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Odometer (km)</label>
                  <input type="number" value={form.odometer} onChange={e => setForm({...form, odometer: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Performed By</label>
                  <input type="text" value={form.performedBy} onChange={e => setForm({...form, performedBy: e.target.value})} style={inputStyle} placeholder="Mechanic name" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Next Due Date</label>
                  <input type="date" value={form.nextDueDate} onChange={e => setForm({...form, nextDueDate: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Next Due Odometer (km)</label>
                  <input type="number" value={form.nextDueOdometer} onChange={e => setForm({...form, nextDueOdometer: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={btn}>Cancel</button>
                <button type="submit" disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? 'Saving...' : editRec ? 'Update' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AnimatedDetailModal
        open={!!detailService}
        onClose={() => setDetailService(null)}
        title={detailService ? `${TYPE_OPTIONS.find(t => t.value === detailService.type)?.label || detailService.type}` : ''}
        subtitle={detailService ? `Record #${detailService.id}` : undefined}
        icon="wrench"
        iconBg="rgba(245,158,11,0.12)"
        iconColor="#f59e0b"
        accent="#f59e0b"
        sections={
          detailService ? [
            { title: 'Service Details', icon: 'wrench', iconColor: '#f59e0b', fields: [
              { label: 'Type', value: TYPE_OPTIONS.find(t => t.value === detailService.type)?.label || detailService.type, icon: 'tag' },
              { label: 'Vehicle', value: detailService.vehicleId ? `#${detailService.vehicleId}` : 'Unknown', icon: 'car' },
              { label: 'Description', value: detailService.description, icon: 'file-text' },
              { label: 'Performed By', value: detailService.performedBy || 'Unknown', icon: 'user' },
            ]},
            { title: 'Cost & Mileage', icon: 'receipt', iconColor: '#22c55e', fields: [
              { label: 'Cost', value: `GHS ${detailService.cost.toLocaleString()}`, icon: 'currency-dollar', color: '#22c55e', mono: true },
              { label: 'Odometer', value: `${detailService.odometer?.toLocaleString() || 'â€”'} km`, icon: 'speedometer', mono: true },
            ]},
            { title: 'Schedule', icon: 'calendar', iconColor: '#3b82f6', fields: [
              { label: 'Performed At', value: detailService.performedAt ? new Date(detailService.performedAt).toLocaleDateString('en-GB') : 'Unknown', icon: 'calendar-check' },
              { label: 'Next Due', value: detailService.nextDueDate ? new Date(detailService.nextDueDate).toLocaleDateString('en-GB') : 'Not scheduled', icon: 'calendar-event', color: detailService.nextDueDate && new Date(detailService.nextDueDate) < new Date(Date.now() + 14*86400000) ? '#ef4444' : undefined },
              { label: 'Next Due Odometer', value: detailService.nextDueOdometer ? `${detailService.nextDueOdometer.toLocaleString()} km` : 'Not set', icon: 'speedometer' },
              { label: 'Notes', value: detailService.notes || 'None', icon: 'note' },
            ]},
          ] : []
        }
      />
    </div>
  );
}

const hdrStyle: React.CSSProperties = { padding: '10px 14px', fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)', textAlign: 'left' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
