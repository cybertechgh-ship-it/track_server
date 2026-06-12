import { useState } from 'react';

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%',
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };

const tabs = [
  { id: 'company', label: 'Company', icon: 'ti-building' },
  { id: 'users', label: 'Users & Roles', icon: 'ti-users' },
  { id: 'notifications', label: 'Notifications', icon: 'ti-bell-ringing' },
  { id: 'integrations', label: 'Integrations', icon: 'ti-plug-connected' },
  { id: 'security', label: 'Security', icon: 'ti-shield-lock' },
  { id: 'billing', label: 'Billing', icon: 'ti-credit-card' },
  { id: 'data-backup', label: 'Data & Backup', icon: 'ti-database' },
];

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

const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    companyName: 'TGNE Fleet Services Ltd',
    contactEmail: 'admin@tgnefleet.com',
    country: 'Ghana',
    timezone: 'Africa/Accra (GMT+0)',
    speedUnit: 'km/h',
    maxSpeedLimit: '80',
  });
  const [channels, setChannels] = useState({ sms: true, email: true, whatsapp: false, webhook: true });
  const [darkMode, setDarkMode] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const markDirty = () => { if (!dirty) setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setForm({
      companyName: 'TGNE Fleet Services Ltd',
      contactEmail: 'admin@tgnefleet.com',
      country: 'Ghana',
      timezone: 'Africa/Accra (GMT+0)',
      speedUnit: 'km/h',
      maxSpeedLimit: '80',
    });
    setChannels({ sms: true, email: true, whatsapp: false, webhook: true });
    setDarkMode(true);
    setDirty(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>System Settings</div>
            <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'var(--success)', color: '#00221c', letterSpacing: '0.5px' }}>LIVE</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Configure your FleetPulse instance</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            <i className="ti ti-bell" style={{ fontSize: 14 }}></i> Alerts 7
          </span>
          <button style={btnPrimary} onClick={() => window.location.href = '/vehicles'}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Add Vehicle</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
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

          <div style={{
            marginTop: 12, padding: 12, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(0,201,167,0.1), rgba(0,201,167,0.03))',
            border: '1px solid rgba(0,201,167,0.15)',
          }}>
            <div style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700,
              background: 'linear-gradient(135deg, #00c9a7, #00e5c8)', color: '#00221c',
              marginBottom: 8, letterSpacing: '0.5px',
            }}>ENTERPRISE</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Enterprise Plan</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
              Unlimited vehicles, advanced analytics, priority support
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setActiveTab('billing')}>
              Manage Plan <i className="ti ti-arrow-right" style={{ fontSize: 10 }}></i>
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>

            {/* ===== COMPANY ===== */}
            {activeTab === 'company' && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-building" style={{ color: 'var(--accent)' }}></i> Company Settings
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Company Name</label>
                    <input value={form.companyName} onChange={e => { setForm({ ...form, companyName: e.target.value }); markDirty(); }} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Contact Email</label>
                    <input type="email" value={form.contactEmail} onChange={e => { setForm({ ...form, contactEmail: e.target.value }); markDirty(); }} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <select value={form.country} onChange={e => { setForm({ ...form, country: e.target.value }); markDirty(); }} style={selectStyle}>
                      <option>Ghana</option><option>Nigeria</option><option>Kenya</option><option>South Africa</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Timezone</label>
                    <select value={form.timezone} onChange={e => { setForm({ ...form, timezone: e.target.value }); markDirty(); }} style={selectStyle}>
                      <option>Africa/Accra (GMT+0)</option><option>Africa/Lagos (GMT+1)</option><option>Africa/Nairobi (GMT+3)</option><option>Africa/Johannesburg (GMT+2)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Speed Unit</label>
                    <select value={form.speedUnit} onChange={e => { setForm({ ...form, speedUnit: e.target.value }); markDirty(); }} style={selectStyle}>
                      <option>km/h</option><option>mph</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Max Speed Limit</label>
                    <input type="number" value={form.maxSpeedLimit} onChange={e => { setForm({ ...form, maxSpeedLimit: e.target.value }); markDirty(); }} style={inputStyle} />
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-bell-ringing" style={{ color: '#f59e0b' }}></i> Notification Channels
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { key: 'sms', label: 'SMS Alerts (Twilio)', desc: 'Send speed and geofence alerts via SMS', icon: 'ti-message' },
                    { key: 'email', label: 'Email Notifications', desc: 'Daily reports and critical alerts', icon: 'ti-mail' },
                    { key: 'whatsapp', label: 'WhatsApp Alerts', desc: 'Send alerts via WhatsApp Business API', icon: 'ti-brand-whatsapp' },
                    { key: 'webhook', label: 'Webhook Events', desc: 'Push events to your external systems', icon: 'ti-webhook' },
                  ].map((n, i) => (
                    <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={`ti ${n.icon}`} style={{ fontSize: 16, color: 'var(--text2)' }}></i>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{n.desc}</div>
                        </div>
                      </div>
                      <Toggle enabled={(channels as any)[n.key]} onChange={v => { setChannels({ ...channels, [n.key]: v }); markDirty(); }} />
                    </div>
                  ))}
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      <i className="ti ti-moon" style={{ marginRight: 6, color: '#8b5cf6' }}></i> Dark Mode (System)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 26 }}>Follow OS dark/light preference</div>
                  </div>
                  <Toggle enabled={darkMode} onChange={v => { setDarkMode(v); markDirty(); }} />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button style={btn} onClick={handleCancel} disabled={!dirty || saving}>
                    {saving ? <i className="ti ti-loader" style={{ animation: 'spin 0.8s linear infinite' }}></i> : null} Cancel
                  </button>
                  <button style={btnPrimary} onClick={handleSave} disabled={!dirty || saving}>
                    {saving ? <><i className="ti ti-loader" style={{ fontSize: 15, animation: 'spin 0.8s linear infinite' }}></i> Saving...</> :
                     saved ? <><i className="ti ti-check" style={{ fontSize: 15 }}></i> Saved</> :
                     <><i className="ti ti-device-floppy" style={{ fontSize: 15 }}></i> Save Changes</>}
                  </button>
                </div>
              </>
            )}

            {/* ===== USERS & ROLES ===== */}
            {activeTab === 'users' && <UsersRolesTab />}

            {/* ===== NOTIFICATIONS ===== */}
            {activeTab === 'notifications' && <NotificationsTab />}

            {/* ===== INTEGRATIONS ===== */}
            {activeTab === 'integrations' && <IntegrationsTab />}

            {/* ===== SECURITY ===== */}
            {activeTab === 'security' && <SecurityTab />}

            {/* ===== BILLING ===== */}
            {activeTab === 'billing' && <BillingTab />}

            {/* ===== DATA & BACKUP ===== */}
            {activeTab === 'data-backup' && <DataBackupTab />}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== USERS & ROLES TAB ===== */
interface RolePerm {
  id: string; label: string; color: string;
  permissions: string[];
}
interface AppUser {
  id: number; name: string; email: string; role: string; status: string;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  { id: 'manage_vehicles', label: 'Manage Vehicles', group: 'Fleet' },
  { id: 'manage_drivers', label: 'Manage Drivers', group: 'Fleet' },
  { id: 'manage_devices', label: 'Manage Devices', group: 'Fleet' },
  { id: 'manage_deployments', label: 'Manage Deployments', group: 'Operations' },
  { id: 'manage_routes', label: 'Manage Routes', group: 'Operations' },
  { id: 'view_reports', label: 'View Reports', group: 'Analytics' },
  { id: 'view_kpi', label: 'View KPIs', group: 'Analytics' },
  { id: 'manage_alerts', label: 'Manage Alerts', group: 'Monitoring' },
  { id: 'manage_geofences', label: 'Manage Geofences', group: 'Monitoring' },
  { id: 'manage_users', label: 'Manage Users', group: 'Admin' },
  { id: 'manage_settings', label: 'Manage Settings', group: 'Admin' },
  { id: 'manage_billing', label: 'Manage Billing', group: 'Admin' },
  { id: 'view_audit', label: 'View Audit Log', group: 'Admin' },
  { id: 'approve_remittance', label: 'Approve Remittance', group: 'Finance' },
  { id: 'approve_deployment', label: 'Approve Deployments', group: 'Operations' },
];

const ROLE_PERMISSIONS: Record<string, RolePerm> = {
  admin: {
    id: 'admin', label: 'Admin', color: '#ef4444',
    permissions: ALL_PERMISSIONS.map(p => p.id),
  },
  manager: {
    id: 'manager', label: 'Manager', color: '#f59e0b',
    permissions: ['manage_vehicles','manage_drivers','manage_deployments','manage_routes','view_reports','view_kpi','manage_alerts','manage_geofences','approve_remittance','approve_deployment'],
  },
  supervisor: {
    id: 'supervisor', label: 'Supervisor', color: '#8b5cf6',
    permissions: ['manage_vehicles','manage_drivers','manage_deployments','manage_routes','manage_alerts','manage_geofences','view_reports','view_kpi','approve_remittance','approve_deployment','view_audit'],
  },
  dispatcher: {
    id: 'dispatcher', label: 'Dispatcher', color: '#3b82f6',
    permissions: ['manage_vehicles','manage_drivers','manage_deployments','manage_routes','manage_alerts','manage_geofences','view_reports'],
  },
  driver: {
    id: 'driver', label: 'Driver', color: '#22c55e',
    permissions: ['view_reports'],
  },
};

function UsersRolesTab() {
  const [users, setUsers] = useState<AppUser[]>([
    { id: 1, name: 'Admin User', email: 'admin@tgnefleet.com', role: 'admin', status: 'active', permissions: [...ROLE_PERMISSIONS.admin.permissions] },
    { id: 2, name: 'John Doe', email: 'john@tgnefleet.com', role: 'manager', status: 'active', permissions: [...ROLE_PERMISSIONS.manager.permissions] },
    { id: 3, name: 'Jane Smith', email: 'jane@tgnefleet.com', role: 'dispatcher', status: 'active', permissions: [...ROLE_PERMISSIONS.dispatcher.permissions] },
    { id: 4, name: 'Mike Johnson', email: 'mike@tgnefleet.com', role: 'driver', status: 'inactive', permissions: [...ROLE_PERMISSIONS.driver.permissions] },
    { id: 5, name: 'Sarah Wiredu', email: 'sarah@tgnefleet.com', role: 'dispatcher', status: 'active', permissions: [...ROLE_PERMISSIONS.dispatcher.permissions] },
    { id: 6, name: 'Kojo Asare', email: 'kojo@tgnefleet.com', role: 'manager', status: 'active', permissions: [...ROLE_PERMISSIONS.manager.permissions] },
    { id: 7, name: 'Emmanuel Tagoe', email: 'etagoe@tgnefleet.com', role: 'supervisor', status: 'active', permissions: [...ROLE_PERMISSIONS.supervisor.permissions] },
    { id: 8, name: 'Grace Adjei', email: 'gadjei@tgnefleet.com', role: 'supervisor', status: 'active', permissions: [...ROLE_PERMISSIONS.supervisor.permissions] },
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'dispatcher' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string }>({ name: '', email: '', role: '' });
  const [activeSection, setActiveSection] = useState<'users' | 'roles'>('users');

  const roleColor: Record<string, string> = { admin: '#ef4444', manager: '#f59e0b', supervisor: '#8b5cf6', dispatcher: '#3b82f6', driver: '#22c55e' };

  const handleInvite = () => {
    if (!inviteForm.email) return;
    const role = inviteForm.role;
    const basePerms = ROLE_PERMISSIONS[role]?.permissions || [];
    setUsers([...users, { id: Date.now(), name: inviteForm.name || inviteForm.email.split('@')[0], email: inviteForm.email, role, status: 'active', permissions: [...basePerms] }]);
    setInviteForm({ name: '', email: '', role: 'dispatcher' });
    setShowInvite(false);
  };

  const startEdit = (u: AppUser) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };
  const cancelEdit = () => { setEditingId(null); };
  const saveEdit = (id: number) => {
    setUsers(u => u.map(x => x.id === id ? { ...x, name: editForm.name, email: editForm.email, role: editForm.role } : x));
    setEditingId(null);
  };

  const deleteUser = (id: number) => {
    if (!confirm('Remove this user?')) return;
    setUsers(u => u.filter(x => x.id !== id));
  };

  const togglePermission = (userId: number, permId: string) => {
    setUsers(u => u.map(x => x.id === userId ? { ...x, permissions: x.permissions.includes(permId) ? x.permissions.filter(p => p !== permId) : [...x.permissions, permId] } : x));
  };

  const groupedPerms = ALL_PERMISSIONS.reduce<Record<string, typeof ALL_PERMISSIONS>>((acc, p) => {
    (acc[p.group] = acc[p.group] || []).push(p); return acc;
  }, {});

  const permissionGroups = Object.entries(groupedPerms);

  const activeUsers = users.filter(u => u.status === 'active').length;

  /* ── Role editor state ── */
  const [roleEditor, setRoleEditor] = useState<{ open: boolean; roleId: string; perms: string[] }>({ open: false, roleId: '', perms: [] });

  const openRoleEditor = (roleId: string) => {
    setRoleEditor({ open: true, roleId, perms: [...ROLE_PERMISSIONS[roleId].permissions] });
  };
  const toggleRolePerm = (permId: string) => {
    setRoleEditor(r => ({ ...r, perms: r.perms.includes(permId) ? r.perms.filter(p => p !== permId) : [...r.perms, permId] }));
  };
  const saveRolePerms = () => {
    ROLE_PERMISSIONS[roleEditor.roleId].permissions = roleEditor.perms;
    setUsers(u => u.map(x => x.role === roleEditor.roleId ? { ...x, permissions: [...roleEditor.perms] } : x));
    setRoleEditor({ open: false, roleId: '', perms: [] });
  };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-users" style={{ color: 'var(--accent)' }}></i> Users & Roles
          </div>
          {activeSection === 'users' && (
            <button style={btnPrimary} onClick={() => setShowInvite(true)}><i className="ti ti-user-plus" style={{ fontSize: 15 }}></i> Add User</button>
          )}
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{users.length}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>Total Users</span>
          </div>
          <div style={{ padding: '10px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{activeUsers}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>Active</span>
          </div>
          <div style={{ padding: '10px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{Object.keys(ROLE_PERMISSIONS).length}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>Roles</span>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          <button onClick={() => setActiveSection('users')} style={{
            padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: '1px solid var(--border2)', background: activeSection === 'users' ? 'rgba(0,201,167,0.1)' : 'transparent',
            color: activeSection === 'users' ? 'var(--accent)' : 'var(--text2)',
          }}><i className="ti ti-users" style={{ marginRight: 6, fontSize: 13 }}></i>Users</button>
          <button onClick={() => setActiveSection('roles')} style={{
            padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: '1px solid var(--border2)', background: activeSection === 'roles' ? 'rgba(0,201,167,0.1)' : 'transparent',
            color: activeSection === 'roles' ? 'var(--accent)' : 'var(--text2)',
          }}><i className="ti ti-shield" style={{ marginRight: 6, fontSize: 13 }}></i>Roles & Permissions</button>
        </div>
      </div>

      {/* ── USERS TABLE ── */}
      {activeSection === 'users' && (
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Name</th>
                <th style={hdrStyle}>Email</th>
                <th style={hdrStyle}>Role</th>
                <th style={hdrStyle}>Permissions</th>
                <th style={hdrStyle}>Status</th>
                <th style={{ ...hdrStyle, textAlign: 'center', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {editingId === u.id ? (
                    <>
                      <td style={cellStyle}>
                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ ...inputStyle, padding: '4px 8px', fontSize: 12, width: 130 }} />
                      </td>
                      <td style={cellStyle}>
                        <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ ...inputStyle, padding: '4px 8px', fontSize: 12, width: 180 }} />
                      </td>
                      <td style={cellStyle}>
                        <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={{ ...inputStyle, padding: '4px 8px', fontSize: 12, width: 110 }}>
                          {Object.entries(ROLE_PERMISSIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{u.permissions.length} perms</span>
                      </td>
                      <td style={cellStyle}>{badge(u.status === 'active' ? 'Active' : 'Inactive', u.status === 'active' ? '#22c55e' : '#5c6f8a')}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                          <button style={{ ...btn, padding: '4px 8px' }} onClick={() => saveEdit(u.id)}><i className="ti ti-check" style={{ fontSize: 13, color: '#22c55e' }}></i></button>
                          <button style={{ ...btn, padding: '4px 8px' }} onClick={cancelEdit}><i className="ti ti-x" style={{ fontSize: 13 }}></i></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={cellStyle}><span style={{ fontWeight: 600 }}>{u.name}</span></td>
                      <td style={cellStyle}>{u.email}</td>
                      <td style={cellStyle}>{badge(u.role.charAt(0).toUpperCase() + u.role.slice(1), roleColor[u.role])}</td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {u.permissions.slice(0, 3).map(p => {
                            const perm = ALL_PERMISSIONS.find(x => x.id === p);
                            return perm ? <span key={p} style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: 'rgba(0,201,167,0.08)', color: 'var(--accent)' }}>{perm.label}</span> : null;
                          })}
                          {u.permissions.length > 3 && <span style={{ fontSize: 10, color: 'var(--text3)' }}>+{u.permissions.length - 3}</span>}
                        </div>
                      </td>
                      <td style={cellStyle}>{badge(u.status === 'active' ? 'Active' : 'Inactive', u.status === 'active' ? '#22c55e' : '#5c6f8a')}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                          <button style={{ ...btn, padding: '4px 8px' }} onClick={() => startEdit(u)} title="Edit"><i className="ti ti-edit" style={{ fontSize: 13 }}></i></button>
                          <button style={{ ...btn, padding: '4px 8px', color: 'var(--danger)' }} onClick={() => deleteUser(u.id)} title="Remove"><i className="ti ti-trash" style={{ fontSize: 13 }}></i></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ROLES & PERMISSIONS ── */}
      {activeSection === 'roles' && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Role Permissions</div>
          {Object.entries(ROLE_PERMISSIONS).map(([key, role]) => (
            <div key={key} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {badge(role.label, role.color)}
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{role.permissions.length} permissions</span>
                </div>
                <button style={{ ...btn, padding: '4px 10px', fontSize: 12 }} onClick={() => openRoleEditor(key)}>
                  <i className="ti ti-edit" style={{ fontSize: 13 }}></i> Edit
                </button>
              </div>
              <div style={{ padding: '10px 16px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {role.permissions.map(p => {
                  const perm = ALL_PERMISSIONS.find(x => x.id === p);
                  return perm ? (
                    <span key={p} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: 'rgba(0,201,167,0.06)', color: 'var(--text2)', border: '1px solid var(--border2)' }}>
                      {perm.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── PERMISSION EDITOR (full selector with checkboxes) ── */}
      {roleEditor.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setRoleEditor({ open: false, roleId: '', perms: [] })}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Edit Permissions</span>
                {badge(ROLE_PERMISSIONS[roleEditor.roleId]?.label || '', roleEditor.roleId ? roleColor[roleEditor.roleId] : '#5c6f8a')}
              </div>
              <button onClick={() => setRoleEditor({ open: false, roleId: '', perms: [] })} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--text3)' }}>Select permissions for this role. Changes apply to all users with this role.</div>
              {/* Select All / Deselect All */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button style={{ ...btn, padding: '4px 12px', fontSize: 11 }} onClick={() => setRoleEditor(r => ({ ...r, perms: ALL_PERMISSIONS.map(p => p.id) }))}>
                  <i className="ti ti-checkbox" style={{ fontSize: 12 }}></i> Select All
                </button>
                <button style={{ ...btn, padding: '4px 12px', fontSize: 11 }} onClick={() => setRoleEditor(r => ({ ...r, perms: [] }))}>
                  <i className="ti ti-checkbox-off" style={{ fontSize: 12 }}></i> Deselect All
                </button>
              </div>
              {permissionGroups.map(([group, perms]) => (
                <div key={group} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, paddingLeft: 2 }}>{group}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {perms.map(p => {
                      const checked = roleEditor.perms.includes(p.id);
                      return (
                        <label key={p.id} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                          background: checked ? 'rgba(0,201,167,0.08)' : 'var(--bg3)',
                          border: checked ? '1px solid var(--accent)' : '1px solid var(--border2)',
                          transition: 'all 0.1s', userSelect: 'none',
                        }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleRolePerm(p.id)}
                            style={{ accentColor: 'var(--accent)', margin: 0 }} />
                          <span style={{ fontSize: 12, color: checked ? 'var(--accent)' : 'var(--text2)', fontWeight: checked ? 600 : 400 }}>{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={btn} onClick={() => setRoleEditor({ open: false, roleId: '', perms: [] })}>Cancel</button>
              <button style={btnPrimary} onClick={saveRolePerms}><i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i> Save Permissions</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD USER MODAL ── */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowInvite(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 420, maxWidth: '90vw' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Add User</div>
              <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Full Name</label>
                <input placeholder="John Doe" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email Address</label>
                <input placeholder="user@example.com" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} style={selectStyle}>
                  <option value="admin">Admin</option><option value="manager">Manager</option><option value="supervisor">Supervisor</option><option value="dispatcher">Dispatcher</option><option value="driver">Driver</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={btn} onClick={() => setShowInvite(false)}>Cancel</button>
              <button style={btnPrimary} onClick={handleInvite}><i className="ti ti-send" style={{ fontSize: 14 }}></i> Add User</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== NOTIFICATIONS TAB ===== */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    speedAlerts: true, geofenceAlerts: true, unauthorizedUse: true,
    maintenanceReminders: true, idleAlerts: false, systemUpdates: true,
    smsEnabled: true, emailEnabled: true, pushEnabled: false,
  });
  const T = ({ k }: { k: keyof typeof prefs }) => (
    <Toggle enabled={prefs[k]} onChange={v => setPrefs({ ...prefs, [k]: v })} />
  );

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-bell-ringing" style={{ color: '#f59e0b' }}></i> Notification Preferences
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Alert Triggers</div>
      {[
        { k: 'speedAlerts', label: 'Speed Alerts', desc: 'When a vehicle exceeds the speed limit' },
        { k: 'geofenceAlerts', label: 'Geofence Events', desc: 'When a vehicle enters or exits a zone' },
        { k: 'unauthorizedUse', label: 'Unauthorized Use', desc: 'Vehicle used outside approved hours' },
        { k: 'maintenanceReminders', label: 'Maintenance Reminders', desc: 'Service due reminders' },
        { k: 'idleAlerts', label: 'Idle Alerts', desc: 'Vehicle idling longer than threshold' },
        { k: 'systemUpdates', label: 'System Updates', desc: 'Platform maintenance and release notes' },
      ].map((n, i) => (
        <div key={n.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
          <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.label}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{n.desc}</div></div>
          <T k={n.k as keyof typeof prefs} />
        </div>
      ))}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Delivery Channels</div>
      {[
        { k: 'smsEnabled', label: 'SMS', desc: 'Receive alerts via SMS', icon: 'ti-message' },
        { k: 'emailEnabled', label: 'Email', desc: 'Receive alerts via email', icon: 'ti-mail' },
        { k: 'pushEnabled', label: 'Push Notifications', desc: 'Browser and mobile push', icon: 'ti-bell' },
      ].map((n, i) => (
        <div key={n.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${n.icon}`} style={{ fontSize: 16, color: 'var(--text2)' }}></i>
            </div>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.label}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{n.desc}</div></div>
          </div>
          <T k={n.k as keyof typeof prefs} />
        </div>
      ))}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button style={btn}>Reset Defaults</button>
        <button style={btnPrimary}><i className="ti ti-device-floppy" style={{ fontSize: 15 }}></i> Save Preferences</button>
      </div>
    </>
  );
}

/* ===== INTEGRATIONS TAB ===== */
function IntegrationsTab() {
  const [apiKey] = useState('fp_live_a1b2c3d4e5f6g7h8i9j0k');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.tgnefleet.com/events');
  const [twilioSid, setTwilioSid] = useState('ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [twilioToken, setTwilioToken] = useState('********************************');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewKey = () => {
    const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    alert(`New API Key generated: fp_live_${rand}`);
  };

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-plug-connected" style={{ color: 'var(--accent)' }}></i> Integrations
      </div>

      {/* API Key */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-key" style={{ color: '#f59e0b' }}></i> API Key
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>Use this key to authenticate API requests from external services</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <code style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace", background: 'var(--bg3)',
            border: '1px solid var(--border2)', color: 'var(--accent)',
          }}>
            {showKey ? apiKey : `${apiKey.slice(0, 8)}${'•'.repeat(24)}`}
          </code>
          <button style={{ ...btn, padding: '8px 12px' }} onClick={() => setShowKey(!showKey)}>
            <i className={`ti ${showKey ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 14 }}></i>
          </button>
          <button style={{ ...btn, padding: '8px 12px' }} onClick={copyKey}>
            <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 14 }}></i>
          </button>
          <button style={{ ...btn, padding: '8px 12px', color: 'var(--danger)' }} onClick={generateNewKey}>
            <i className="ti ti-refresh" style={{ fontSize: 14 }}></i> Regenerate
          </button>
        </div>
      </div>

      {/* Webhook */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-webhook" style={{ color: '#3b82f6' }}></i> Webhook Endpoint
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>Receive real-time events via HTTP POST</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
          <button style={btnPrimary}><i className="ti ti-refresh" style={{ fontSize: 14 }}></i> Test</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {['location.update', 'alert.triggered', 'session.start', 'session.end', 'geofence.entry'].map(e => (
            <span key={e} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(0,201,167,0.08)', color: 'var(--accent)', border: '1px solid rgba(0,201,167,0.2)' }}>{e}</span>
          ))}
        </div>
      </div>

      {/* Twilio */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-message" style={{ color: '#ef4444' }}></i> Twilio SMS
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>Configure SMS alerts via Twilio</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Account SID</label>
            <input value={twilioSid} onChange={e => setTwilioSid(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Auth Token</label>
            <input type="password" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button style={btn}><i className="ti ti-refresh" style={{ fontSize: 14 }}></i> Test Connection</button>
          <button style={btnPrimary}><i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i> Save</button>
        </div>
      </div>
    </>
  );
}

/* ===== SECURITY TAB ===== */
function SecurityTab() {
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [maxAttempts, setMaxAttempts] = useState('5');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [requireSpecial, setRequireSpecial] = useState(true);

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-shield-lock" style={{ color: '#3b82f6' }}></i> Security Settings
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Session Timeout (minutes)</label>
          <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Max Login Attempts</label>
          <input type="number" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Minimum Password Length</label>
          <input type="number" value={passwordMinLength} onChange={e => setPasswordMinLength(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Require Special Characters</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>! @ # $ % etc.</div>
            </div>
            <Toggle enabled={requireSpecial} onChange={setRequireSpecial} />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-shield-check" style={{ color: '#8b5cf6' }}></i> Two-Factor Authentication
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 26 }}>Add an extra layer of security to your account</div>
        </div>
        <Toggle enabled={twoFA} onChange={setTwoFA} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Recent Login Activity</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 2 }}>
        {[
          { action: 'Login successful', ip: '192.168.1.100', time: '2 minutes ago', device: 'Chrome / Windows' },
          { action: 'Password changed', ip: '192.168.1.100', time: '3 days ago', device: 'Chrome / Windows' },
          { action: 'Login failed', ip: '203.0.113.50', time: '1 week ago', device: 'Firefox / macOS' },
          { action: '2FA enabled', ip: '192.168.1.100', time: '2 weeks ago', device: 'Chrome / Windows' },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: e.action.includes('failed') ? '#ef4444' : '#22c55e' }} />
              <span style={{ color: 'var(--text)' }}>{e.action}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{e.ip}</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>{e.device}</span>
              <span>{e.time}</span>
            </div>
          </div>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button style={btn}>Reset to Defaults</button>
        <button style={btnPrimary}><i className="ti ti-device-floppy" style={{ fontSize: 15 }}></i> Save Security Settings</button>
      </div>
    </>
  );
}

/* ===== BILLING TAB ===== */
function BillingTab() {
  const [plan, setPlan] = useState('enterprise');

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-credit-card" style={{ color: '#8b5cf6' }}></i> Billing & Plan
      </div>

      {/* Current Plan */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,201,167,0.08), rgba(0,201,167,0.02))', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Enterprise Plan</span>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'linear-gradient(135deg, #00c9a7, #00e5c8)', color: '#00221c' }}>ACTIVE</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>$299/month &middot; Unlimited vehicles &middot; Priority support &middot; Advanced analytics</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>$299</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>per month</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={btnPrimary}><i className="ti ti-arrow-up-circle" style={{ fontSize: 14 }}></i> Upgrade</button>
          <button style={btn}><i className="ti ti-arrow-down-circle" style={{ fontSize: 14 }}></i> Downgrade</button>
          <button style={{ ...btn, color: 'var(--danger)' }}><i className="ti ti-trash" style={{ fontSize: 14 }}></i> Cancel Plan</button>
        </div>
      </div>

      {/* Plan Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { name: 'Starter', price: '$49', features: ['10 vehicles', 'Basic tracking', 'Email support', '1 user'], popular: false },
          { name: 'Professional', price: '$149', features: ['50 vehicles', 'Advanced analytics', 'Priority support', '5 users', 'API access'], popular: false },
          { name: 'Enterprise', price: '$299', features: ['Unlimited vehicles', 'Advanced analytics', 'Priority support', 'Unlimited users', 'API access', 'Custom integrations', 'SLA guarantee'], popular: true },
        ].map(p => (
          <div key={p.name} style={{
            background: p.popular ? 'rgba(0,201,167,0.04)' : 'var(--bg)',
            border: p.popular ? '2px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 10, padding: 16, position: 'relative',
          }}>
            {p.popular && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', padding: '2px 12px', borderRadius: 20, background: 'var(--accent)', color: '#00221c', fontSize: 9, fontWeight: 700, letterSpacing: '0.5px' }}>CURRENT</div>}
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{p.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>/mo</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {p.features.map(f => (
                <div key={f} style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-check" style={{ fontSize: 12, color: '#22c55e' }}></i> {f}
                </div>
              ))}
            </div>
            <button style={p.popular ? btnPrimary : btn} onClick={() => setPlan(p.name.toLowerCase())}>
              {p.popular ? 'Current Plan' : 'Switch'}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-credit-card" style={{ color: '#3b82f6' }}></i> Payment Method
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border2)' }}>
          <i className="ti ti-visa" style={{ fontSize: 24, color: '#3b82f6' }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Visa ending in 4242</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Expires 12/2028</div>
          </div>
          <button style={btn}><i className="ti ti-edit" style={{ fontSize: 14 }}></i> Update</button>
        </div>
      </div>

      {/* Invoice History */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              <th style={hdrStyle}>Invoice</th><th style={hdrStyle}>Date</th><th style={hdrStyle}>Amount</th><th style={hdrStyle}>Status</th><th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { inv: 'INV-2026-005', date: '01 Jun 2026', amount: '$299.00', status: 'paid' },
              { inv: 'INV-2026-004', date: '01 May 2026', amount: '$299.00', status: 'paid' },
              { inv: 'INV-2026-003', date: '01 Apr 2026', amount: '$299.00', status: 'paid' },
              { inv: 'INV-2026-002', date: '01 Mar 2026', amount: '$149.00', status: 'paid' },
            ].map((inv, i) => (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={cellStyle}><span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{inv.inv}</span></td>
                <td style={cellStyle}>{inv.date}</td>
                <td style={cellStyle}>{inv.amount}</td>
                <td style={cellStyle}>{badge('Paid', '#22c55e')}</td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  <button style={{ ...btn, padding: '4px 10px' }}><i className="ti ti-download" style={{ fontSize: 13 }}></i> PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ===== DATA & BACKUP TAB ===== */
function DataBackupTab() {
  const [exporting, setExporting] = useState<'idle' | 'preparing' | 'ready'>('idle');
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('90');
  const [autoBackup, setAutoBackup] = useState(true);

  const handleExport = async () => {
    setExporting('preparing');
    await new Promise(r => setTimeout(r, 2500));
    setExporting('ready');
  };

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-database" style={{ color: '#3b82f6' }}></i> Data & Backup
      </div>

      {/* Export */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-file-export" style={{ color: 'var(--accent)' }}></i> Export Data
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Export your fleet data as CSV or JSON</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select style={selectStyle}>
            <option>All Data</option><option>Vehicles Only</option><option>Drivers Only</option><option>Route History</option><option>Alerts Only</option>
          </select>
          <select style={selectStyle}>
            <option>CSV</option><option>JSON</option>
          </select>
          <button style={exporting === 'idle' ? btnPrimary : btn} onClick={handleExport} disabled={exporting === 'preparing'}>
            {exporting === 'preparing' ? <><i className="ti ti-loader" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> Preparing...</> :
             exporting === 'ready' ? <><i className="ti ti-check" style={{ fontSize: 14 }}></i> Download Ready</> :
             <><i className="ti ti-download" style={{ fontSize: 14 }}></i> Export</>}
          </button>
          {exporting === 'ready' && (
            <span style={{ fontSize: 11, color: 'var(--text3)', cursor: 'pointer' }}
              onClick={() => setExporting('idle')}>
              <i className="ti ti-x" style={{ fontSize: 11 }}></i> Dismiss
            </span>
          )}
        </div>
      </div>

      {/* Backup Schedule */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-clock" style={{ color: '#f59e0b' }}></i> Automatic Backups
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Schedule regular backups of your data</div>
          </div>
          <Toggle enabled={autoBackup} onChange={setAutoBackup} />
        </div>
        {autoBackup && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Backup Frequency</label>
              <select value={backupSchedule} onChange={e => setBackupSchedule(e.target.value)} style={selectStyle}>
                <option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Retention Period (days)</label>
              <input type="number" value={retentionDays} onChange={e => setRetentionDays(e.target.value)} style={inputStyle} />
            </div>
          </div>
        )}
      </div>

      {/* Storage Usage */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-hard-drive" style={{ color: '#8b5cf6' }}></i> Storage Usage
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
            <span>2.4 GB of 50 GB used</span>
            <span>4.8%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '4.8%', height: '100%', background: 'linear-gradient(90deg, var(--accent), #00e5c8)', borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, color: 'var(--text3)' }}>
          {[
            { label: 'Trip Data', size: '1.8 GB' },
            { label: 'Vehicle Info', size: '0.3 GB' },
            { label: 'Alerts & Logs', size: '0.2 GB' },
            { label: 'Backups', size: '0.1 GB' },
          ].map(d => (
            <span key={d.label} style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border2)' }}>
              {d.label}: <strong style={{ color: 'var(--text2)' }}>{d.size}</strong>
            </span>
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button style={btn}><i className="ti ti-refresh" style={{ fontSize: 14 }}></i> Run Backup Now</button>
        <button style={btnPrimary}><i className="ti ti-device-floppy" style={{ fontSize: 15 }}></i> Save Settings</button>
      </div>
    </>
  );
}
