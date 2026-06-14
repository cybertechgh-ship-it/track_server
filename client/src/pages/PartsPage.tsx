import { useState, useMemo, useEffect, useRef } from 'react';
import { partService, type Part } from '../services/partService';
import { uploadService } from '../services/uploadService';
import { CYTRACK_LOGO } from '../constants/logo';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color, whiteSpace: 'nowrap' }}>{label}</span>;

const CATEGORY_COLORS: Record<string, string> = {
  engine: '#ef4444', brake: '#f59e0b', suspension: '#8b5cf6',
  electrical: '#3b82f6', body: '#06b6d4', tire: '#22c55e',
  filter: '#64748b', other: '#5c6f8a',
};

const DEMO_PARTS: Part[] = [
  { id: 1, name: 'Oil Filter', partNumber: 'OF-2500', category: 'filter', quantity: 42, minStock: 10, unitPrice: 85, supplier: 'AutoParts Ghana', location: 'Aisle 1 Bin 3', notes: null, createdAt: '', updatedAt: '' },
  { id: 2, name: 'Brake Pads (Set)', partNumber: 'BP-1100', category: 'brake', quantity: 18, minStock: 8, unitPrice: 240, supplier: 'Michelin Center', location: 'Aisle 2 Bin 1', notes: null, createdAt: '', updatedAt: '' },
  { id: 3, name: 'Air Filter', partNumber: 'AF-3800', category: 'filter', quantity: 25, minStock: 10, unitPrice: 120, supplier: 'AutoParts Ghana', location: 'Aisle 1 Bin 4', notes: null, createdAt: '', updatedAt: '' },
  { id: 4, name: 'Alternator 12V', partNumber: 'ALT-200', category: 'electrical', quantity: 5, minStock: 6, unitPrice: 680, supplier: 'Bosch Service', location: 'Aisle 3 Bin 2', notes: null, createdAt: '', updatedAt: '' },
  { id: 5, name: 'Engine Oil 5W-30', partNumber: 'EO-530-20L', category: 'engine', quantity: 12, minStock: 5, unitPrice: 450, supplier: 'Shell Lubricants', location: 'Aisle 1 Bin 1', notes: null, createdAt: '', updatedAt: '' },
  { id: 6, name: 'Tire 225/65R17', partNumber: 'TR-22565', category: 'tire', quantity: 20, minStock: 8, unitPrice: 890, supplier: 'Michelin Center', location: 'Tire Rack A', notes: null, createdAt: '', updatedAt: '' },
  { id: 7, name: 'Shock Absorber', partNumber: 'SA-4500', category: 'suspension', quantity: 3, minStock: 6, unitPrice: 520, supplier: 'Kwame Auto Care', location: 'Aisle 4 Bin 1', notes: null, createdAt: '', updatedAt: '' },
  { id: 8, name: 'Headlight Assembly', partNumber: 'HL-7800', category: 'body', quantity: 8, minStock: 4, unitPrice: 340, supplier: 'AutoParts Ghana', location: 'Aisle 5 Bin 3', notes: null, createdAt: '', updatedAt: '' },
  { id: 9, name: 'Fuel Filter', partNumber: 'FF-1600', category: 'filter', quantity: 14, minStock: 6, unitPrice: 95, supplier: 'Total Parts', location: 'Aisle 1 Bin 5', notes: null, createdAt: '', updatedAt: '' },
  { id: 10, name: 'Brake Disc Rotor', partNumber: 'BR-8800', category: 'brake', quantity: 7, minStock: 5, unitPrice: 310, supplier: 'Michelin Center', location: 'Aisle 2 Bin 2', notes: null, createdAt: '', updatedAt: '' },
  { id: 11, name: 'Starter Motor', partNumber: 'SM-1200', category: 'electrical', quantity: 2, minStock: 4, unitPrice: 750, supplier: 'Bosch Service', location: 'Aisle 3 Bin 4', notes: null, createdAt: '', updatedAt: '' },
  { id: 12, name: 'Wiper Blade Set', partNumber: 'WB-5500', category: 'body', quantity: 30, minStock: 10, unitPrice: 65, supplier: 'AutoParts Ghana', location: 'Aisle 5 Bin 6', notes: null, createdAt: '', updatedAt: '' },
  { id: 13, name: 'Tire 195/65R15', partNumber: 'TR-19565', category: 'tire', quantity: 16, minStock: 6, unitPrice: 760, supplier: 'Michelin Center', location: 'Tire Rack B', notes: null, createdAt: '', updatedAt: '' },
  { id: 14, name: 'Coil Spring', partNumber: 'CS-3300', category: 'suspension', quantity: 9, minStock: 4, unitPrice: 410, supplier: 'Kwame Auto Care', location: 'Aisle 4 Bin 3', notes: null, createdAt: '', updatedAt: '' },
  { id: 15, name: 'Coolant 5L', partNumber: 'CL-5000', category: 'engine', quantity: 4, minStock: 8, unitPrice: 180, supplier: 'Shell Lubricants', location: 'Aisle 1 Bin 2', notes: null, createdAt: '', updatedAt: '' },
];

const fmt = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>(DEMO_PARTS);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editPart, setEditPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<Partial<Part>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    partService.getAll().then(d => setParts(d.length ? d : DEMO_PARTS)).catch(() => setParts(DEMO_PARTS));
  }, []);

  const stats = useMemo(() => {
    const total = parts.length;
    const lowStock = parts.filter(p => p.quantity <= p.minStock).length;
    const totalValue = parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
    const categories = new Set(parts.map(p => p.category)).size;
    return { total, lowStock, totalValue, categories };
  }, [parts]);

  const filteredParts = useMemo(() => {
    let list = parts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => `${p.name} ${p.partNumber} ${p.supplier} ${p.category}`.toLowerCase().includes(q));
    }
    if (lowStockOnly) list = list.filter(p => p.quantity <= p.minStock);
    return list;
  }, [parts, search, lowStockOnly]);

  const paginatedParts = filteredParts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredParts.length / rowsPerPage));

  const handleAdd = () => {
    setEditPart(null);
    setFormData({ name: '', partNumber: '', category: 'other', quantity: 0, minStock: 0, unitPrice: 0, supplier: '', location: '', notes: '' });
    setShowForm(true);
  };

  const handleEdit = (p: Part) => {
    setEditPart(p);
    setFormData({ ...p });
    setShowForm(true);
  };

  const handleDelete = (p: Part) => {
    if (!confirm(`Delete part "${p.name}"?`)) return;
    setParts(prev => prev.filter(x => x.id !== p.id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPart) {
      setParts(prev => prev.map(x => x.id === editPart.id ? { ...x, ...formData } as Part : x));
    } else {
      const newPart: Part = {
        id: Math.max(...parts.map(x => x.id), 0) + 1,
        createdAt: '', updatedAt: '',
        ...formData as any,
      };
      setParts(prev => [newPart, ...prev]);
    }
    setShowForm(false);
  };

  const summaryCards = [
    { label: 'Total Parts', value: stats.total, color: '#3b82f6', icon: 'ti-package' },
    { label: 'Low Stock Items', value: stats.lowStock, color: '#ef4444', icon: 'ti-alert-triangle' },
    { label: 'Total Inventory Value', value: fmt(stats.totalValue), color: '#22c55e', icon: 'ti-currency-dollar' },
    { label: 'Categories', value: stats.categories, color: '#8b5cf6', icon: 'ti-category' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        Parts Inventory
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: s.label === 'Total Inventory Value' ? "'JetBrains Mono', monospace" : 'inherit' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search parts..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={lowStockOnly} onChange={e => { setLowStockOnly(e.target.checked); setPage(0); }} style={{ accentColor: 'var(--accent)' }} />
            Low Stock Only
          </label>
        </div>
        <button style={btnPrimary} onClick={handleAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Part</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Part Name</th>
                <th style={hdrStyle}>Part #</th>
                <th style={hdrStyle}>Category</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Qty</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Min Stock</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Unit Price</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Total Value</th>
                <th style={hdrStyle}>Supplier</th>
                <th style={hdrStyle}>Location</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedParts.map(p => (
                <tr key={p.id} style={{ background: p.quantity <= p.minStock ? 'rgba(239,68,68,0.05)' : 'transparent', transition: 'background 0.1s' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = p.quantity <= p.minStock ? 'rgba(239,68,68,0.1)' : 'var(--bg3)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = p.quantity <= p.minStock ? 'rgba(239,68,68,0.05)' : 'transparent'}>
                  <td style={{ ...cellStyle, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{p.partNumber || 'â€”'}</td>
                  <td style={cellStyle}>{badge(p.category, CATEGORY_COLORS[p.category] || '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: p.quantity <= p.minStock ? 700 : 400, color: p.quantity <= p.minStock ? '#ef4444' : 'var(--text)' }}>{p.quantity}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{p.minStock}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{fmt(p.unitPrice)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(p.quantity * p.unitPrice)}</td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{p.supplier || 'â€”'}</td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{p.location || 'â€”'}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <button style={{ ...btn, padding: '4px 8px' }} onClick={() => handleEdit(p)}><i className="las la-edit" style={{ fontSize: 13 }}></i></button>
                      <button style={{ ...btn, padding: '4px 8px', color: 'var(--danger)' }} onClick={() => handleDelete(p)}><i className="las la-trash-alt" style={{ fontSize: 13 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedParts.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No parts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filteredParts.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <i className="las la-chevron-left" style={{ fontSize: 14 }}></i>
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= totalPages - 1 ? 0.4 : 1 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <i className="las la-chevron-right" style={{ fontSize: 14 }}></i>
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 540, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editPart ? 'Edit Part' : 'Add Part'}</div>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Part Name</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Part Number</label>
                    <input type="text" value={formData.partNumber || ''} onChange={e => setFormData({ ...formData, partNumber: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={formData.category || 'other'} onChange={e => setFormData({ ...formData, category: e.target.value as Part['category'] })} style={inputStyle}>
                      {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input type="number" required value={formData.quantity ?? ''} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} min={0} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Min Stock</label>
                    <input type="number" required value={formData.minStock ?? ''} onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })} min={0} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Unit Price (GHS)</label>
                    <input type="number" step="0.01" required value={formData.unitPrice ?? ''} onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })} min={0} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Supplier</label>
                    <input type="text" value={formData.supplier || ''} onChange={e => setFormData({ ...formData, supplier: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Location</label>
                    <input type="text" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>
                  <i className="las la-save" style={{ fontSize: 14 }}></i>
                  {editPart ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
