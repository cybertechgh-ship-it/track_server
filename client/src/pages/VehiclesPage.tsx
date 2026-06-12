import { useState, useEffect, useRef } from 'react';
import { vehicleService } from '../services/vehicleService';
import { uploadService } from '../services/uploadService';
import type { Vehicle, DrivingSession } from '../types';

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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sessions, setSessions] = useState<DrivingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editV, setEditV] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ plateNumber: '', brand: '', model: '', year: new Date().getFullYear(), esp32DeviceId: '', photo: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); loadSessions(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); setVehicles(await vehicleService.getAll()); }
    catch (err: any) { setError(err.message || 'Failed to load vehicles'); }
    finally { setLoading(false); }
  };
  const loadSessions = async () => {
    try { setSessions(await vehicleService.getActiveSessions()); }
    catch { /* ignore */ }
  };

  const inUse = (id: number) => sessions.some(s => s.vehicleId === id);

  const openAdd = () => { setEditV(null); setForm({ plateNumber: '', brand: '', model: '', year: new Date().getFullYear(), esp32DeviceId: '', photo: '' }); setFormError(null); setShowModal(true); };
  const openEdit = (v: Vehicle) => { setEditV(v); setForm({ plateNumber: v.plateNumber, brand: v.brand, model: v.model, year: v.year, esp32DeviceId: v.esp32DeviceId, photo: v.photo || '' }); setFormError(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      if (editV) await vehicleService.update(editV.id, form);
      else await vehicleService.create(form);
      await load(); await loadSessions(); setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadService.vehicleImage(file);
      setForm({ ...form, photo: url });
    } catch {
      setFormError('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (v: Vehicle) => {
    if (!window.confirm(`Delete vehicle ${v.plateNumber}?`)) return;
    try { await vehicleService.delete(v.id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = `${v.plateNumber} ${v.brand} ${v.model} ${v.esp32DeviceId}`.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && v.isActive) || (filterStatus === 'inactive' && !v.isActive);
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const badge = (label: string, color: string) => (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="ti ti-alert-triangle" style={{ marginRight: 6 }}></i>{error}</span>
          <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Vehicles', value: vehicles.length, color: '#3b82f6', icon: 'ti-truck' },
          { label: 'Active', value: vehicles.filter(v => v.isActive).length, color: '#22c55e', icon: 'ti-check' },
          { label: 'In Use', value: sessions.length, color: '#f59e0b', icon: 'ti-player-play' },
          { label: 'Available', value: vehicles.filter(v => v.isActive && !inUse(v.id)).length, color: '#06b6d4', icon: 'ti-parking' },
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
            <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 240 }} />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); setPage(0); }} style={{ ...inputStyle, width: 120, cursor: 'pointer' }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Add Vehicle</button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ ...hdrStyle, width: 60 }}>Image</th>
                <th style={hdrStyle}>Vehicle</th>
                <th style={hdrStyle}>Brand / Model</th>
                <th style={hdrStyle}>Year</th>
                <th style={hdrStyle}>Device ID</th>
                <th style={hdrStyle}>Status</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => (
                <tr key={v.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, width: 60 }}>
                    {v.photo ? (
                      <img src={v.photo} alt={v.plateNumber} style={{ width: 50, height: 36, borderRadius: 6, objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style'); }}
                      />
                    ) : null}
                    <div style={{ width: 50, height: 36, borderRadius: 6, background: v.isActive ? 'rgba(59,130,246,0.15)' : 'var(--bg3)', display: v.photo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-truck" style={{ fontSize: 16, color: v.isActive ? '#3b82f6' : 'var(--text3)' }}></i>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v.plateNumber}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>ID: {v.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div style={{ fontWeight: 500 }}>{v.brand}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.model}</div>
                  </td>
                  <td style={cellStyle}>{badge(String(v.year), '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{v.esp32DeviceId}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {badge(v.isActive ? 'Active' : 'Inactive', v.isActive ? '#22c55e' : '#5c6f8a')}
                      {inUse(v.id) && badge('In Use', '#f59e0b')}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEdit(v)}>
                        <i className="ti ti-edit" style={{ fontSize: 14 }}></i>
                      </button>
                      <button style={{ ...btn, padding: '5px 10px', color: inUse(v.id) ? 'var(--text3)' : 'var(--danger)' }} onClick={() => handleDelete(v)} disabled={inUse(v.id)}>
                        <i className="ti ti-trash" style={{ fontSize: 14 }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No vehicles found</td></tr>
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
              <i className="ti ti-chevron-left" style={{ fontSize: 14 }}></i>
            </button>
            <span>{page + 1} / {Math.max(1, totalPages)}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= totalPages - 1 ? 0.4 : 1 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <i className="ti ti-chevron-right" style={{ fontSize: 14 }}></i>
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
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editV ? 'Edit Vehicle' : 'Add Vehicle'}</div>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && (
                  <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}>
                    <i className="ti ti-alert-triangle" style={{ marginRight: 6 }}></i>{formError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Plate Number</label>
                    <input required value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} placeholder="34 ABC 123" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Device ID</label>
                    <input required value={form.esp32DeviceId} onChange={e => setForm({ ...form, esp32DeviceId: e.target.value })} placeholder="ESP32_001" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Brand</label>
                    <input required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Toyota" style={inputStyle} list="brands" />
                    <datalist id="brands">
                      {['Toyota', 'Honda', 'Ford', 'Volkswagen', 'Renault', 'Fiat', 'Hyundai', 'Peugeot', 'Opel', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Skoda'].map(b => <option key={b} value={b} />)}
                    </datalist>
                  </div>
                  <div>
                    <label style={labelStyle}>Model</label>
                    <input required value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Corolla" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Year</label>
                    <input type="number" required value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} min={1990} max={2027} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Image (optional)</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button type="button" onClick={() => fileRef.current?.click()} style={{ ...btn, padding: '8px 14px', fontSize: 12 }}>
                        <i className="ti ti-upload" style={{ fontSize: 14 }}></i>
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>or</span>
                      <input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} placeholder="https://placehold.co/400x250... (URL)" style={inputStyle} />
                      {form.photo && (
                        <img src={form.photo} alt="preview" style={{ width: 48, height: 34, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="ti ti-loader" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i>}
                  {editV ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
