import { useState, useEffect } from 'react';
import { invoiceService, type Invoice } from '../services/invoiceService';
import { printInvoice } from '../utils/printDocument';

const fmt = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dFmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'â€”';

const STATUS_COLORS: Record<string, string> = { draft: '#64748b', sent: '#3b82f6', paid: '#22c55e', overdue: '#ef4444', cancelled: '#5c6f8a' };
const STATUS_ICONS: Record<string, string> = { draft: 'ti-file', sent: 'ti-send', paid: 'ti-circle-check', overdue: 'ti-alert-triangle', cancelled: 'ti-x-circle' };

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

const DEMO_INVOICES: Invoice[] = [
  { id: 1, clientName: 'Kwame Asante', clientEmail: 'kasante@gmail.com', clientAddress: 'Accra, Ghana', invoiceNumber: 'INV-2026-0001', items: JSON.stringify([{ desc: 'Fleet rental - 3 days', qty: 1, rate: 1500 }]), subtotal: 1500, tax: 150, total: 1650, status: 'paid', dueDate: '2026-05-15', paidAt: '2026-05-10T12:00:00Z', notes: null, createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-05-10T12:00:00Z' },
  { id: 2, clientName: 'Abena Osei', clientEmail: 'aosei@yahoo.com', clientAddress: 'Kumasi, Ghana', invoiceNumber: 'INV-2026-0002', items: JSON.stringify([{ desc: 'Charter service - Accra to Kumasi', qty: 1, rate: 2200 }]), subtotal: 2200, tax: 220, total: 2420, status: 'sent', dueDate: '2026-06-20', paidAt: null, notes: 'Net 30 terms', createdAt: '2026-05-20T09:00:00Z', updatedAt: '2026-05-20T09:00:00Z' },
  { id: 3, clientName: 'Yaw Mensah', clientEmail: 'ymensah@business.com', clientAddress: 'Tema, Ghana', invoiceNumber: 'INV-2026-0003', items: JSON.stringify([{ desc: 'Logistics support - 1 week', qty: 7, rate: 400 }]), subtotal: 2800, tax: 280, total: 3080, status: 'overdue', dueDate: '2026-05-01', paidAt: null, notes: 'Second reminder sent', createdAt: '2026-04-15T10:00:00Z', updatedAt: '2026-05-02T08:00:00Z' },
  { id: 4, clientName: 'Afia Owusu', clientEmail: 'afia.owusu@example.com', clientAddress: 'Cape Coast, Ghana', invoiceNumber: 'INV-2026-0004', items: JSON.stringify([{ desc: 'Vehicle maintenance package', qty: 1, rate: 950 }]), subtotal: 950, tax: 95, total: 1045, status: 'draft', dueDate: '2026-07-01', paidAt: null, notes: 'Awaiting client approval', createdAt: '2026-06-01T14:00:00Z', updatedAt: '2026-06-01T14:00:00Z' },
  { id: 5, clientName: 'Kofi Boateng', clientEmail: 'kboateng@gmail.com', clientAddress: 'Takoradi, Ghana', invoiceNumber: 'INV-2026-0005', items: JSON.stringify([{ desc: 'Monthly fleet management', qty: 1, rate: 5000 }]), subtotal: 5000, tax: 500, total: 5500, status: 'sent', dueDate: '2026-06-30', paidAt: null, notes: 'Monthly retainer', createdAt: '2026-06-01T16:00:00Z', updatedAt: '2026-06-01T16:00:00Z' },
  { id: 6, clientName: 'Esi Quansah', clientEmail: 'esi.quansah@example.com', clientAddress: 'Accra, Ghana', invoiceNumber: 'INV-2026-0006', items: JSON.stringify([{ desc: 'School shuttle service - term', qty: 1, rate: 3200 }]), subtotal: 3200, tax: 320, total: 3520, status: 'paid', dueDate: '2026-04-30', paidAt: '2026-04-28T10:00:00Z', notes: null, createdAt: '2026-04-01T07:00:00Z', updatedAt: '2026-04-28T10:00:00Z' },
  { id: 7, clientName: 'Nana Yeboah', clientEmail: 'nyeboah@organization.com', clientAddress: 'Kumasi, Ghana', invoiceNumber: 'INV-2026-0007', items: JSON.stringify([{ desc: 'Event transport - 2 buses', qty: 1, rate: 1800 }]), subtotal: 1800, tax: 180, total: 1980, status: 'overdue', dueDate: '2026-05-10', paidAt: null, notes: 'Client disputing mileage charges', createdAt: '2026-04-20T11:00:00Z', updatedAt: '2026-05-11T09:00:00Z' },
  { id: 8, clientName: 'Akua Sarpong', clientEmail: 'akua.s@example.com', clientAddress: 'Tema, Ghana', invoiceNumber: 'INV-2026-0008', items: JSON.stringify([{ desc: 'Driver training program', qty: 5, rate: 300 }]), subtotal: 1500, tax: 150, total: 1650, status: 'draft', dueDate: '2026-07-15', paidAt: null, notes: 'To be reviewed by manager', createdAt: '2026-06-10T13:00:00Z', updatedAt: '2026-06-10T13:00:00Z' },
];

function computeStats(invoices: Invoice[]) {
  const totalOutstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.total, 0);
  const paidThisMonth = invoices.filter(i => i.status === 'paid' && i.paidAt && new Date(i.paidAt).getMonth() === new Date().getMonth() && new Date(i.paidAt).getFullYear() === new Date().getFullYear()).reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  return { totalOutstanding, paidThisMonth, overdue, count: invoices.length };
}

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Invoice | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientAddress: '', invoiceNumber: '', items: '', subtotal: '', tax: '', total: '', status: 'draft' as Invoice['status'], dueDate: '', notes: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const records = await invoiceService.getAll().catch(() => [] as Invoice[]);
      if (records.length > 0) {
        setData(records);
      } else {
        setData(DEMO_INVOICES);
      }
    } catch {
      setData(DEMO_INVOICES);
    } finally { setLoading(false); }
  };

  const stats = computeStats(data);

  const filtered = data.filter(r => {
    const s = search.toLowerCase();
    return (!s || r.clientName.toLowerCase().includes(s) || r.invoiceNumber.toLowerCase().includes(s) || r.clientEmail?.toLowerCase().includes(s)) &&
      (statusFilter === 'all' || r.status === statusFilter);
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const summaryCards = [
    { label: 'Total Outstanding', value: fmt(stats.totalOutstanding), color: '#f59e0b', icon: 'ti-currency-dollar' },
    { label: 'Paid This Month', value: fmt(stats.paidThisMonth), color: '#22c55e', icon: 'ti-circle-check' },
    { label: 'Overdue', value: fmt(stats.overdue), color: '#ef4444', icon: 'ti-alert-triangle' },
    { label: 'Total Invoices', value: stats.count, color: '#3b82f6', icon: 'ti-file-invoice' },
  ];

  const openAdd = () => {
    setEditItem(null);
    const nextNum = `INV-2026-${String(Math.max(...data.map(d => Number(d.invoiceNumber.split('-')[2])), 0) + 1).padStart(4, '0')}`;
    setForm({ clientName: '', clientEmail: '', clientAddress: '', invoiceNumber: nextNum, items: '[]', subtotal: '', tax: '', total: '', status: 'draft', dueDate: '', notes: '' });
    setFormError(null); setShowForm(true);
  };

  const openEdit = (r: Invoice) => {
    setEditItem(r);
    const itemsRaw = typeof r.items === 'string' ? r.items : JSON.stringify(r.items, null, 2);
    setForm({
      clientName: r.clientName, clientEmail: r.clientEmail || '', clientAddress: r.clientAddress || '',
      invoiceNumber: r.invoiceNumber, items: itemsRaw,
      subtotal: String(r.subtotal), tax: String(r.tax), total: String(r.total),
      status: r.status, dueDate: r.dueDate.slice(0, 10), notes: r.notes || '',
    });
    setFormError(null); setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      let parsedItems: any;
      try { parsedItems = JSON.parse(form.items); } catch { throw new Error('Invalid JSON in items field'); }
      const rec: Invoice = {
        id: editItem ? editItem.id : Math.max(...data.map(d => d.id), 0) + 1,
        clientName: form.clientName,
        clientEmail: form.clientEmail || null,
        clientAddress: form.clientAddress || null,
        invoiceNumber: form.invoiceNumber,
        items: parsedItems,
        subtotal: Number(form.subtotal),
        tax: Number(form.tax),
        total: Number(form.total),
        status: form.status,
        dueDate: form.dueDate,
        paidAt: editItem?.paidAt ?? null,
        notes: form.notes || null,
        createdAt: editItem?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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

  const handleDelete = (r: Invoice) => {
    if (!confirm(`Delete invoice ${r.invoiceNumber} for ${r.clientName}?`)) return;
    setData(prev => prev.filter(x => x.id !== r.id));
  };

  const handleStatusChange = (id: number, status: Invoice['status']) => {
    setData(prev => prev.map(x => x.id === id ? { ...x, status, paidAt: status === 'paid' ? new Date().toISOString() : x.paidAt, updatedAt: new Date().toISOString() } : x));
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
          <i className="las la-file-invoice" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
          Invoicing
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Generate, send, and track client invoices</div>
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
            <input placeholder="Search client, invoice..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 140, cursor: 'pointer' }}>
            <option value="all">All Status</option>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Invoice</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Invoice #</th>
                <th style={hdrStyle}>Client</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Amount</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Due Date</th>
                <th style={hdrStyle}>Paid Date</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} style={{ transition: 'background 0.1s', cursor: 'pointer' }}
                  onClick={() => setPreviewInvoice(r)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 12 }}>{r.invoiceNumber}</td>
                  <td style={cellStyle}>
                    <div>
                      <span>{r.clientName}</span>
                      {r.clientEmail && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.clientEmail}</div>}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(r.total)}</td>
                  <td style={cellStyle}>{badge(r.status.charAt(0).toUpperCase() + r.status.slice(1), STATUS_COLORS[r.status])}</td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{dFmt(r.dueDate)}</td>
                  <td style={{ ...cellStyle, fontSize: 12, color: r.paidAt ? 'var(--text)' : 'var(--text3)' }}>{dFmt(r.paidAt)}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <button style={{ ...btn, padding: '5px 7px' }} onClick={() => openEdit(r)} title="Edit"><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                      {r.status === 'draft' && <button style={{ ...btn, padding: '5px 7px', color: '#3b82f6' }} onClick={() => handleStatusChange(r.id, 'sent')} title="Send"><i className="las la-paper-plane" style={{ fontSize: 14 }}></i></button>}
                      {r.status === 'sent' && <button style={{ ...btn, padding: '5px 7px', color: '#22c55e' }} onClick={() => handleStatusChange(r.id, 'paid')} title="Mark Paid"><i className="las la-check-circle" style={{ fontSize: 14 }}></i></button>}
                      {(r.status === 'sent' || r.status === 'draft') && <button style={{ ...btn, padding: '5px 7px', color: '#ef4444' }} onClick={() => handleStatusChange(r.id, 'overdue')} title="Mark Overdue"><i className="las la-exclamation-triangle" style={{ fontSize: 14 }}></i></button>}
                      <button style={{ ...btnDanger, padding: '5px 7px' }} onClick={() => handleDelete(r)} title="Delete"><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No invoices found</td></tr>}
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
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 620, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Invoice' : 'Add Invoice'}</div>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Client Name</label><input required value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Client Email</label><input type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Client Address</label><input value={form.clientAddress} onChange={e => setForm({ ...form, clientAddress: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Invoice Number</label><input required value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Invoice['status'] })} style={inputStyle}>
                    {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select></div>
                  <div><label style={labelStyle}>Due Date</label><input required type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Items (JSON)</label><textarea rows={4} value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} /></div>
                  <div><label style={labelStyle}>Subtotal</label><input required type="number" step="0.01" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Tax</label><input required type="number" step="0.01" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Total</label><input required type="number" step="0.01" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} /></div>
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)' }}>
                  <span>Total: <strong style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{form.total ? fmt(Number(form.total)) : 'â€”'}</strong></span>
                  <span>Subtotal: <strong style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{form.subtotal ? fmt(Number(form.subtotal)) : 'â€”'}</strong></span>
                  <span>Tax: <strong style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{form.tax ? fmt(Number(form.tax)) : 'â€”'}</strong></span>
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
      {previewInvoice && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={() => setPreviewInvoice(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="las la-file-invoice" style={{ fontSize: 18, color: 'var(--accent)' }}></i>
                {previewInvoice.invoiceNumber}
              </div>
              <button type="button" onClick={() => setPreviewInvoice(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Client</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{previewInvoice.clientName}</div>
                  {previewInvoice.clientEmail && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{previewInvoice.clientEmail}</div>}
                  {previewInvoice.clientAddress && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{previewInvoice.clientAddress}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${STATUS_COLORS[previewInvoice.status]}18`, color: STATUS_COLORS[previewInvoice.status] }}>
                    {previewInvoice.status.charAt(0).toUpperCase() + previewInvoice.status.slice(1)}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Line Items</div>
                {(() => {
                  const items = typeof previewInvoice.items === 'string' ? JSON.parse(previewInvoice.items) : previewInvoice.items;
                  return items.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.desc}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Qty: {item.qty} Ã— GHS {item.rate?.toLocaleString()}</div>
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(item.qty * item.rate)}</div>
                    </div>
                  ));
                })()}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Subtotal</span><div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(previewInvoice.subtotal)}</div></div>
                <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Tax</span><div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(previewInvoice.tax)}</div></div>
                <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Due Date</span><div style={{ fontSize: 14 }}>{dFmt(previewInvoice.dueDate)}</div></div>
                <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Paid Date</span><div style={{ fontSize: 14, color: previewInvoice.paidAt ? 'var(--text)' : 'var(--text3)' }}>{dFmt(previewInvoice.paidAt)}</div></div>
              </div>

              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)' }}>{fmt(previewInvoice.total)}</span>
              </div>

              {previewInvoice.notes && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{previewInvoice.notes}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button style={{ ...btn, padding: '8px 16px' }} onClick={async () => await printInvoice(previewInvoice)}><i className="las la-print" style={{ fontSize: 14 }}></i> Print</button>
                <button style={{ ...btn, padding: '8px 16px' }} onClick={() => { setPreviewInvoice(null); openEdit(previewInvoice); }}><i className="las la-edit" style={{ fontSize: 14 }}></i> Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
