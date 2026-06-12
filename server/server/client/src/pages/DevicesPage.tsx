import { useState, useEffect } from 'react';
import { deviceService } from '../services/deviceService';
import type { Device } from '../services/deviceService';

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

const badge = (label: string, color: string, bg?: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg || `${color}18`, color }}>{label}</span>
);

const signalLabel = (level: number) => {
  if (level >= 5) return 'Strong';
  if (level >= 3) return 'Fair';
  if (level >= 1) return 'Weak';
  return 'No signal';
};
const signalColorFn = (level: number) => {
  if (level >= 4) return '#22c55e';
  if (level >= 2) return '#f59e0b';
  if (level >= 1) return '#ef4444';
  return '#5c6f8a';
};
const statusCfg = (d: Device) => {
  if (!d.isOnline) return { label: 'Offline', color: '#5c6f8a' };
  if (d.signal <= 1) return { label: 'Weak', color: '#f59e0b' };
  return { label: 'Online', color: '#22c55e' };
};

const BatBar = ({ level }: { level: number }) => {
  const c = level > 50 ? '#22c55e' : level > 20 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 50, height: 6, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: c, width: `${level}%` }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{level}%</span>
    </div>
  );
};

const SignalBars = ({ level }: { level: number }) => (
  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <div key={s} style={{
        width: 4, height: s * 3 + 4, borderRadius: 2,
        background: s <= level ? signalColorFn(level) : 'var(--border2)',
      }} />
    ))}
  </div>
);

const timeAgo = (dateStr: string | null) => {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [editD, setEditD] = useState<Device | null>(null);
  const [form, setForm] = useState({ imei: '', name: '', protocol: '', firmware: '', signal: 3, battery: 100, simStatus: 'Active', isOnline: true, vehicleId: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); setDevices(await deviceService.getAll()); }
    catch (err: any) { setError(err.message || 'Failed to load devices'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditD(null);
    setForm({ imei: '', name: '', protocol: '', firmware: '', signal: 3, battery: 100, simStatus: 'Active', isOnline: true, vehicleId: '' });
    setFormError(null); setShowModal(true);
  };
  const openEdit = (d: Device) => {
    setEditD(d);
    setForm({ imei: d.imei, name: d.name, protocol: d.protocol, firmware: d.firmware, signal: d.signal, battery: d.battery, simStatus: d.simStatus, isOnline: d.isOnline, vehicleId: d.vehicleId?.toString() || '' });
    setFormError(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const body = { ...form, vehicleId: form.vehicleId ? parseInt(form.vehicleId) : null };
      if (editD) await deviceService.update(editD.id, body);
      else await deviceService.create(body);
      await load(); setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (d: Device) => {
    if (!window.confirm(`Delete device ${d.name}?`)) return;
    try { await deviceService.delete(d.id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const totalPages = Math.ceil(devices.length / rowsPerPage);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && (
        <div style={{ marginBottom: 0, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="ti ti-alert-triangle" style={{ marginRight: 6 }}></i>{error}</span>
          <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Device Management</div>
            <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'var(--success)', color: '#00221c', letterSpacing: '0.5px' }}>LIVE</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>GPS hardware health, signal monitoring and diagnostics</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            <i className="ti ti-bell" style={{ fontSize: 14 }}></i> Alerts 7
          </span>
          <button style={btn} onClick={() => window.location.href = '/vehicles'}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Add Vehicle</button>
          <button style={btnPrimary} onClick={openAdd}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Add Device</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Devices', value: devices.length, color: '#3b82f6', icon: 'ti-devices' },
          { label: 'Online', value: devices.filter(d => d.isOnline && d.signal > 1).length, color: '#22c55e', icon: 'ti-wifi' },
          { label: 'Weak Signal', value: devices.filter(d => d.isOnline && d.signal <= 1).length, color: '#f59e0b', icon: 'ti-signal-4g' },
          { label: 'Offline', value: devices.filter(d => !d.isOnline).length, color: '#5c6f8a', icon: 'ti-wifi-off' },
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

      {/* Device Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {devices.map(d => {
          const st = statusCfg(d);
          const sc = st.color;
          return (
            <div key={d.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
              padding: 16, transition: 'all 0.15s',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: d.isOnline ? 'linear-gradient(90deg, var(--accent), #00e5c8)' : 'var(--border2)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: d.isOnline ? 'rgba(0,201,167,0.12)' : 'var(--bg3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="ti ti-device-watch" style={{ fontSize: 20, color: d.isOnline ? 'var(--accent)' : 'var(--text3)' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.3px' }}>
                      {d.imei.slice(0, 8)}&hellip;{d.imei.slice(-3)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{d.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: `${sc}18`, color: sc,
                  }}>
                    <span style={{
                      display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                      background: sc, marginRight: 4, verticalAlign: 'middle',
                      animation: st.label === 'Online' ? 'pulse 1.5s infinite' : 'none',
                    }} />
                    {st.label}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SignalBars level={d.signal} />
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Signal {d.signal}/5</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                  <i className="ti ti-battery" style={{
                    fontSize: 14, color: d.battery > 50 ? '#22c55e' : d.battery > 20 ? '#f59e0b' : '#ef4444',
                  }}></i>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{d.battery}% battery</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ti ti-truck" style={{ fontSize: 12 }}></i>
                  {d.vehicle ? (
                    <span style={{ fontWeight: 600, color: 'var(--text2)' }}>{d.vehicle.plateNumber}</span>
                  ) : (
                    <span style={{ fontStyle: 'italic', fontSize: 11 }}>Not assigned</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ ...btn, padding: '5px 10px', fontSize: 11 }} onClick={() => openEdit(d)}>
                    <i className="ti ti-edit" style={{ fontSize: 12 }}></i>
                  </button>
                  <button style={{ ...btn, padding: '5px 10px', fontSize: 11, color: 'var(--danger)' }} onClick={() => handleDelete(d)}>
                    <i className="ti ti-trash" style={{ fontSize: 12 }}></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Device Diagnostics Log */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-activity" style={{ color: 'var(--accent)' }}></i> Device Diagnostics Log
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  <th style={hdrStyle}>IMEI</th>
                  <th style={hdrStyle}>Protocol</th>
                  <th style={hdrStyle}>Last Ping</th>
                  <th style={hdrStyle}>Battery</th>
                  <th style={hdrStyle}>Signal</th>
                  <th style={hdrStyle}>SIM Status</th>
                  <th style={hdrStyle}>Firmware</th>
                  <th style={{ ...hdrStyle, textAlign: 'center', width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(d => (
                  <tr key={d.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600 }}>{d.imei}</td>
                    <td style={cellStyle}>
                      <span style={{ padding: '2px 10px', borderRadius: 4, background: 'var(--bg3)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: 'var(--accent)' }}>{d.protocol}</span>
                    </td>
                    <td style={{ ...cellStyle, fontSize: 12, color: timeAgo(d.lastPing) === 'Just now' ? '#22c55e' : 'var(--text3)' }}>{timeAgo(d.lastPing)}</td>
                    <td style={cellStyle}><BatBar level={d.battery} /></td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SignalBars level={d.signal} />
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: d.signal === 0 ? '#5c6f8a' : signalColorFn(d.signal),
                        }}>
                          {d.signal === 0 ? 'Offline' : signalLabel(d.signal)}
                        </span>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      {d.simStatus === 'Active' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} /> Active
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(92,111,138,0.12)', color: '#5c6f8a' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#5c6f8a' }} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={cellStyle}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'var(--bg3)' }}>{d.firmware}</span>
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        <button style={{ ...btn, padding: '4px 10px' }} onClick={() => openEdit(d)} title="Edit">
                          <i className="ti ti-edit" style={{ fontSize: 14 }}></i>
                        </button>
                        <button style={{ ...btn, padding: '4px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(d)} title="Delete">
                          <i className="ti ti-trash" style={{ fontSize: 14 }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {devices.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No devices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {devices.length > rowsPerPage && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)', gap: 8 }}>
              <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <i className="ti ti-chevron-left" style={{ fontSize: 14 }}></i>
              </button>
              <span>{page + 1} / {Math.max(1, totalPages)}</span>
              <button style={{ ...btn, padding: '4px 10px', opacity: page >= totalPages - 1 ? 0.4 : 1 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <i className="ti ti-chevron-right" style={{ fontSize: 14 }}></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editD ? 'Edit Device' : 'Add Device'}</div>
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
                    <label style={labelStyle}>IMEI</label>
                    <input required value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })} placeholder="863456032114551" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Device Name</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="GT06N-001" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Protocol</label>
                    <input required value={form.protocol} onChange={e => setForm({ ...form, protocol: e.target.value })} placeholder="GT06N" style={inputStyle} list="protocols" />
                    <datalist id="protocols">
                      {['GT06N', 'Teltonika', 'Concox', 'Queclink'].map(p => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                  <div>
                    <label style={labelStyle}>Firmware</label>
                    <input value={form.firmware} onChange={e => setForm({ ...form, firmware: e.target.value })} placeholder="v3.2.1" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Signal ({form.signal}/5)</label>
                    <input type="range" min={0} max={5} value={form.signal} onChange={e => setForm({ ...form, signal: parseInt(e.target.value) })} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Battery ({form.battery}%)</label>
                    <input type="range" min={0} max={100} value={form.battery} onChange={e => setForm({ ...form, battery: parseInt(e.target.value) })} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>SIM Status</label>
                    <select value={form.simStatus} onChange={e => setForm({ ...form, simStatus: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={form.isOnline ? 'online' : 'offline'} onChange={e => setForm({ ...form, isOnline: e.target.value === 'online' })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="ti ti-loader" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i>}
                  {editD ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
