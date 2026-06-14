import { useState, useEffect } from 'react';
import { kpiService, type KPI } from '../services/kpiService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>;
const catColors: Record<string, string> = { revenue: '#22c55e', operations: '#3b82f6', safety: '#ef4444', maintenance: '#f59e0b', driver: '#8b5cf6', fuel: '#ec4899', customer: '#14b8a6' };

export default function KPIPage() {
  const [data, setData] = useState<KPI[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<KPI | null>(null);
  const [form, setForm] = useState({ name: '', category: 'revenue', metricKey: '', unit: 'count', target: '', current: '', frequency: 'monthly', periodStart: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const DEMO_KPIS: KPI[] = [
    { id: 1, name: 'Daily Revenue Target', category: 'revenue', metricKey: 'daily_revenue', unit: 'amount', target: 5000, current: 4750, previousValue: null, frequency: 'daily', periodStart: '2026-06-01', periodEnd: null, organizationUnitId: null, driverId: null, vehicleId: null, isActive: true, notes: 'GHS target per day' },
    { id: 2, name: 'On-Time Delivery Rate', category: 'operations', metricKey: 'ontime_rate', unit: 'percentage', target: 95, current: 92, previousValue: null, frequency: 'monthly', periodStart: '2026-06-01', periodEnd: null, organizationUnitId: null, driverId: null, vehicleId: null, isActive: true, notes: '' },
    { id: 3, name: 'Accident-Free Days', category: 'safety', metricKey: 'accident_free', unit: 'count', target: 365, current: 183, previousValue: null, frequency: 'yearly', periodStart: '2026-01-01', periodEnd: null, organizationUnitId: null, driverId: null, vehicleId: null, isActive: true, notes: '' },
    { id: 4, name: 'Fleet Fuel Efficiency', category: 'fuel', metricKey: 'fuel_kmpl', unit: 'km', target: 8.5, current: 7.8, previousValue: null, frequency: 'monthly', periodStart: '2026-06-01', periodEnd: null, organizationUnitId: null, driverId: null, vehicleId: null, isActive: true, notes: 'km per litre' },
    { id: 5, name: 'Vehicle Uptime', category: 'maintenance', metricKey: 'uptime_pct', unit: 'percentage', target: 98, current: 95, previousValue: null, frequency: 'monthly', periodStart: '2026-06-01', periodEnd: null, organizationUnitId: null, driverId: null, vehicleId: null, isActive: true, notes: '' },
    { id: 6, name: 'Driver Score Average', category: 'driver', metricKey: 'driver_score', unit: 'percentage', target: 90, current: 85, previousValue: null, frequency: 'monthly', periodStart: '2026-06-01', periodEnd: null, organizationUnitId: null, driverId: null, vehicleId: null, isActive: true, notes: '' },
    { id: 7, name: 'Customer Satisfaction', category: 'customer', metricKey: 'csat', unit: 'percentage', target: 92, current: 88, previousValue: null, frequency: 'monthly', periodStart: '2026-06-01', periodEnd: null, organizationUnitId: null, driverId: null, vehicleId: null, isActive: true, notes: '' },
  ];
  const DEMO_DASHBOARD = { totals: { avgTarget: 92.6, avgCurrent: 85.2, avgAchievement: 89.1 } };

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); const [kpis, dash] = await Promise.all([kpiService.getAll(), kpiService.getDashboard()]); setData(kpis.length ? kpis : DEMO_KPIS); setDashboard(dash?.totals ? dash : DEMO_DASHBOARD); }
    catch (err: any) { setData(DEMO_KPIS); setDashboard(DEMO_DASHBOARD); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ name: '', category: 'revenue', metricKey: '', unit: 'count', target: '', current: '', frequency: 'monthly', periodStart: '', notes: '' }); setFormError(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const d: any = { ...form, target: form.target ? Number(form.target) : null, current: form.current ? Number(form.current) : null };
      if (editItem) await kpiService.update(editItem.id, d);
      else await kpiService.create(d);
      await load(); setShowModal(false);
    } catch (err: any) { setFormError(err.response?.data?.message || err.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (k: KPI) => {
    if (!confirm(`Delete KPI "${k.name}"?`)) return;
    try { await kpiService.delete(k.id); await load(); }
    catch (err: any) { setError(err.message || 'Delete failed'); }
  };

  const filtered = data.filter(k => {
    const s = search.toLowerCase();
    return (!s || k.name.toLowerCase().includes(s) || k.metricKey.includes(s)) && (catFilter === 'all' || k.category === catFilter);
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div>
      {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
        <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total KPIs', value: data.length, color: '#8b5cf6', icon: 'ti-chart-bar' },
          { label: 'Revenue', value: data.filter(k => k.category === 'revenue').length, color: '#22c55e', icon: 'ti-currency-dollar' },
          { label: 'Safety', value: data.filter(k => k.category === 'safety').length, color: '#ef4444', icon: 'ti-shield' },
          { label: 'Operations', value: data.filter(k => k.category === 'operations').length, color: '#3b82f6', icon: 'ti-settings' },
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

      {dashboard?.totals && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Aggregate</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { label: 'Avg Target', value: dashboard.totals.avgTarget?.toFixed(1) || 0, color: '#3b82f6' },
              { label: 'Avg Current', value: dashboard.totals.avgCurrent?.toFixed(1) || 0, color: '#22c55e' },
              { label: 'Avg Achievement', value: `${dashboard.totals.avgAchievement?.toFixed(1) || 0}%`, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search KPIs..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 200 }} />
          </div>
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 140, padding: '8px 10px' }}>
            <option value="all">All Categories</option>
            <option value="revenue">Revenue</option>
            <option value="operations">Operations</option>
            <option value="safety">Safety</option>
            <option value="maintenance">Maintenance</option>
            <option value="driver">Driver</option>
            <option value="fuel">Fuel</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add KPI</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Name</th>
                <th style={hdrStyle}>Category</th>
                <th style={hdrStyle}>Metric Key</th>
                <th style={hdrStyle}>Target</th>
                <th style={hdrStyle}>Current</th>
                <th style={hdrStyle}>Achievement</th>
                <th style={hdrStyle}>Frequency</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(k => {
                const ach = k.target ? ((k.current || 0) / k.target) * 100 : 0;
                const achColor = ach >= 90 ? '#22c55e' : ach >= 70 ? '#f59e0b' : '#ef4444';
                return (
                  <tr key={k.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...cellStyle, fontWeight: 600 }}>{k.name}</td>
                    <td style={cellStyle}>{badge(k.category, catColors[k.category] || '#5c6f8a')}</td>
                    <td style={cellStyle}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{k.metricKey}</span></td>
                    <td style={cellStyle}>{k.target ?? '-'}</td>
                    <td style={cellStyle}>{k.current ?? '-'}</td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 50, height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, ach)}%`, height: '100%', background: achColor, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: achColor }}>{ach.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ ...cellStyle, fontSize: 12 }}>{k.frequency}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(k)}><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No KPIs found</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows: </span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: 70, padding: '4px 8px', fontSize: 12 }}>
              <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
            </select>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="las la-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 }} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="las la-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Add KPI</div>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={labelStyle}>Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Metric Key</label><input required value={form.metricKey} onChange={e => setForm({ ...form, metricKey: e.target.value })} placeholder="e.g. daily_revenue" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    <option value="revenue">Revenue</option><option value="operations">Operations</option><option value="safety">Safety</option>
                    <option value="maintenance">Maintenance</option><option value="driver">Driver</option><option value="fuel">Fuel</option><option value="customer">Customer</option>
                  </select></div>
                  <div><label style={labelStyle}>Unit</label><select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inputStyle}>
                    <option value="count">Count</option><option value="amount">Amount</option><option value="percentage">Percentage</option><option value="hours">Hours</option><option value="km">KM</option>
                  </select></div>
                  <div><label style={labelStyle}>Target</label><input type="number" step="0.01" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Current</label><input type="number" step="0.01" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Frequency</label><select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} style={inputStyle}>
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option>
                  </select></div>
                  <div><label style={labelStyle}>Period Start</label><input required type="date" value={form.periodStart} onChange={e => setForm({ ...form, periodStart: e.target.value })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={inputStyle} /></div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="las la-spinner" style={{ animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
