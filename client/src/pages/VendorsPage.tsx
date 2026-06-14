import { useState, useMemo, useEffect } from 'react';
import { vendorService, type Vendor } from '../services/vendorService';
import { CYTRACK_LOGO } from '../constants/logo';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color, whiteSpace: 'nowrap' }}>{label}</span>;

const TYPE_COLORS: Record<string, string> = {
  mechanic: '#3b82f6', parts_supplier: '#f59e0b', fuel_station: '#22c55e',
  insurance: '#8b5cf6', towing: '#ef4444', other: '#64748b',
};

const DEMO_VENDORS: Vendor[] = [
  { id: 1, name: 'Kwame Auto Care', type: 'mechanic', contactPerson: 'Kwame Asante', phone: '+233 24 123 4567', email: 'kwame@kwameautocare.com', address: 'Spintex Road, Accra', rating: 5, isActive: true, notes: 'Fleet maintenance partner', createdAt: '', updatedAt: '' },
  { id: 2, name: 'Servicio Central', type: 'mechanic', contactPerson: 'Carlos Mendez', phone: '+233 20 987 6543', email: 'carlos@serviciocentral.com', address: 'Ring Road Central, Accra', rating: 4, isActive: true, notes: null, createdAt: '', updatedAt: '' },
  { id: 3, name: 'Michelin Center', type: 'parts_supplier', contactPerson: 'Ama Serwaa', phone: '+233 54 456 7890', email: 'ama@michelincenter.gh', address: 'Tema Motorway, Tema', rating: 5, isActive: true, notes: 'Tire and brake supplier', createdAt: '', updatedAt: '' },
  { id: 4, name: 'Shell Ghana Ltd', type: 'fuel_station', contactPerson: 'James Osei', phone: '+233 50 111 2233', email: 'james.osei@shell.com.gh', address: 'Independence Avenue, Accra', rating: 4, isActive: true, notes: null, createdAt: '', updatedAt: '' },
  { id: 5, name: 'TotalEnergies', type: 'fuel_station', contactPerson: 'Grace Adjei', phone: '+233 27 333 4455', email: 'grace.adjei@totalenergies.com', address: 'Kwame Nkrumah Circle, Accra', rating: 4, isActive: true, notes: 'Bulk fuel discount account', createdAt: '', updatedAt: '' },
  { id: 6, name: 'Bosch Auto Service', type: 'mechanic', contactPerson: 'Daniel Kofi', phone: '+233 24 777 8899', email: 'daniel@boschauto.gh', address: 'Osu, Accra', rating: 5, isActive: true, notes: 'Electrical and diagnostic specialist', createdAt: '', updatedAt: '' },
  { id: 7, name: 'Star Oil Depot', type: 'fuel_station', contactPerson: 'Patricia Mensah', phone: '+233 55 666 7788', email: 'patricia@staroil.gh', address: 'Tema Port, Tema', rating: 3, isActive: true, notes: 'Diesel bulk supply', createdAt: '', updatedAt: '' },
  { id: 8, name: 'SafeTow Services', type: 'towing', contactPerson: 'Yaw Boateng', phone: '+233 23 444 5566', email: 'yaw@sfetow.gh', address: 'Lapaz, Accra', rating: 4, isActive: true, notes: '24/7 emergency towing', createdAt: '', updatedAt: '' },
  { id: 9, name: 'AutoParts Ghana Ltd', type: 'parts_supplier', contactPerson: 'Akosua Sarpong', phone: '+233 21 555 6677', email: 'akosua@autopartsgh.com', address: 'Industrial Area, Tema', rating: 4, isActive: true, notes: 'General parts wholesaler', createdAt: '', updatedAt: '' },
  { id: 10, name: 'Stellar Insurance', type: 'insurance', contactPerson: 'Nana Yeboah', phone: '+233 24 888 9900', email: 'nana@stellarinsure.gh', address: 'Cantoments, Accra', rating: 3, isActive: true, notes: 'Fleet insurance provider', createdAt: '', updatedAt: '' },
  { id: 11, name: 'Metro Towing', type: 'towing', contactPerson: 'Kofi Annan', phone: '+233 50 222 3344', email: 'kofi@metrotow.gh', address: 'Madina, Accra', rating: 3, isActive: false, notes: 'On probation', createdAt: '', updatedAt: '' },
  { id: 12, name: 'Puma Energy', type: 'fuel_station', contactPerson: 'Esi Quansah', phone: '+233 27 111 2233', email: 'esi@pumaenergy.gh', address: 'Kaneshie, Accra', rating: 4, isActive: true, notes: null, createdAt: '', updatedAt: '' },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(DEMO_VENDORS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});

  useEffect(() => {
    vendorService.getAll().then(setVendors).catch(() => setVendors(DEMO_VENDORS));
  }, []);

  const stats = useMemo(() => {
    const total = vendors.length;
    const mechanics = vendors.filter(v => v.type === 'mechanic').length;
    const partsSuppliers = vendors.filter(v => v.type === 'parts_supplier').length;
    const fuelStations = vendors.filter(v => v.type === 'fuel_station').length;
    return { total, mechanics, partsSuppliers, fuelStations };
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    let list = vendors;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v => `${v.name} ${v.contactPerson} ${v.phone} ${v.email} ${v.address}`.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') list = list.filter(v => v.type === typeFilter);
    return list;
  }, [vendors, search, typeFilter]);

  const paginatedVendors = filteredVendors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / rowsPerPage));

  const handleAdd = () => {
    setEditVendor(null);
    setFormData({ name: '', type: 'other', contactPerson: '', phone: '', email: '', address: '', rating: 3, isActive: true, notes: '' });
    setShowForm(true);
  };

  const handleEdit = (v: Vendor) => {
    setEditVendor(v);
    setFormData({ ...v });
    setShowForm(true);
  };

  const handleDelete = (v: Vendor) => {
    if (!confirm(`Delete vendor "${v.name}"?`)) return;
    setVendors(prev => prev.filter(x => x.id !== v.id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editVendor) {
      setVendors(prev => prev.map(x => x.id === editVendor.id ? { ...x, ...formData } as Vendor : x));
    } else {
      const newVendor: Vendor = {
        id: Math.max(...vendors.map(x => x.id), 0) + 1,
        createdAt: '', updatedAt: '',
        ...formData as any,
      };
      setVendors(prev => [newVendor, ...prev]);
    }
    setShowForm(false);
  };

  const summaryCards = [
    { label: 'Total Vendors', value: stats.total, color: '#3b82f6', icon: 'ti-building' },
    { label: 'Mechanics', value: stats.mechanics, color: '#3b82f6', icon: 'ti-wrench' },
    { label: 'Parts Suppliers', value: stats.partsSuppliers, color: '#f59e0b', icon: 'ti-package' },
    { label: 'Fuel Stations', value: stats.fuelStations, color: '#22c55e', icon: 'ti-gas-station' },
  ];

  const renderStars = (rating: number | null) => {
    const r = rating || 0;
    const color = r >= 5 ? '#22c55e' : r >= 4 ? '#3b82f6' : r >= 3 ? '#f59e0b' : r >= 2 ? '#f97316' : '#ef4444';
    return <span style={{ color, fontSize: 14, letterSpacing: 1 }}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        Vendors & Suppliers
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
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
            <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search vendors..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 150, cursor: 'pointer' }}>
            <option value="all">All Types</option>
            <option value="mechanic">Mechanic</option>
            <option value="parts_supplier">Parts Supplier</option>
            <option value="fuel_station">Fuel Station</option>
            <option value="insurance">Insurance</option>
            <option value="towing">Towing</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button style={btnPrimary} onClick={handleAdd}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Add Vendor</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Name</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Contact</th>
                <th style={hdrStyle}>Phone</th>
                <th style={hdrStyle}>Email</th>
                <th style={hdrStyle}>Address</th>
                <th style={hdrStyle}>Rating</th>
                <th style={hdrStyle}>Status</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVendors.map(v => (
                <tr key={v.id} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, fontWeight: 600 }}>{v.name}</td>
                  <td style={cellStyle}>{badge(v.type.replace('_', ' '), TYPE_COLORS[v.type] || '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{v.contactPerson || '—'}</td>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{v.phone || '—'}</td>
                  <td style={{ ...cellStyle, fontSize: 12 }}>{v.email || '—'}</td>
                  <td style={{ ...cellStyle, fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.address || '—'}</td>
                  <td style={cellStyle}>{renderStars(v.rating)}</td>
                  <td style={cellStyle}>{v.isActive ? badge('Active', '#22c55e') : badge('Inactive', '#64748b')}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <button style={{ ...btn, padding: '4px 8px' }} onClick={() => handleEdit(v)}><i className="ti ti-edit" style={{ fontSize: 13 }}></i></button>
                      <button style={{ ...btn, padding: '4px 8px', color: 'var(--danger)' }} onClick={() => handleDelete(v)}><i className="ti ti-trash" style={{ fontSize: 13 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedVendors.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No vendors found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filteredVendors.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <i className="ti ti-chevron-left" style={{ fontSize: 14 }}></i>
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= totalPages - 1 ? 0.4 : 1 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <i className="ti ti-chevron-right" style={{ fontSize: 14 }}></i>
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 540, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editVendor ? 'Edit Vendor' : 'Add Vendor'}</div>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="ti ti-x"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Vendor Name</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select value={formData.type || 'other'} onChange={e => setFormData({ ...formData, type: e.target.value as Vendor['type'] })} style={inputStyle}>
                      <option value="mechanic">Mechanic</option>
                      <option value="parts_supplier">Parts Supplier</option>
                      <option value="fuel_station">Fuel Station</option>
                      <option value="insurance">Insurance</option>
                      <option value="towing">Towing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Person</label>
                    <input type="text" value={formData.contactPerson || ''} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input type="text" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Rating (1–5)</label>
                    <input type="number" min={1} max={5} value={formData.rating ?? 3} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
                      <input type="checkbox" checked={formData.isActive ?? true} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ accentColor: 'var(--accent)', width: 18, height: 18 }} />
                      Active
                    </label>
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
                  <i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i>
                  {editVendor ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
