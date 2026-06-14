import { useState, useEffect } from 'react';
import { AnimatedDetailModal } from '../components/layout/AnimatedDetailModal';
import { expenseService, type Expense } from '../services/expenseService';
import { vehicleService } from '../services/vehicleService';
import type { Vehicle } from '../types';

interface FuelRecord {
  id: number; vehicleId: number; driverId: number | null;
  litres: number; costPerLitre: number; totalCost: number; odometer: number;
  fuelType: string; station: string; notes: string;
  filledAt: string; createdAt: string; updatedAt: string;
  category: string; amount: number; description: string;
  receiptUrl: string | null; approvedById: number | null;
}

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
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const DRIVER_NAMES: Record<number, string> = {
  1: 'Kwame Asante', 2: 'Abena Osei', 3: 'Yaw Mensah',
  4: 'Afia Owusu', 5: 'Kofi Boateng', 6: 'Esi Quansah',
};

const FUEL_TYPES = ['petrol', 'diesel', 'lpg', 'electric'];

const DEMO_VEHICLES: Vehicle[] = [
  { id: 81, plateNumber: 'GT-1000-20', brand: 'Toyota', model: 'Hilux', year: 2023, esp32DeviceId: 'ESP32_GH_0001', isActive: true, photo: '', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 82, plateNumber: 'GT-1001-20', brand: 'Nissan', model: 'Navara', year: 2023, esp32DeviceId: 'ESP32_GH_0002', isActive: true, photo: '', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 83, plateNumber: 'GT-1002-20', brand: 'Hyundai', model: 'Tucson', year: 2024, esp32DeviceId: 'ESP32_GH_0003', isActive: true, photo: '', createdAt: '2025-03-10T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 84, plateNumber: 'GT-1003-20', brand: 'Kia', model: 'Sorento', year: 2023, esp32DeviceId: 'ESP32_GH_0004', isActive: true, photo: '', createdAt: '2025-01-20T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 85, plateNumber: 'GT-1004-20', brand: 'Mercedes', model: 'Sprinter', year: 2024, esp32DeviceId: 'ESP32_GH_0005', isActive: true, photo: '', createdAt: '2025-04-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
];

const DEMO_RECORDS: FuelRecord[] = [
  { id: 1, vehicleId: 81, driverId: 1, litres: 45, costPerLitre: 13.5, totalCost: 607.5, odometer: 45210, fuelType: 'diesel', station: 'GOIL Tema', notes: '', filledAt: '2026-06-12T08:15:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 607.5, description: 'Full tank refuel', receiptUrl: null, approvedById: null },
  { id: 2, vehicleId: 82, driverId: 2, litres: 32, costPerLitre: 14.2, totalCost: 454.4, odometer: 32150, fuelType: 'petrol', station: 'Shell Spintex', notes: 'Half fill', filledAt: '2026-06-12T10:30:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 454.4, description: 'Partial refuel', receiptUrl: null, approvedById: null },
  { id: 3, vehicleId: 83, driverId: 3, litres: 60, costPerLitre: 13.0, totalCost: 780, odometer: 58420, fuelType: 'diesel', station: 'Total Madina', notes: 'Awaiting approval', filledAt: '2026-06-11T14:45:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 780, description: 'Full tank before trip', receiptUrl: null, approvedById: null },
  { id: 4, vehicleId: 84, driverId: 4, litres: 28, costPerLitre: 14.5, totalCost: 406, odometer: 28640, fuelType: 'petrol', station: 'StarOil Accra', notes: 'Mismatch flagged', filledAt: '2026-06-11T09:00:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 406, description: 'Emergency top-up', receiptUrl: null, approvedById: null },
  { id: 5, vehicleId: 85, driverId: 5, litres: 55, costPerLitre: 12.8, totalCost: 704, odometer: 67890, fuelType: 'diesel', station: 'PetroGhana Circle', notes: '', filledAt: '2026-06-10T16:20:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 704, description: 'Full tank refuel', receiptUrl: null, approvedById: null },
  { id: 6, vehicleId: 81, driverId: 6, litres: 20, costPerLitre: 13.5, totalCost: 270, odometer: 45500, fuelType: 'diesel', station: 'GOIL Tema', notes: 'Emergency top-up', filledAt: '2026-06-10T07:00:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 270, description: 'Small top-up', receiptUrl: null, approvedById: null },
  { id: 7, vehicleId: 82, driverId: 1, litres: 38, costPerLitre: 14.0, totalCost: 532, odometer: 32480, fuelType: 'petrol', station: 'Zen Kanda', notes: '', filledAt: '2026-06-09T11:30:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 532, description: 'Full tank refuel', receiptUrl: null, approvedById: null },
  { id: 8, vehicleId: 83, driverId: 2, litres: 70, costPerLitre: 13.2, totalCost: 924, odometer: 58760, fuelType: 'diesel', station: 'Puma Kaneshie', notes: 'Long haul refuel', filledAt: '2026-06-09T13:10:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 924, description: 'Full tank before long trip', receiptUrl: null, approvedById: null },
  { id: 9, vehicleId: 84, driverId: 3, litres: 25, costPerLitre: 15.0, totalCost: 375, odometer: 28910, fuelType: 'petrol', station: 'Shell Spintex', notes: 'Suspicious quantity', filledAt: '2026-06-08T08:45:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 375, description: 'Quick top-up', receiptUrl: null, approvedById: null },
  { id: 10, vehicleId: 85, driverId: 4, litres: 50, costPerLitre: 13.0, totalCost: 650, odometer: 68200, fuelType: 'diesel', station: 'Total Madina', notes: '', filledAt: '2026-06-08T15:30:00Z', createdAt: '', updatedAt: '', category: 'fuel', amount: 650, description: 'Full tank refuel', receiptUrl: null, approvedById: null },
];

export default function FuelPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editRec, setEditRec] = useState<FuelRecord | null>(null);
  const [form, setForm] = useState({
    vehicleId: '', driverId: '', litres: '', costPerLitre: '',
    totalCost: '', odometer: '', fuelType: 'diesel', station: '',
    notes: '', filledAt: new Date().toISOString().split('T')[0],
  });
  const [detailFuel, setDetailFuel] = useState<FuelRecord | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); loadVehicles(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null);
      const data = await expenseService.getAll({ category: 'fuel' });
      if (data.length) {
        setRecords(data.map(r => ({
          ...r, litres: (r as any).litres ?? 0, costPerLitre: (r as any).costPerLitre ?? 0,
          totalCost: (r as any).totalCost ?? r.amount, odometer: (r as any).odometer ?? 0,
          fuelType: (r as any).fuelType ?? 'diesel', station: (r as any).station ?? '',
          filledAt: r.expenseDate, driverId: r.driverId,
        } as FuelRecord)));
      } else { setRecords(DEMO_RECORDS); }
    } catch { setRecords(DEMO_RECORDS); }
    finally { setLoading(false); }
  };

  const loadVehicles = async () => {
    try { const data = await vehicleService.getAll(); setVehicles(data); }
    catch { setVehicles(DEMO_VEHICLES); }
  };

  const openAdd = () => {
    setEditRec(null);
    setForm({ vehicleId: '', driverId: '', litres: '', costPerLitre: '', totalCost: '', odometer: '', fuelType: 'diesel', station: '', notes: '', filledAt: new Date().toISOString().split('T')[0] });
    setFormError(null); setShowModal(true);
  };

  const openEdit = (r: FuelRecord) => {
    setEditRec(r);
    setForm({
      vehicleId: String(r.vehicleId), driverId: r.driverId ? String(r.driverId) : '',
      litres: String(r.litres), costPerLitre: String(r.costPerLitre),
      totalCost: String(r.totalCost), odometer: String(r.odometer),
      fuelType: r.fuelType, station: r.station, notes: r.notes || '',
      filledAt: r.filledAt.split('T')[0],
    });
    setFormError(null); setShowModal(true);
  };

  const calcTotal = () => (parseFloat(form.litres) || 0) * (parseFloat(form.costPerLitre) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const body = {
        category: 'fuel',
        amount: calcTotal(),
        description: `Fuel - ${form.fuelType} at ${form.station}`,
        expenseDate: form.filledAt,
        vehicleId: parseInt(form.vehicleId) || null,
        driverId: parseInt(form.driverId) || null,
        notes: form.notes || null,
        receiptUrl: null,
        litres: parseFloat(form.litres) || 0,
        costPerLitre: parseFloat(form.costPerLitre) || 0,
        totalCost: calcTotal(),
        odometer: parseInt(form.odometer) || 0,
        fuelType: form.fuelType,
        station: form.station,
      };
      if (editRec) {
        await expenseService.update(editRec.id, body as any);
      } else {
        await expenseService.create(body as any);
      }
      await load(); setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fuel record?')) return;
    try { await expenseService.delete(id); await load(); }
    catch (err: any) { alert(err.message); }
  };

  const getVehicleLabel = (id: number) => {
    const v = vehicles.find(x => x.id === id);
    return v ? `${v.plateNumber} - ${v.brand} ${v.model}` : `Vehicle #${id}`;
  };

  const driverName = (id: number | null) => id ? (DRIVER_NAMES[id] || `Driver #${id}`) : '-';

  const totalCost = records.reduce((s, r) => s + r.totalCost, 0);
  const totalLitres = records.reduce((s, r) => s + r.litres, 0);
  const avgCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getVehicleLabel(r.vehicleId).toLowerCase().includes(q) ||
      r.station.toLowerCase().includes(q) || r.fuelType.toLowerCase().includes(q);
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Fuel Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Track fuel consumption, log fill-ups, and monitor efficiency</p>
        </div>
        <button onClick={openAdd} style={btnPrimary}>
          <i className="las la-plus" style={{ fontSize: 15 }}></i> Add Fuel Entry
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>GHS {totalCost.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Total Fuel Cost</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{totalLitres.toLocaleString()} L</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Total Litres</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{records.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Total Records</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>GHS {avgCostPerLitre.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Avg Cost / Litre</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
          <input placeholder="Search vehicle, station..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 240 }} />
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Date</th>
                <th style={hdrStyle}>Vehicle</th>
                <th style={hdrStyle}>Driver</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Litres</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Cost/L</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Total Cost</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Odometer</th>
                <th style={hdrStyle}>Fuel Type</th>
                <th style={hdrStyle}>Station</th>
                <th style={hdrStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No fuel records found</td></tr>
              ) : paginated.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setDetailFuel(r)}>
                  <td style={{ ...cellStyle, whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(r.filledAt).toLocaleDateString()}</td>
                  <td style={cellStyle}>{getVehicleLabel(r.vehicleId)}</td>
                  <td style={cellStyle}>{driverName(r.driverId)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{r.litres} L</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>GHS {r.costPerLitre.toFixed(2)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>GHS {r.totalCost.toFixed(2)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.odometer.toLocaleString()} km</td>
                  <td style={cellStyle}>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: r.fuelType === 'diesel' ? 'rgba(59,130,246,0.12)' : r.fuelType === 'petrol' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)', color: r.fuelType === 'diesel' ? '#3b82f6' : r.fuelType === 'petrol' ? '#f59e0b' : '#8b5cf6' }}>
                      {r.fuelType}
                    </span>
                  </td>
                  <td style={cellStyle}>{r.station}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <i className="las la-chevron-left" style={{ fontSize: 14 }}></i>
            </button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 }} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}>
              <i className="las la-chevron-right" style={{ fontSize: 14 }}></i>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '90%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{editRec ? 'Edit' : 'Add'} Fuel Entry</h2>
              <button onClick={() => setShowModal(false)} style={{ ...btn, padding: '6px 10px', border: 'none', fontSize: 16 }}><i className="las la-times"></i></button>
            </div>
            {formError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>{formError}</div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Vehicle *</label>
                  <select value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} required style={inputStyle}>
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Driver ID</label>
                  <input type="number" value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})} style={inputStyle} placeholder="Driver ID" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Litres *</label>
                  <input type="number" step="0.1" required value={form.litres} onChange={e => setForm({...form, litres: e.target.value, totalCost: String((parseFloat(e.target.value) || 0) * (parseFloat(form.costPerLitre) || 0))})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cost / Litre *</label>
                  <input type="number" step="0.01" required value={form.costPerLitre} onChange={e => setForm({...form, costPerLitre: e.target.value, totalCost: String((parseFloat(form.litres) || 0) * (parseFloat(e.target.value) || 0))})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Total Cost</label>
                  <div style={{ ...inputStyle, background: 'var(--bg2)', color: 'var(--accent)', fontWeight: 600 }}>GHS {calcTotal().toFixed(2)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Odometer (km)</label>
                  <input type="number" value={form.odometer} onChange={e => setForm({...form, odometer: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Fuel Type *</label>
                  <select value={form.fuelType} onChange={e => setForm({...form, fuelType: e.target.value})} required style={inputStyle}>
                    {FUEL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Station</label>
                <input type="text" value={form.station} onChange={e => setForm({...form, station: e.target.value})} style={inputStyle} placeholder="Station name" />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={form.filledAt} onChange={e => setForm({...form, filledAt: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={btn}>Cancel</button>
                <button type="submit" disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? 'Saving...' : editRec ? 'Update' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AnimatedDetailModal
        open={!!detailFuel}
        onClose={() => setDetailFuel(null)}
        title={detailFuel ? `Fuel Record #${detailFuel.id}` : ''}
        subtitle={detailFuel ? `GHS ${detailFuel.totalCost.toLocaleString()}` : undefined}
        icon="gas-station"
        iconBg="rgba(6,182,212,0.12)"
        iconColor="#06b6d4"
        accent="#06b6d4"
        sections={
          detailFuel ? [
            { title: 'Refuel Details', icon: 'gas-station', iconColor: '#06b6d4', fields: [
              { label: 'Vehicle', value: detailFuel.vehicleId ? `#${detailFuel.vehicleId}` : 'Unknown', icon: 'car' },
              { label: 'Driver', value: detailFuel.driverId ? (DRIVER_NAMES[detailFuel.driverId] || `Driver #${detailFuel.driverId}`) : 'Unknown', icon: 'user' },
              { label: 'Fuel Type', value: detailFuel.fuelType, icon: 'droplet' },
              { label: 'Station', value: detailFuel.station || 'Unknown', icon: 'map-pin' },
            ]},
            { title: 'Cost & Quantity', icon: 'receipt', iconColor: '#22c55e', fields: [
              { label: 'Litres', value: `${detailFuel.litres}L`, icon: 'droplet', mono: true },
              { label: 'Cost/Litre', value: `GHS ${detailFuel.costPerLitre.toFixed(2)}`, icon: 'currency-dollar', mono: true },
              { label: 'Total Cost', value: `GHS ${detailFuel.totalCost.toFixed(2)}`, icon: 'receipt', color: '#22c55e', mono: true },
              { label: 'Odometer', value: `${detailFuel.odomenter?.toLocaleString() || detailFuel.odometer?.toLocaleString() || 'â€”'} km`, icon: 'speedometer', mono: true },
            ]},
            { title: 'Timestamps', icon: 'clock', iconColor: '#f59e0b', fields: [
              { label: 'Filled At', value: new Date(detailFuel.filledAt).toLocaleString('en-GB'), icon: 'calendar' },
              { label: 'Notes', value: detailFuel.notes || 'None', icon: 'note' },
            ]},
          ] : []
        }
      />
    </div>
  );
}
