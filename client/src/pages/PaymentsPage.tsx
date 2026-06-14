import { useState, useEffect } from 'react';
import { paymentService, type Payment } from '../services/paymentService';
import { printReceipt } from '../utils/printDocument';

const fmt = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dFmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const METHOD_COLORS: Record<string, string> = { cash: '#22c55e', mobile_money: '#8b5cf6', bank_transfer: '#3b82f6', card: '#f59e0b', other: '#5c6f8a' };
const METHOD_ICONS: Record<string, string> = { cash: 'ti-currency-dollar', mobile_money: 'ti-device-mobile', bank_transfer: 'ti-building-bank', card: 'ti-credit-card', other: 'ti-coin' };
const METHOD_LABELS: Record<string, string> = { cash: 'Cash', mobile_money: 'Mobile Money', bank_transfer: 'Bank Transfer', card: 'Card', other: 'Other' };

const DRIVER_MAP: Record<number, { name: string; plate: string }> = {
  101: { name: 'Kwame Asante', plate: 'GT 1234-20' },
  102: { name: 'Abena Osei', plate: 'GT 5678-21' },
  103: { name: 'Yaw Mensah', plate: 'GT 9012-22' },
  104: { name: 'Afia Owusu', plate: 'GT 3456-23' },
  105: { name: 'Kofi Boateng', plate: 'GT 7890-24' },
  106: { name: 'Esi Quansah', plate: 'GT 1111-25' },
  107: { name: 'Nana Yeboah', plate: 'GT 2222-26' },
  108: { name: 'Akua Sarpong', plate: 'GT 3333-27' },
};

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const btnDanger: React.CSSProperties = { ...btn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color, whiteSpace: 'nowrap' }}>{label}</span>
);

interface PaymentDisplay extends Payment {
  driverName: string;
  plateNumber: string;
}

const DEMO_PAYMENTS: PaymentDisplay[] = [
  { id: 1, driverId: 101, invoiceId: null, amount: 450, method: 'cash', reference: 'REC-001', paidAt: '2026-06-01T18:00:00Z', receivedById: 1, notes: null, createdAt: '2026-06-01T18:00:00Z', updatedAt: '2026-06-01T18:00:00Z', driverName: 'Kwame Asante', plateNumber: 'GT 1234-20' },
  { id: 2, driverId: 102, invoiceId: null, amount: 520, method: 'mobile_money', reference: 'MOMO-8821', paidAt: '2026-06-02T17:30:00Z', receivedById: 1, notes: 'Via MTN MoMo', createdAt: '2026-06-02T17:30:00Z', updatedAt: '2026-06-02T17:30:00Z', driverName: 'Abena Osei', plateNumber: 'GT 5678-21' },
  { id: 3, driverId: 103, invoiceId: null, amount: 610, method: 'cash', reference: 'REC-002', paidAt: '2026-06-01T19:00:00Z', receivedById: 2, notes: 'Exceeded target', createdAt: '2026-06-01T19:00:00Z', updatedAt: '2026-06-01T19:00:00Z', driverName: 'Yaw Mensah', plateNumber: 'GT 9012-22' },
  { id: 4, driverId: 104, invoiceId: null, amount: 380, method: 'bank_transfer', reference: 'TRF-3344', paidAt: '2026-06-02T08:00:00Z', receivedById: 1, notes: 'Night shift collection', createdAt: '2026-06-02T08:00:00Z', updatedAt: '2026-06-02T08:00:00Z', driverName: 'Afia Owusu', plateNumber: 'GT 3456-23' },
  { id: 5, driverId: 105, invoiceId: null, amount: 320, method: 'cash', reference: 'REC-003', paidAt: '2026-06-01T17:00:00Z', receivedById: 3, notes: 'Short due to breakdown', createdAt: '2026-06-01T17:00:00Z', updatedAt: '2026-06-01T17:00:00Z', driverName: 'Kofi Boateng', plateNumber: 'GT 7890-24' },
  { id: 6, driverId: 106, invoiceId: null, amount: 490, method: 'mobile_money', reference: 'MOMO-9912', paidAt: '2026-06-02T19:30:00Z', receivedById: 3, notes: null, createdAt: '2026-06-02T19:30:00Z', updatedAt: '2026-06-02T19:30:00Z', driverName: 'Esi Quansah', plateNumber: 'GT 1111-25' },
  { id: 7, driverId: 107, invoiceId: null, amount: 670, method: 'card', reference: 'CARD-5566', paidAt: '2026-06-01T20:00:00Z', receivedById: 6, notes: 'Corporate card payment', createdAt: '2026-06-01T20:00:00Z', updatedAt: '2026-06-01T20:00:00Z', driverName: 'Nana Yeboah', plateNumber: 'GT 2222-26' },
  { id: 8, driverId: 108, invoiceId: null, amount: 210, method: 'cash', reference: 'REC-004', paidAt: '2026-06-01T18:30:00Z', receivedById: 1, notes: 'Part-time driver', createdAt: '2026-06-01T18:30:00Z', updatedAt: '2026-06-01T18:30:00Z', driverName: 'Akua Sarpong', plateNumber: 'GT 3333-27' },
];

export default function PaymentsPage() {
  const [data, setData] = useState<PaymentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<PaymentDisplay | null>(null);
  const [detailItem, setDetailItem] = useState<PaymentDisplay | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({ driverId: 101, amount: '', method: 'cash' as Payment['method'], reference: '', paidAt: '', notes: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const records = await paymentService.getAll().catch(() => [] as Payment[]);
      if (records.length > 0) {
        setData(records.map(r => {
          const d = DRIVER_MAP[r.driverId ?? 0];
          return { ...r, driverName: d?.name ?? `Driver #${r.driverId}`, plateNumber: d?.plate ?? 'Unknown' };
        }));
      } else {
        setData(DEMO_PAYMENTS);
      }
    } catch {
      setData(DEMO_PAYMENTS);
    } finally { setLoading(false); }
  };

  const totalCollected = data.reduce((s, r) => s + r.amount, 0);
  const cashTotal = data.filter(r => r.method === 'cash').reduce((s, r) => s + r.amount, 0);
  const mobileTotal = data.filter(r => r.method === 'mobile_money').reduce((s, r) => s + r.amount, 0);

  const summaryCards = [
    { label: 'Total Collected', value: fmt(totalCollected), color: '#22c55e', icon: 'ti-currency-dollar' },
    { label: 'Total Payments', value: data.length, color: '#3b82f6', icon: 'ti-receipt' },
    { label: 'Cash Collected', value: fmt(cashTotal), color: '#22c55e', icon: 'ti-currency-dollar' },
    { label: 'Mobile Money', value: fmt(mobileTotal), color: '#8b5cf6', icon: 'ti-device-mobile' },
  ];

  const filtered = data.filter(r => {
    const s = search.toLowerCase();
    return (!s || r.driverName.toLowerCase().includes(s) || (r.reference && r.reference.toLowerCase().includes(s))) &&
      (methodFilter === 'all' || r.method === methodFilter);
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openAdd = () => {
    setEditItem(null);
    setForm({ driverId: 101, amount: '', method: 'cash', reference: '', paidAt: new Date().toISOString().slice(0, 16), notes: '' });
    setFormError(null); setShowForm(true);
  };

  const openEdit = (r: PaymentDisplay) => {
    setEditItem(r);
    setForm({ driverId: r.driverId ?? 101, amount: String(r.amount), method: r.method, reference: r.reference || '', paidAt: r.paidAt.slice(0, 16), notes: r.notes || '' });
    setFormError(null); setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const d = DRIVER_MAP[form.driverId];
      const rec: PaymentDisplay = {
        id: editItem ? editItem.id : Math.max(...data.map(d => d.id), 0) + 1,
        driverId: form.driverId,
        invoiceId: editItem?.invoiceId ?? null,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference || null,
        paidAt: new Date(form.paidAt).toISOString(),
        receivedById: editItem?.receivedById ?? null,
        notes: form.notes || null,
        createdAt: editItem?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        driverName: d?.name ?? `Driver #${form.driverId}`,
        plateNumber: d?.plate ?? 'Unknown',
      };
      if (editItem) {
        setData(prev => prev.map(x => x.id === editItem.id ? rec : x));
      } else {
        setData(prev => [...prev, rec]);
      }
      setShowForm(false);
    } catch (err: any) { setFormError(err.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = (r: PaymentDisplay) => {
    if (!confirm(`Delete payment of ${fmt(r.amount)} from ${r.driverName}?`)) return;
    setData(prev => prev.filter(x => x.id !== r.id));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div>
      {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
        <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
      </div>}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="las la-receipt" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
          Payments
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Track driver payments, collections, and receipts</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, padding: '14px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search driver, reference..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
          </div>
          <select value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 150, cursor: 'pointer' }}>
            <option value="all">All Methods</option>
            {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Payment</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Date</th>
                <th style={hdrStyle}>Driver</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Amount</th>
                <th style={hdrStyle}>Method</th>
                <th style={hdrStyle}>Reference</th>
                <th style={hdrStyle}>Notes</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} style={{ transition: 'background 0.1s', cursor: 'pointer' }}
                  onClick={() => setDetailItem(r)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>{dFmt(r.paidAt)}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{r.driverName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>{r.plateNumber}</span>
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(r.amount)}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className={`ti ${METHOD_ICONS[r.method]}`} style={{ fontSize: 14, color: METHOD_COLORS[r.method] }}></i>
                      {badge(METHOD_LABELS[r.method], METHOD_COLORS[r.method])}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{r.reference || 'â€”'}</td>
                  <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text3)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || 'â€”'}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <button style={{ ...btn, padding: '5px 7px' }} onClick={() => setDetailItem(r)} title="View"><i className="las la-eye" style={{ fontSize: 14 }}></i></button>
                      <button style={{ ...btn, padding: '5px 7px' }} onClick={() => openEdit(r)} title="Edit"><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                      <button style={{ ...btnDanger, padding: '5px 7px' }} onClick={() => handleDelete(r)} title="Delete"><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No payments found</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} records</span>
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

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 540, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Payment' : 'Add Payment'}</div>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Driver</label>
                    <select value={form.driverId} onChange={e => setForm({ ...form, driverId: Number(e.target.value) })} style={inputStyle}>
                      {Object.entries(DRIVER_MAP).map(([id, d]) => <option key={id} value={id}>{d.name} ({d.plate})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Amount (GHS)</label>
                    <input required type="number" step="0.01" min={0} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Method</label>
                    <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value as Payment['method'] })} style={inputStyle}>
                      {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Reference</label>
                    <input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} style={inputStyle} placeholder="e.g. REC-001" />
                  </div>
                  <div>
                    <label style={labelStyle}>Paid At</label>
                    <input required type="datetime-local" value={form.paidAt} onChange={e => setForm({ ...form, paidAt: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="las la-spinner" style={{ animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editItem ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={() => setDetailItem(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 500, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="las la-receipt" style={{ fontSize: 18, color: 'var(--accent)' }}></i>
                Payment #{detailItem.id}
              </div>
              <button type="button" onClick={() => setDetailItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Payment Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Driver</span><div style={{ fontSize: 14, fontWeight: 600 }}>{detailItem.driverName} <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>#{detailItem.driverId}</span></div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Vehicle</span><div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{detailItem.plateNumber}</div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Amount</span><div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>{fmt(detailItem.amount)}</div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Method</span><div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><i className={`ti ${METHOD_ICONS[detailItem.method]}`} style={{ fontSize: 14, color: METHOD_COLORS[detailItem.method] }}></i>{METHOD_LABELS[detailItem.method]}</div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Date</span><div style={{ fontSize: 14 }}>{dFmt(detailItem.paidAt)}</div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Reference</span><div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{detailItem.reference || 'â€”'}</div></div>
                </div>
              </div>
              {detailItem.notes && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{detailItem.notes}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
                <button style={{ ...btn, padding: '8px 16px' }} onClick={async () => await printReceipt(detailItem)}><i className="las la-print" style={{ fontSize: 14 }}></i> Print Receipt</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
