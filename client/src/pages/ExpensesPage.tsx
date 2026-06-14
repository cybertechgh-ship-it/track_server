import { useState, useEffect } from 'react';
import { expenseService, type Expense } from '../services/expenseService';
import { vehicleService } from '../services/vehicleService';
import type { Vehicle } from '../types';

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

const CATEGORY_OPTIONS = [
  { value: 'fuel', label: 'Fuel', icon: 'ti-gas-station', color: '#3b82f6' },
  { value: 'maintenance', label: 'Maintenance', icon: 'ti-wrench', color: '#f59e0b' },
  { value: 'toll', label: 'Toll', icon: 'ti-road', color: '#22c55e' },
  { value: 'parking', label: 'Parking', icon: 'ti-square', color: '#8b5cf6' },
  { value: 'insurance', label: 'Insurance', icon: 'ti-shield', color: '#06b6d4' },
  { value: 'tax', label: 'Tax', icon: 'ti-file-invoice', color: '#ef4444' },
  { value: 'permits', label: 'Permits', icon: 'ti-file', color: '#ec4899' },
  { value: 'supplies', label: 'Supplies', icon: 'ti-package', color: '#14b8a6' },
  { value: 'utilities', label: 'Utilities', icon: 'ti-bolt', color: '#f97316' },
  { value: 'rent', label: 'Rent', icon: 'ti-building', color: '#6366f1' },
  { value: 'salary', label: 'Salary', icon: 'ti-users', color: '#a855f7' },
  { value: 'other', label: 'Other', icon: 'ti-settings', color: '#64748b' },
];

const CATEGORY_MAP: Record<string, { label: string; icon: string; color: string }> = {};
CATEGORY_OPTIONS.forEach(c => { CATEGORY_MAP[c.value] = c; });

const DRIVER_NAMES: Record<number, string> = {
  1: 'Kwame Asante', 2: 'Abena Osei', 3: 'Yaw Mensah',
  4: 'Afia Owusu', 5: 'Kofi Boateng', 6: 'Esi Quansah',
};

const DEMO_VEHICLES: Vehicle[] = [
  { id: 81, plateNumber: 'GT-1000-20', brand: 'Toyota', model: 'Hilux', year: 2023, esp32DeviceId: 'ESP32_GH_0001', isActive: true, photo: '', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 82, plateNumber: 'GT-1001-20', brand: 'Nissan', model: 'Navara', year: 2023, esp32DeviceId: 'ESP32_GH_0002', isActive: true, photo: '', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 83, plateNumber: 'GT-1002-20', brand: 'Hyundai', model: 'Tucson', year: 2024, esp32DeviceId: 'ESP32_GH_0003', isActive: true, photo: '', createdAt: '2025-03-10T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 84, plateNumber: 'GT-1003-20', brand: 'Kia', model: 'Sorento', year: 2023, esp32DeviceId: 'ESP32_GH_0004', isActive: true, photo: '', createdAt: '2025-01-20T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 85, plateNumber: 'GT-1004-20', brand: 'Mercedes', model: 'Sprinter', year: 2024, esp32DeviceId: 'ESP32_GH_0005', isActive: true, photo: '', createdAt: '2025-04-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
];

const DEMO_RECORDS: Expense[] = [
  { id: 1, vehicleId: 81, driverId: 1, category: 'fuel', amount: 607.5, description: 'Full tank refuel - GOIL Tema', receiptUrl: null, expenseDate: '2026-06-12T08:15:00Z', approvedById: null, notes: '', createdAt: '', updatedAt: '' },
  { id: 2, vehicleId: 82, driverId: 2, category: 'fuel', amount: 454.4, description: 'Partial refuel - Shell Spintex', receiptUrl: null, expenseDate: '2026-06-12T10:30:00Z', approvedById: null, notes: '', createdAt: '', updatedAt: '' },
  { id: 3, vehicleId: 83, driverId: 3, category: 'maintenance', amount: 1200, description: 'Oil change & filter replacement', receiptUrl: null, expenseDate: '2026-06-11T09:00:00Z', approvedById: null, notes: '5W-30 synthetic', createdAt: '', updatedAt: '' },
  { id: 4, vehicleId: 84, driverId: 4, category: 'toll', amount: 45, description: 'Tetteh-Quarshie toll plaza', receiptUrl: null, expenseDate: '2026-06-10T07:30:00Z', approvedById: null, notes: '', createdAt: '', updatedAt: '' },
  { id: 5, vehicleId: 85, driverId: 5, category: 'insurance', amount: 8500, description: 'Annual comprehensive insurance premium', receiptUrl: null, expenseDate: '2026-06-09T00:00:00Z', approvedById: null, notes: 'Policy #INS-2026-0842', createdAt: '', updatedAt: '' },
  { id: 6, vehicleId: 81, driverId: 6, category: 'parking', amount: 120, description: 'Monthly parking permit - Accra Mall', receiptUrl: null, expenseDate: '2026-06-08T00:00:00Z', approvedById: null, notes: '', createdAt: '', updatedAt: '' },
  { id: 7, vehicleId: 82, driverId: 1, category: 'tax', amount: 2400, description: 'Quarterly road tax', receiptUrl: null, expenseDate: '2026-06-07T00:00:00Z', approvedById: null, notes: 'Q2 2026', createdAt: '', updatedAt: '' },
  { id: 8, vehicleId: 83, driverId: 2, category: 'permits', amount: 600, description: 'Driver license renewal fees (3 drivers)', receiptUrl: null, expenseDate: '2026-06-06T00:00:00Z', approvedById: null, notes: '', createdAt: '', updatedAt: '' },
  { id: 9, vehicleId: 84, driverId: 3, category: 'maintenance', amount: 3200, description: 'Brake pad replacement - all 4 wheels', receiptUrl: null, expenseDate: '2026-06-05T14:00:00Z', approvedById: null, notes: 'Ceramic pads', createdAt: '', updatedAt: '' },
  { id: 10, vehicleId: 85, driverId: 4, category: 'fuel', amount: 704, description: 'Full tank - PetroGhana Circle', receiptUrl: null, expenseDate: '2026-06-04T16:20:00Z', approvedById: null, notes: '', createdAt: '', updatedAt: '' },
];

const fmtMoney = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dFmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'â€”';

export default function ExpensesPage() {
  const [records, setRecords] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editRec, setEditRec] = useState<Expense | null>(null);
  const [viewRec, setViewRec] = useState<Expense | null>(null);
  const [form, setForm] = useState({
    category: 'fuel', amount: '', description: '', vehicleId: '',
    driverId: '', expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: '', notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); loadVehicles(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null);
      const data = await expenseService.getAll();
      setRecords(data.length ? data : DEMO_RECORDS);
    } catch { setRecords(DEMO_RECORDS); }
    finally { setLoading(false); }
  };

  const loadVehicles = async () => {
    try { const data = await vehicleService.getAll(); setVehicles(data); }
    catch { setVehicles(DEMO_VEHICLES); }
  };

  const openAdd = () => {
    setEditRec(null);
    setForm({ category: 'fuel', amount: '', description: '', vehicleId: '', driverId: '', expenseDate: new Date().toISOString().split('T')[0], receiptUrl: '', notes: '' });
    setFormError(null); setShowModal(true);
  };

  const openEdit = (r: Expense) => {
    setEditRec(r);
    setForm({
      category: r.category, amount: String(r.amount), description: r.description,
      vehicleId: r.vehicleId ? String(r.vehicleId) : '',
      driverId: r.driverId ? String(r.driverId) : '',
      expenseDate: r.expenseDate.split('T')[0],
      receiptUrl: r.receiptUrl || '', notes: r.notes || '',
    });
    setFormError(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const body = {
        category: form.category,
        amount: parseFloat(form.amount) || 0,
        description: form.description,
        expenseDate: form.expenseDate,
        vehicleId: parseInt(form.vehicleId) || null,
        driverId: parseInt(form.driverId) || null,
        receiptUrl: form.receiptUrl || null,
        notes: form.notes || null,
      };
      if (editRec) {
        await expenseService.update(editRec.id, body);
      } else {
        await expenseService.create(body);
      }
      await load(); setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense record?')) return;
    try { await expenseService.delete(id); await load(); }
    catch (err: any) { alert(err.message); }
  };

  const getVehicleLabel = (id: number | null) => {
    if (!id) return '-';
    const v = vehicles.find(x => x.id === id);
    return v ? `${v.plateNumber} - ${v.brand} ${v.model}` : `Vehicle #${id}`;
  };

  const driverName = (id: number | null) => id ? (DRIVER_NAMES[id] || `Driver #${id}`) : '-';

  const totalExpenses = records.reduce((s, r) => s + r.amount, 0);
  const categoryTotals: Record<string, number> = {};
  records.forEach(r => { categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount; });
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthTotal = records.filter(r => {
    const d = new Date(r.expenseDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).reduce((s, r) => s + r.amount, 0);

  const filtered = records.filter(r => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.description.toLowerCase().includes(q) ||
      getVehicleLabel(r.vehicleId).toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Expenses & Costs</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Track all operational expenses with category breakdown</p>
        </div>
        <button onClick={openAdd} style={btnPrimary}>
          <i className="las la-plus" style={{ fontSize: 15 }}></i> Add Expense
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{fmtMoney(totalExpenses)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Total Expenses</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{fmtMoney(thisMonthTotal)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>This Month</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{records.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Total Records</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>{Object.keys(categoryTotals).length}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Categories</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
          <input placeholder="Search expenses..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 240 }} />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 160, cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Date</th>
                <th style={hdrStyle}>Category</th>
                <th style={hdrStyle}>Description</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Amount</th>
                <th style={hdrStyle}>Vehicle</th>
                <th style={hdrStyle}>Driver</th>
                <th style={hdrStyle}>Receipt</th>
                <th style={hdrStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No expenses found</td></tr>
              ) : paginated.map(r => {
                const cat = CATEGORY_MAP[r.category] || { label: r.category, icon: 'ti-settings', color: '#64748b' };
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onClick={() => setViewRec(r)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...cellStyle, whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(r.expenseDate).toLocaleDateString()}</td>
                    <td style={cellStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: `${cat.color}18`, color: cat.color }}>
                        <i className={`ti ${cat.icon}`} style={{ fontSize: 12 }}></i>
                        {cat.label}
                      </span>
                    </td>
                    <td style={cellStyle}>{r.description}</td>
                    <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmtMoney(r.amount)}</td>
                    <td style={cellStyle}>{getVehicleLabel(r.vehicleId)}</td>
                    <td style={cellStyle}>{driverName(r.driverId)}</td>
                    <td style={cellStyle}>
                      {r.receiptUrl ? (
                        <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="las la-file-text" style={{ fontSize: 14 }}></i> View
                        </a>
                      ) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>-</span>}
                    </td>
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
                );
              })}
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{editRec ? 'Edit' : 'Add'} Expense</h2>
              <button onClick={() => setShowModal(false)} style={{ ...btn, padding: '6px 10px', border: 'none', fontSize: 16 }}><i className="las la-times"></i></button>
            </div>
            {formError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>{formError}</div>
      )}

      {viewRec && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setViewRec(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(() => { const cat = CATEGORY_MAP[viewRec.category] || { label: viewRec.category, icon: 'ti-settings', color: '#64748b' }; return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: `${cat.color}18`, color: cat.color }}>
                    <i className={`ti ${cat.icon}`} style={{ fontSize: 15 }}></i>{cat.label}
                  </span>); })()}
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{fmtMoney(viewRec.amount)}</span>
              </div>
              <button onClick={() => setViewRec(null)} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="las la-times" /></button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{viewRec.description || 'â€”'}</div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Date</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{dFmt(viewRec.expenseDate)}</div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Vehicle</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{getVehicleLabel(viewRec.vehicleId)}</div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Driver</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{driverName(viewRec.driverId)}</div>
                </div>
              </div>
              {viewRec.notes && (
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{viewRec.notes}</div>
                </div>
              )}
              {viewRec.receiptUrl && (
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Receipt</div>
                  <a href={viewRec.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <i className="las la-file-text" style={{ fontSize: 14 }}></i> View Receipt
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button onClick={() => { setViewRec(null); openEdit(viewRec); }} style={{ ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' }}>
                  <i className="las la-edit" style={{ fontSize: 14 }}></i> Edit
                </button>
                <button onClick={() => setViewRec(null)} style={btn}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required style={inputStyle}>
                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Amount (GHS) *</label>
                  <input type="number" step="0.01" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description *</label>
                <input type="text" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={inputStyle} placeholder="Brief description" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Vehicle</label>
                  <select value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} style={inputStyle}>
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Driver ID</label>
                  <input type="number" value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})} style={inputStyle} placeholder="Driver ID" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={form.expenseDate} onChange={e => setForm({...form, expenseDate: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Receipt URL</label>
                  <input type="text" value={form.receiptUrl} onChange={e => setForm({...form, receiptUrl: e.target.value})} style={inputStyle} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={btn}>Cancel</button>
                <button type="submit" disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? 'Saving...' : editRec ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
