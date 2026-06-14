import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { printReport } from '../utils/printDocument';
import api from '../services/api';

interface ReportType { value: string; label: string }
interface ReportUser { id: number; firstName: string; lastName: string; email: string }
interface Report {
  id: number; name: string; type: string; filePath: string; fileSize: number;
  format: string; generatedById: number; status: string; isArchived: boolean;
  createdAt: string; updatedAt: string; generatedBy?: ReportUser;
}

interface DashboardStats {
  totalReports: number; thisMonth: number; totalStorage: number;
  archivedCount: number; recent: Report[];
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

const REPORT_TYPE_COLORS: Record<string, string> = {
  executive_summary: '#3b82f6', fleet_performance: '#22c55e', vehicle_tracking: '#f59e0b',
  driver_performance: '#8b5cf6', fuel_consumption: '#06b6d4', revenue: '#10b981',
  expense: '#ef4444', custom: '#64748b',
};
const REPORT_TYPE_LABELS: Record<string, string> = {
  executive_summary: 'Executive Summary', fleet_performance: 'Fleet Performance',
  vehicle_tracking: 'Vehicle Tracking', driver_performance: 'Driver Performance',
  fuel_consumption: 'Fuel Consumption', revenue: 'Revenue', expense: 'Expense', custom: 'Custom',
};

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function ReportManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [reports, setReports] = useState<Report[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterArchived, setFilterArchived] = useState('false');
  const [sort, setSort] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Generate modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ type: 'executive_summary', name: '', startDate: '', endDate: '' });
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => { load(); loadDashboard(); loadTypes(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterArchived !== 'all') params.append('archived', filterArchived);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await api.get(`/reports?${params.toString()}`);
      setReports(res.data.data || []);
    } catch { setReports([]); }
    finally { setLoading(false); }
  };

  const loadDashboard = async () => {
    try { const res = await api.get('/reports/dashboard'); setDashboard(res.data.data); } catch {}
  };

  const loadTypes = async () => {
    try { const res = await api.get('/reports/types'); setReportTypes(res.data.data || []); } catch {}
  };

  useEffect(() => { load(); }, [filterType, filterArchived, sort, startDate, endDate]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); setGenLoading(true); setGenError(null);
    try {
      await api.post('/reports/generate', {
        type: genForm.type, name: genForm.name,
        filters: { startDate: genForm.startDate, endDate: genForm.endDate },
      });
      setShowGenModal(false);
      await load(); await loadDashboard();
    } catch (err: any) { setGenError(err.response?.data?.message || err.message || 'Generation failed'); }
    finally { setGenLoading(false); }
  };

  const handleDownload = async (report: Report) => {
    try {
      const res = await api.get(`/reports/${report.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch { alert('Download failed'); }
  };

  const handleArchive = async (id: number) => {
    try { await api.put(`/reports/${id}/archive`); await load(); await loadDashboard(); } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this report permanently?')) return;
    try { await api.delete(`/reports/${id}`); await load(); await loadDashboard(); } catch {}
  };

  const handlePreview = (report: Report) => {
    if (report.filePath) window.open(`/api/reports/${report.id}/download`, '_blank');
  };

  if (loading && reports.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Report Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Generate, manage, and schedule professional PDF reports</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowGenModal(true)} style={btnPrimary}>
            <i className="las la-file-plus" style={{ fontSize: 15 }}></i> Generate Report
          </button>
        )}
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Reports', value: dashboard.totalReports, color: '#3b82f6', icon: 'ti-files' },
            { label: 'This Month', value: dashboard.thisMonth, color: '#22c55e', icon: 'ti-calendar' },
            { label: 'Storage Used', value: formatBytes(dashboard.totalStorage), color: '#f59e0b', icon: 'ti-database' },
            { label: 'Archived', value: dashboard.archivedCount, color: '#8b5cf6', icon: 'ti-archive' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      )}

      {/* Filters */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
          <input placeholder="Search reports..." value={search} onChange={e => { setSearch(e.target.value); }} style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All Types</option>
          {reportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterArchived} onChange={e => setFilterArchived(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="false">Active</option>
          <option value="true">Archived</option>
          <option value="all">All</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, width: 'auto' }} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, width: 'auto' }} />
        <button onClick={load} style={btn}><i className="las la-sync" style={{ fontSize: 15 }}></i></button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ ...btn, padding: '2px 8px', fontSize: 11 }}>Dismiss</button>
        </div>
      )}

      {/* Report List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reports.length === 0 ? (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 60, textAlign: 'center' }}>
            <i className="las la-file-text" style={{ fontSize: 40, color: 'var(--text3)', marginBottom: 12 }}></i>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No reports found</div>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Generate your first report to get started.</p>
            {isAdmin && <button onClick={() => setShowGenModal(true)} style={{ ...btnPrimary, marginTop: 16 }}>Generate Report</button>}
          </div>
        ) : reports.map(r => {
          const typeColor = REPORT_TYPE_COLORS[r.type] || '#64748b';
          return (
            <div key={r.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16,
              display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s',
              opacity: r.isArchived ? 0.6 : 1,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${typeColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="las la-file-text" style={{ fontSize: 20, color: typeColor }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.name}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: `${typeColor}18`, color: typeColor }}>
                    {REPORT_TYPE_LABELS[r.type] || r.type}
                  </span>
                  {r.isArchived && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>Archived</span>}
                  {r.status === 'generating' && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Generating...</span>}
                  {r.status === 'failed' && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Failed</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                  {r.generatedBy && <span>{r.generatedBy.firstName} {r.generatedBy.lastName} &bull; </span>}
                  {new Date(r.createdAt).toLocaleDateString()} &bull; {formatBytes(r.fileSize)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {r.status === 'ready' && r.filePath && (
                  <>
                    <button onClick={() => handlePreview(r)} style={{ ...btn, padding: '6px 10px', fontSize: 12 }} title="Preview">
                      <i className="las la-eye" style={{ fontSize: 14 }}></i>
                    </button>
                    <button onClick={() => handleDownload(r)} style={{ ...btn, padding: '6px 10px', fontSize: 12 }} title="Download">
                      <i className="las la-download" style={{ fontSize: 14 }}></i>
                    </button>
                    <button onClick={async () => await printReport({ title: r.name, type: REPORT_TYPE_LABELS[r.type] || r.type, period: new Date(r.createdAt).toLocaleDateString(), format: r.format, fileSize: formatBytes(r.fileSize), generatedBy: r.generatedBy ? `${r.generatedBy.firstName} ${r.generatedBy.lastName}` : undefined })} style={{ ...btn, padding: '6px 10px', fontSize: 12 }} title="Print">
                      <i className="las la-print" style={{ fontSize: 14 }}></i>
                    </button>
                  </>
                )}
                {(isAdmin || user?.role === 'operator') && (
                  <button onClick={() => handleArchive(r.id)} style={{ ...btn, padding: '6px 10px', fontSize: 12 }} title={r.isArchived ? 'Restore' : 'Archive'}>
                    <i className={`ti ${r.isArchived ? 'ti-archive-off' : 'ti-archive'}`} style={{ fontSize: 14 }}></i>
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => handleDelete(r.id)} style={{ ...btn, padding: '6px 10px', fontSize: 12, color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} title="Delete">
                    <i className="las la-trash-alt" style={{ fontSize: 14 }}></i>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      {dashboard?.recent && dashboard.recent.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 12px' }}>Recent Reports</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dashboard.recent.slice(0, 5).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: REPORT_TYPE_COLORS[r.type] || '#64748b' }} />
                <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{r.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowGenModal(false)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '90%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Generate Report</h2>
              <button onClick={() => setShowGenModal(false)} style={{ ...btn, padding: '6px 10px', border: 'none', fontSize: 16 }}><i className="las la-times"></i></button>
            </div>
            {genError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>{genError}</div>
            )}
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Report Name *</label>
                <input type="text" value={genForm.name} onChange={e => setGenForm({...genForm, name: e.target.value})} required placeholder="e.g. July 2024 Fleet Report" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Report Type *</label>
                <select value={genForm.type} onChange={e => setGenForm({...genForm, type: e.target.value})} style={inputStyle}>
                  {reportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={genForm.startDate} onChange={e => setGenForm({...genForm, startDate: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" value={genForm.endDate} onChange={e => setGenForm({...genForm, endDate: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowGenModal(false)} style={btn}>Cancel</button>
                <button type="submit" disabled={genLoading} style={{ ...btnPrimary, opacity: genLoading ? 0.6 : 1 }}>
                  {genLoading ? <><i className="las la-spinner" style={{ fontSize: 15, animation: 'spin 0.8s linear infinite' }}></i> Generating...</> : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
