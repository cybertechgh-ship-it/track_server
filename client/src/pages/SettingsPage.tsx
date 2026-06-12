import { useState, useEffect, useRef } from 'react';
import { auditService, type AuditLogEntry } from '../services/auditService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
  <div onClick={() => onChange(!enabled)} style={{
    width: 42, height: 24, borderRadius: 12, cursor: 'pointer',
    background: enabled ? 'var(--accent)' : 'var(--bg4)',
    display: 'flex', alignItems: 'center', padding: '0 3px',
    justifyContent: enabled ? 'flex-end' : 'flex-start',
    transition: 'all 0.2s', flexShrink: 0,
  }}>
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
  </div>
);

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
);

const TIMEZONES = [
  'UTC', 'Africa/Accra', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
];

const tabs = [
  { id: 'preferences', label: 'Preferences', icon: 'ti-settings' },
  { id: 'security', label: 'Security', icon: 'ti-shield-lock' },
  { id: 'bulk-import', label: 'Bulk Import', icon: 'ti-file-import' },
  { id: 'audit-log', label: 'Audit Log', icon: 'ti-clipboard-list' },
];

interface AuditEntryDisplay {
  id: number; action: string; entityType: string; userName: string; description: string;
  ipAddress: string | null; createdAt: string;
}

const MOCK_AUDIT: AuditEntryDisplay[] = [
  { id: 1, action: 'create', entityType: 'Vehicle', userName: 'Admin User', description: 'Created vehicle Toyota Corolla with plate GT-4521-T', ipAddress: '192.168.1.100', createdAt: '2026-06-12T10:30:00Z' },
  { id: 2, action: 'update', entityType: 'Driver', userName: 'Jane Smith', description: 'Updated driver license expiry for Kojo Asare', ipAddress: '192.168.1.101', createdAt: '2026-06-12T09:15:00Z' },
  { id: 3, action: 'delete', entityType: 'Geofence', userName: 'Admin User', description: 'Deleted geofence "Old Warehouse Zone"', ipAddress: '192.168.1.100', createdAt: '2026-06-11T16:45:00Z' },
  { id: 4, action: 'login', entityType: 'User', userName: 'Mike Johnson', description: 'Successful login from new device', ipAddress: '203.0.113.50', createdAt: '2026-06-11T08:00:00Z' },
  { id: 5, action: 'export', entityType: 'Report', userName: 'Sarah Wiredu', description: 'Exported monthly KPI report (Jun 2026)', ipAddress: '192.168.1.102', createdAt: '2026-06-10T14:22:00Z' },
  { id: 6, action: 'approve', entityType: 'Deployment', userName: 'Emmanuel Tagoe', description: 'Approved deployment #1042 for vehicle GT-3321-K', ipAddress: '192.168.1.100', createdAt: '2026-06-10T11:00:00Z' },
  { id: 7, action: 'reject', entityType: 'Remittance', userName: 'Grace Adjei', description: 'Rejected remittance #891 - amount mismatch', ipAddress: '192.168.1.103', createdAt: '2026-06-09T15:30:00Z' },
  { id: 8, action: 'update', entityType: 'Vehicle', userName: 'Admin User', description: 'Changed vehicle group for unit #12 from Delivery to Logistics', ipAddress: '192.168.1.100', createdAt: '2026-06-09T09:10:00Z' },
  { id: 9, action: 'create', entityType: 'Driver', userName: 'Jane Smith', description: 'Registered new driver: Akosua Mensah', ipAddress: '192.168.1.101', createdAt: '2026-06-08T13:45:00Z' },
  { id: 10, action: 'logout', entityType: 'User', userName: 'John Doe', description: 'User logged out', ipAddress: '192.168.1.104', createdAt: '2026-06-08T17:30:00Z' },
];

const TZ = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const actionColor: Record<string, string> = {
  create: '#22c55e', update: '#3b82f6', delete: '#ef4444',
  approve: '#22c55e', reject: '#ef4444',
  login: '#8b5cf6', logout: '#5c6f8a', export: '#f59e0b',
};

const actionLabel: Record<string, string> = {
  create: 'Create', update: 'Update', delete: 'Delete',
  approve: 'Approve', reject: 'Reject',
  login: 'Login', logout: 'Logout', export: 'Export',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('preferences');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('settings.darkMode') !== 'false');
  const [layout, setLayout] = useState(() => localStorage.getItem('settings.layout') || 'compact');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('settings.timezone') || 'UTC');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('settings.darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => { localStorage.setItem('settings.layout', layout); }, [layout]);
  useEffect(() => { localStorage.setItem('settings.timezone', timezone); }, [timezone]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Settings</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Platform configuration, user preferences, and bulk operations</div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ width: 190, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', width: '100%', textAlign: 'left',
              borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: 'none',
              background: activeTab === t.id ? 'rgba(0,201,167,0.08)' : 'transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text2)',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'var(--bg3)'; }}
              onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <i className={`ti ${t.icon}`} style={{ fontSize: 16, width: 20 }}></i>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>

            {activeTab === 'preferences' && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-settings" style={{ color: 'var(--accent)' }}></i> Preferences
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="ti ti-moon" style={{ color: '#8b5cf6' }}></i> Dark Mode
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 26 }}>Toggle dark/light theme</div>
                  </div>
                  <Toggle enabled={darkMode} onChange={setDarkMode} />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-layout" style={{ color: '#3b82f6' }}></i> Dashboard Layout
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {['compact', 'comfortable'].map(v => (
                      <label key={v} style={{
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none',
                        padding: '10px 16px', borderRadius: 8, background: layout === v ? 'rgba(0,201,167,0.08)' : 'var(--bg3)',
                        border: layout === v ? '1px solid var(--accent)' : '1px solid var(--border2)',
                        transition: 'all 0.1s',
                      }}>
                        <input type="radio" name="layout" value={v} checked={layout === v} onChange={e => setLayout(e.target.value)}
                          style={{ accentColor: 'var(--accent)', margin: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: layout === v ? 600 : 400, color: layout === v ? 'var(--accent)' : 'var(--text2)' }}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

                <div>
                  <label style={{ ...labelStyle, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-world" style={{ color: '#f59e0b' }}></i> Timezone
                  </label>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, marginLeft: 26 }}>Display times in your local timezone</div>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ ...selectStyle, maxWidth: 320 }}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <SecurityTab />
            )}

            {activeTab === 'bulk-import' && (
              <BulkImportTab />
            )}

            {activeTab === 'audit-log' && (
              <AuditLogTab />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [twoFA, setTwoFA] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaved, setPwSaved] = useState(false);

  const handlePwSave = () => {
    if (!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm) return;
    setPwSaved(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 2000);
  };

  const sessions = [
    { ip: '192.168.1.100', browser: 'Chrome 125 / Windows 11', lastActive: '2 minutes ago', device: 'Desktop', current: true },
    { ip: '203.0.113.50', browser: 'Safari 18 / iOS 19', lastActive: '3 hours ago', device: 'iPhone 16 Pro', current: false },
    { ip: '198.51.100.20', browser: 'Firefox 130 / macOS 15', lastActive: '1 day ago', device: 'MacBook Pro', current: false },
  ];

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-shield-lock" style={{ color: '#3b82f6' }}></i> Security
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-shield-check" style={{ color: '#8b5cf6' }}></i> Enable Two-Factor Authentication
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 26 }}>Add an extra layer of security to your account</div>
        </div>
        <Toggle enabled={twoFA} onChange={setTwoFA} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-key" style={{ color: '#f59e0b' }}></i> Change Password
        </div>
        <div style={{ display: 'grid', gap: 14, maxWidth: 400 }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <button style={btnPrimary} onClick={handlePwSave} disabled={!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm}>
              {pwSaved ? <><i className="ti ti-check" style={{ fontSize: 14 }}></i> Saved (mock)</> : <><i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i> Update Password</>}
            </button>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-device-laptop" style={{ color: '#3b82f6' }}></i> Active Sessions
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>IP Address</th>
                <th style={hdrStyle}>Browser</th>
                <th style={hdrStyle}>Device</th>
                <th style={hdrStyle}>Last Active</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.ip}</td>
                  <td style={cellStyle}>{s.browser}</td>
                  <td style={cellStyle}>{s.device}</td>
                  <td style={cellStyle}>{s.lastActive}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{s.current ? badge('Current', '#22c55e') : <button style={{ ...btn, padding: '4px 10px', fontSize: 11 }}>Revoke</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function BulkImportTab() {
  const [entityType, setEntityType] = useState('Drivers');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f) setFile(f);
  };

  const handleUpload = () => {
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImportDone(true);
      setFile(null);
      setTimeout(() => setImportDone(false), 3000);
    }, 1200);
  };

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-file-import" style={{ color: 'var(--accent)' }}></i> Bulk Import
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Entity Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Drivers', 'Vehicles', 'Organization Units'].map(e => (
            <button key={e} onClick={() => setEntityType(e)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: entityType === e ? '1px solid var(--accent)' : '1px solid var(--border2)',
              background: entityType === e ? 'rgba(0,201,167,0.08)' : 'var(--bg3)',
              color: entityType === e ? 'var(--accent)' : 'var(--text2)',
              transition: 'all 0.1s',
            }}>{e}</button>
          ))}
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`,
          borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
          background: dragging ? 'rgba(0,201,167,0.04)' : 'var(--bg3)',
          transition: 'all 0.15s', marginBottom: 20,
        }}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
        <i className="ti ti-upload" style={{ fontSize: 28, color: dragging ? 'var(--accent)' : 'var(--text3)', marginBottom: 8, display: 'block' }}></i>
        {file ? (
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
            <i className="ti ti-file-text" style={{ marginRight: 6 }}></i>{file.name}
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400, marginLeft: 8 }}>({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Drag & drop or click to upload</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Supports CSV and XLSX files</div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button style={file && !importing ? btnPrimary : { ...btn, opacity: 0.5, cursor: file && !importing ? 'pointer' : 'not-allowed' }} onClick={handleUpload} disabled={!file || importing}>
          {importing ? <><i className="ti ti-loader" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> Importing...</> :
           importDone ? <><i className="ti ti-check" style={{ fontSize: 14 }}></i> Import started (mock)</> :
           <><i className="ti ti-upload" style={{ fontSize: 14 }}></i> Upload & Import</>}
        </button>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-download" style={{ color: '#3b82f6' }}></i> Download Templates
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Drivers Template', 'Vehicles Template', 'Organization Units Template'].map(t => (
            <button key={t} style={btn} onClick={() => {}}>
              <i className="ti ti-file-download" style={{ fontSize: 14 }}></i> {t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function AuditLogTab() {
  const [entries, setEntries] = useState<AuditEntryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await auditService.getAll();
        const mapped: AuditEntryDisplay[] = data.map(e => ({
          id: e.id, action: e.action, entityType: e.entityType, userName: `User #${e.userId || 0}`,
          description: e.description, ipAddress: e.ipAddress, createdAt: e.createdAt,
        }));
        setEntries(mapped.length > 0 ? mapped : MOCK_AUDIT);
      } catch {
        setEntries(MOCK_AUDIT);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.action === filter);

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-clipboard-list" style={{ color: '#8b5cf6' }}></i> Audit Log
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>Filter by action:</span>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 140 }}>
          <option value="all">All Actions</option>
          {Object.entries(actionLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>{filtered.length} entries</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              <th style={hdrStyle}>Timestamp</th>
              <th style={hdrStyle}>User</th>
              <th style={hdrStyle}>Action</th>
              <th style={hdrStyle}>Entity Type</th>
              <th style={hdrStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>No audit entries found</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <td style={{ ...cellStyle, fontSize: 12, whiteSpace: 'nowrap' }}>{TZ(e.createdAt)}</td>
                <td style={cellStyle}><span style={{ fontWeight: 500 }}>{e.userName}</span></td>
                <td style={cellStyle}>{badge(actionLabel[e.action] || e.action, actionColor[e.action] || '#5c6f8a')}</td>
                <td style={cellStyle}>{e.entityType}</td>
                <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text2)' }}>
                  {e.description}
                  {e.ipAddress && <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text3)', marginLeft: 8, fontSize: 11 }}>{e.ipAddress}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
