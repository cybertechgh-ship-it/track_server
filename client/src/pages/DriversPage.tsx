import { useState, useEffect, useRef } from 'react';
import { driverService } from '../services/driverService';
import { uploadService } from '../services/uploadService';
import api from '../services/api';
import type { Driver } from '../types';
import { UNIQUE_DRIVER_PHOTOS, getStablePhoto } from '../constants/photos';
import { CYTRACK_LOGO } from '../constants/logo';
import { AnimatedDetailModal, type DetailSection } from '../components/layout/AnimatedDetailModal';

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

const tabs = [
  { id: 'all', label: 'All Drivers', icon: 'ti-users' },
  { id: 'top', label: 'Top Performers', icon: 'ti-star' },
  { id: 'risk', label: 'At Risk', icon: 'ti-alert-triangle' },
  { id: 'license', label: 'License Expiring', icon: 'ti-id-badge' },
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editD, setEditD] = useState<Driver | null>(null);
  const [form, setForm] = useState({ rfidCardId: '', firstName: '', lastName: '', phone: '', email: '', photo: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [gridView, setGridView] = useState(true);
  const [renewModal, setRenewModal] = useState<Driver | null>(null);
  const [renewForm, setRenewForm] = useState({ licenseExpiry: '', licenseNumber: '' });
  const [renewLoading, setRenewLoading] = useState(false);
  const [detailDriver, setDetailDriver] = useState<Driver | null>(null);
  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); setDrivers(await driverService.getAll()); }
    catch (err: any) { setError(err.message || 'Failed to load drivers'); }
    finally { setLoading(false); }
  };

  const getDriverPhoto = (d: Driver) => d.photo || getStablePhoto(d.id, `${d.firstName} ${d.lastName}`, UNIQUE_DRIVER_PHOTOS);

  const openAdd = () => { setEditD(null); setForm({ rfidCardId: '', firstName: '', lastName: '', phone: '', email: '', photo: '' }); setFormError(null); setShowModal(true); };
  const openEdit = (d: Driver) => { setEditD(d); setForm({ rfidCardId: d.rfidCardId, firstName: d.firstName, lastName: d.lastName, phone: d.phone, email: d.email || '', photo: d.photo || '' }); setFormError(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      if (editD) await driverService.update(editD.id, form);
      else await driverService.create(form);
      await load(); setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadService.driverImage(file);
      setForm({ ...form, photo: url });
    } catch {
      setFormError('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (d: Driver) => {
    if (!window.confirm(`Delete driver ${d.firstName} ${d.lastName}?`)) return;
    try { await driverService.delete(d.id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const getScore = (d: Driver) => {
    let score = 75;
    if (d.phone) score += 5;
    if (d.email) score += 5;
    if (d.photo) score += 5;
    if (d.licenseNumber) score += 5;
    if (d.licenseExpiry && new Date(d.licenseExpiry) > new Date()) score += 5;
    return Math.min(100, score);
  };

  const isLicenseExpiring = (d: Driver) => {
    if (!d.licenseExpiry) return false;
    const expiry = new Date(d.licenseExpiry);
    const soon = new Date(Date.now() + 30 * 86400000);
    return expiry > new Date() && expiry <= soon;
  };

  const isLicenseExpired = (d: Driver) => {
    if (!d.licenseExpiry) return false;
    return new Date(d.licenseExpiry) < new Date();
  };

  const licenseExpiringCount = drivers.filter(d => isLicenseExpiring(d) || isLicenseExpired(d)).length;

  const filtered = drivers.filter(d => {
    const text = `${d.firstName} ${d.lastName} ${d.phone} ${d.email} ${d.rfidCardId}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    if (!matchesSearch) return false;
    const score = getScore(d);
    if (activeTab === 'top') return score >= 90;
    if (activeTab === 'risk') return score < 70;
    if (activeTab === 'license') return isLicenseExpiring(d) || isLicenseExpired(d);
    return true;
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
        <img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        Drivers
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
          { label: 'Total Drivers', value: drivers.length, color: '#3b82f6', icon: 'ti-users' },
          { label: 'Active', value: drivers.filter(d => d.isActive).length, color: '#22c55e', icon: 'ti-check' },
          { label: 'Top Performers', value: drivers.filter(d => getScore(d) >= 90).length, color: '#f59e0b', icon: 'ti-star' },
          { label: 'At Risk', value: drivers.filter(d => getScore(d) < 70).length, color: '#ef4444', icon: 'ti-alert-triangle' },
          { label: 'License Expiring', value: licenseExpiringCount, color: '#f59e0b', icon: 'ti-id-badge' },
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

      {/* Tabs */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, display: 'flex', overflow: 'hidden' }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => { setActiveTab(t.id); setPage(0); }}
            style={{
              flex: 1, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              background: activeTab === t.id ? 'rgba(0,201,167,0.04)' : 'transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text3)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize: 14 }}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 260 }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setGridView(true)} style={{
              ...btn, padding: '6px 10px', background: gridView ? 'rgba(0,201,167,0.1)' : 'var(--bg3)',
              color: gridView ? 'var(--accent)' : 'var(--text2)',
            }}><i className="las la-th" style={{ fontSize: 14 }}></i></button>
            <button onClick={() => setGridView(false)} style={{
              ...btn, padding: '6px 10px', background: !gridView ? 'rgba(0,201,167,0.1)' : 'var(--bg3)',
              color: !gridView ? 'var(--accent)' : 'var(--text2)',
            }}><i className="las la-list" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Driver</button>
      </div>

      {gridView ? (
        /* Card grid view */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {paginated.map(d => {
            const score = getScore(d);
            const scoreColor = score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';
            return (
              <div key={d.id} onClick={() => setDetailDriver(d)} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
                overflow: 'hidden', transition: 'all 0.15s', cursor: 'pointer',
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                {/* Gradient header */}
                <div style={{
                  height: 60,
                  background: `linear-gradient(135deg, ${scoreColor}33, ${scoreColor}11)`,
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', bottom: -24, left: 16,
                    width: 48, height: 48, borderRadius: '50%',
                    border: '3px solid var(--bg2)',
                    overflow: 'hidden', background: 'var(--bg3)',
                  }}>
                    {getDriverPhoto(d) ? (
                      <img src={getDriverPhoto(d)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                        {d.firstName[0]}{d.lastName[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '28px 16px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{d.firstName} {d.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>ID: {d.id}</span> &middot; {d.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{score}</span>
                  </div>
                  {d.licenseExpiry && (
                    <div style={{ marginBottom: 8 }}>
                      {isLicenseExpired(d) ? (
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                          License Expired {new Date(d.licenseExpiry).toLocaleDateString()}
                        </span>
                      ) : isLicenseExpiring(d) ? (
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                          License Expires {new Date(d.licenseExpiry).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                          License: {new Date(d.licenseExpiry).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...btn, padding: '5px 12px', fontSize: 11, flex: 1, justifyContent: 'center' }} onClick={() => openEdit(d)}>
                      <i className="las la-edit" style={{ fontSize: 13 }}></i> Edit
                    </button>
                    <button style={{ ...btn, padding: '5px 12px', fontSize: 11, flex: 1, justifyContent: 'center', color: '#f59e0b' }} onClick={() => { setRenewModal(d); setRenewForm({ licenseExpiry: d.licenseExpiry || '', licenseNumber: d.licenseNumber || '' }); }}>
                      <i className="las la-id-card-badge" style={{ fontSize: 13 }}></i> License
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No drivers found</div>
          )}
        </div>
      ) : (
        /* Table view */
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  <th style={{ ...hdrStyle, width: 60 }}>Photo</th>
                  <th style={hdrStyle}>Driver</th>
                  <th style={hdrStyle}>Contact</th>
                  <th style={hdrStyle}>RFID Card</th>
                  <th style={hdrStyle}>Score</th>
                  <th style={hdrStyle}>License</th>
                  <th style={hdrStyle}>Status</th>
                  <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(d => {
                  const score = getScore(d);
                  const scoreColor = score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={d.id} onClick={() => setDetailDriver(d)} style={{ transition: 'background 0.1s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...cellStyle, width: 60 }}>
                        {getDriverPhoto(d) ? (
                          <img src={getDriverPhoto(d)} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style'); }}
                          />
                        ) : null}
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0d9488', display: getDriverPhoto(d) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                          {d.firstName[0]}{d.lastName[0]}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 600 }}>{d.firstName} {d.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>ID: {d.id}</div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <i className="las la-phone" style={{ fontSize: 12, color: 'var(--text3)' }}></i>
                          <span>{d.phone}</span>
                        </div>
                        {d.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <i className="las la-envelope" style={{ fontSize: 12, color: 'var(--text3)' }}></i>
                            <span>{d.email}</span>
                          </div>
                        )}
                      </td>
                      <td style={cellStyle}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'var(--bg3)' }}>
                          {d.rfidCardId}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 50, height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 2 }} />
                          </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{score}</span>
                          </div>
                        </td>
                        <td style={cellStyle}>
                          {d.licenseExpiry ? (
                            isLicenseExpired(d) ? (
                              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Expired</span>
                            ) : isLicenseExpiring(d) ? (
                              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{new Date(d.licenseExpiry).toLocaleDateString()}</span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(d.licenseExpiry).toLocaleDateString()}</span>
                            )
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text3)' }}>-</span>
                          )}
                        </td>
                        <td style={cellStyle}>
                          {badge(d.isActive ? 'Active' : 'Inactive', d.isActive ? '#22c55e' : '#5c6f8a')}
                        </td>
                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                            <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEdit(d)} title="Edit">
                              <i className="las la-edit" style={{ fontSize: 14 }}></i>
                            </button>
                            <button style={{ ...btn, padding: '5px 10px', color: '#f59e0b' }} onClick={() => { setRenewModal(d); setRenewForm({ licenseExpiry: d.licenseExpiry || '', licenseNumber: d.licenseNumber || '' }); }} title="License">
                              <i className="las la-id-card-badge" style={{ fontSize: 14 }}></i>
                            </button>
                            <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(d)} title="Delete">
                              <i className="las la-trash-alt" style={{ fontSize: 14 }}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                );
              })}
              {paginated.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No drivers found</td></tr>
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
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editD ? 'Edit Driver' : 'Add Driver'}</div>
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
                    <label style={labelStyle}>RFID Card ID</label>
                    <input required value={form.rfidCardId} onChange={e => setForm({ ...form, rfidCardId: e.target.value })} placeholder="RFID_001" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="John" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+233 XX XXX XXXX" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email (optional)</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Photo (optional)</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button type="button" onClick={() => fileRef.current?.click()} style={{ ...btn, padding: '8px 14px', fontSize: 12 }}>
                        <i className="las la-upload" style={{ fontSize: 14 }}></i>
                        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>or</span>
                      <input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} placeholder="https://... (URL)" style={inputStyle} />
                      {form.photo && (
                        <img src={form.photo} alt="preview" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
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
                  {formLoading ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editD ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew License Modal */}
      {renewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={() => setRenewModal(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 440, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Renew License â€” {renewModal.firstName} {renewModal.lastName}</div>
              <button onClick={() => setRenewModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                <i className="las la-times"></i>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault(); setRenewLoading(true);
              try {
                await api.put(`/drivers/${renewModal.id}/renew-license`, renewForm);
                await load(); setRenewModal(null);
              } catch { alert('Failed to renew license'); }
              finally { setRenewLoading(false); }
            }}>
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>License Number</label>
                  <input value={renewForm.licenseNumber} onChange={e => setRenewForm({...renewForm, licenseNumber: e.target.value})} placeholder="GH-123456" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input type="date" value={renewForm.licenseExpiry} onChange={e => setRenewForm({...renewForm, licenseExpiry: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setRenewModal(null)}>Cancel</button>
                <button type="submit" disabled={renewLoading} style={{ ...btnPrimary, opacity: renewLoading ? 0.6 : 1 }}>
                  {renewLoading ? 'Saving...' : 'Renew License'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AnimatedDetailModal
        open={!!detailDriver}
        onClose={() => setDetailDriver(null)}
        title={detailDriver ? `${detailDriver.firstName} ${detailDriver.lastName}` : ''}
        subtitle={detailDriver ? `Driver #${detailDriver.id}` : undefined}
        icon="steering-wheel"
        iconBg="rgba(0,201,167,0.12)"
        iconColor="var(--accent)"
        accent="var(--accent)"
        sections={
          detailDriver ? [
            { title: 'Personal Info', icon: 'user', iconColor: '#3b82f6', fields: [
              { label: 'Full Name', value: `${detailDriver.firstName} ${detailDriver.lastName}`, icon: 'user' },
              { label: 'Phone', value: detailDriver.phone, icon: 'phone', mono: true },
              { label: 'Email', value: detailDriver.email || 'Not set', icon: 'mail' },
              { label: 'RFID Card', value: detailDriver.rfidCardId || 'Not assigned', icon: 'id', mono: true },
            ]},
            { title: 'License', icon: 'id-badge', iconColor: '#f59e0b', fields: [
              { label: 'License Number', value: detailDriver.licenseNumber || 'Not set', icon: 'bookmark', mono: true },
              { label: 'License Expiry', value: detailDriver.licenseExpiry ? new Date(detailDriver.licenseExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set', icon: 'calendar', color: detailDriver.licenseExpiry && new Date(detailDriver.licenseExpiry) < new Date(Date.now() + 30*86400000) ? '#ef4444' : undefined },
              { label: 'Status', value: detailDriver.isActive ? 'Active' : 'Inactive', icon: 'circle-check', badge: true, badgeColor: detailDriver.isActive ? '#22c55e' : '#5c6f8a' },
            ]},
            { title: 'System', icon: 'settings', iconColor: '#8b5cf6', fields: [
              { label: 'Driver ID', value: `#${detailDriver.id}`, icon: 'hashtag', mono: true },
              { label: 'Created', value: new Date(detailDriver.createdAt).toLocaleDateString('en-GB'), icon: 'clock' },
            ]},
          ] : []
        }
      />
    </div>
  );
}
