import { useState, useEffect, useRef } from 'react';
import { auditService, type AuditLogEntry } from '../services/auditService';
import { CYTRACK_LOGO } from '../constants/logo';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const btnDanger: React.CSSProperties = { ...btn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' };
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
  { id: 'users', label: 'Users & Roles', icon: 'ti-users' },
  { id: 'permissions', label: 'Permissions', icon: 'ti-lock' },
  { id: 'preferences', label: 'Preferences', icon: 'ti-settings' },
  { id: 'security', label: 'Security', icon: 'ti-shield-lock' },
  { id: 'bulk-import', label: 'Bulk Import', icon: 'ti-file-import' },
  { id: 'audit-log', label: 'Audit Log', icon: 'ti-clipboard-list' },
];

// â”€â”€ RBAC Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type RoleKey = 'admin' | 'manager' | 'supervisor' | 'store' | 'driver';

interface RoleDef {
  key: RoleKey;
  label: string;
  color: string;
  icon: string;
  description: string;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  { key: 'dashboard.view', label: 'View Dashboard', group: 'Dashboard' },
  { key: 'live_tracking.view', label: 'View Live Tracking', group: 'Live Tracking' },
  { key: 'route_history.view', label: 'View Route History', group: 'Route History' },
  { key: 'vehicles.view', label: 'View Vehicles', group: 'Vehicles' },
  { key: 'vehicles.manage', label: 'Manage Vehicles', group: 'Vehicles' },
  { key: 'drivers.view', label: 'View Drivers', group: 'Drivers' },
  { key: 'drivers.manage', label: 'Manage Drivers', group: 'Drivers' },
  { key: 'driver_ledger.view', label: 'View Driver Ledger', group: 'Driver Ledger' },
  { key: 'driver_ledger.manage', label: 'Manage Driver Ledger', group: 'Driver Ledger' },
  { key: 'deployments.view', label: 'View Deployments', group: 'Deployments' },
  { key: 'deployments.manage', label: 'Manage Deployments', group: 'Deployments' },
  { key: 'shifts.view', label: 'View Shifts', group: 'Shifts' },
  { key: 'shifts.manage', label: 'Manage Shifts', group: 'Shifts' },
  { key: 'revenue.view', label: 'View Revenue', group: 'Revenue' },
  { key: 'revenue.manage', label: 'Manage Revenue', group: 'Revenue' },
  { key: 'expenses.view', label: 'View Expenses', group: 'Expenses' },
  { key: 'expenses.manage', label: 'Manage Expenses', group: 'Expenses' },
  { key: 'invoices.view', label: 'View Invoices', group: 'Invoices' },
  { key: 'invoices.manage', label: 'Manage Invoices', group: 'Invoices' },
  { key: 'payments.view', label: 'View Payments', group: 'Payments' },
  { key: 'payments.manage', label: 'Manage Payments', group: 'Payments' },
  { key: 'parts.view', label: 'View Parts/Inventory', group: 'Parts' },
  { key: 'parts.manage', label: 'Manage Parts/Inventory', group: 'Parts' },
  { key: 'fuel.view', label: 'View Fuel Logs', group: 'Fuel' },
  { key: 'fuel.manage', label: 'Manage Fuel Logs', group: 'Fuel' },
  { key: 'servicing.view', label: 'View Servicing', group: 'Servicing' },
  { key: 'servicing.manage', label: 'Manage Servicing', group: 'Servicing' },
  { key: 'incidents.view', label: 'View Incidents', group: 'Incidents' },
  { key: 'incidents.manage', label: 'Manage Incidents', group: 'Incidents' },
  { key: 'reports.view', label: 'View Reports', group: 'Reports' },
  { key: 'reports.export', label: 'Export Reports', group: 'Reports' },
  { key: 'fleet_intelligence.view', label: 'View Fleet Intelligence', group: 'Fleet Intelligence' },
  { key: 'kpi.view', label: 'View KPIs', group: 'KPIs' },
  { key: 'kpi.manage', label: 'Manage KPIs', group: 'KPIs' },
  { key: 'documents.view', label: 'View Documents', group: 'Documents' },
  { key: 'documents.manage', label: 'Manage Documents', group: 'Documents' },
  { key: 'organization.view', label: 'View Organization', group: 'Organization' },
  { key: 'organization.manage', label: 'Manage Organization', group: 'Organization' },
  { key: 'users.view', label: 'View Users', group: 'Users' },
  { key: 'users.manage', label: 'Manage Users', group: 'Users' },
  { key: 'settings.view', label: 'View Settings', group: 'Settings' },
  { key: 'settings.manage', label: 'Manage Settings', group: 'Settings' },
  { key: 'audit.view', label: 'View Audit Logs', group: 'Audit' },
  { key: 'vehicles.commands', label: 'Send Vehicle Commands', group: 'Vehicles' },
];

const ROLES: RoleDef[] = [
  {
    key: 'admin', label: 'Admin', color: '#ef4444', icon: 'ti-crown',
    description: 'Full system access. Can manage all modules, users, settings, and organization.',
    permissions: ALL_PERMISSIONS.map(p => p.key),
  },
  {
    key: 'manager', label: 'Manager', color: '#3b82f6', icon: 'ti-briefcase',
    description: 'Manages operations: drivers, vehicles, deployments, finances, and reports.',
    permissions: [
      'dashboard.view', 'live_tracking.view', 'route_history.view',
      'vehicles.view', 'vehicles.manage',
      'drivers.view', 'drivers.manage',
      'driver_ledger.view', 'driver_ledger.manage',
      'deployments.view', 'deployments.manage',
      'shifts.view', 'shifts.manage',
      'revenue.view', 'revenue.manage',
      'expenses.view', 'expenses.manage',
      'invoices.view', 'invoices.manage',
      'payments.view', 'payments.manage',
      'fuel.view', 'fuel.manage',
      'servicing.view', 'servicing.manage',
      'incidents.view', 'incidents.manage',
      'reports.view', 'reports.export',
      'fleet_intelligence.view', 'kpi.view',
      'documents.view', 'documents.manage',
      'organization.view',
    ],
  },
  {
    key: 'supervisor', label: 'Supervisor', color: '#8b5cf6', icon: 'ti-user-check',
    description: 'Oversees drivers and vehicles. Can manage deployments and view reports.',
    permissions: [
      'dashboard.view', 'live_tracking.view', 'route_history.view',
      'vehicles.view',
      'drivers.view', 'drivers.manage',
      'driver_ledger.view',
      'deployments.view', 'deployments.manage',
      'shifts.view',
      'revenue.view',
      'expenses.view',
      'incidents.view', 'incidents.manage',
      'reports.view',
      'fleet_intelligence.view',
      'documents.view',
    ],
  },
  {
    key: 'store', label: 'Store', color: '#f59e0b', icon: 'ti-package',
    description: 'Manages parts inventory, fuel logs, and vehicle servicing records.',
    permissions: [
      'dashboard.view',
      'vehicles.view',
      'drivers.view',
      'parts.view', 'parts.manage',
      'fuel.view', 'fuel.manage',
      'servicing.view', 'servicing.manage',
      'expenses.view', 'expenses.manage',
      'documents.view', 'documents.manage',
      'reports.view',
    ],
  },
  {
    key: 'driver', label: 'Driver', color: '#22c55e', icon: 'ti-steering-wheel',
    description: 'Limited access. Can view own profile, sessions, and ledger.',
    permissions: [
      'dashboard.view',
      'live_tracking.view',
      'route_history.view',
      'driver_ledger.view',
      'incidents.view',
      'documents.view',
    ],
  },
];

const getRoleDef = (key: string) => ROLES.find(r => r.key === key) || ROLES[4];

// â”€â”€ Demo Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface UserRecord {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleKey;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  phone: string;
}

const DEMO_USERS: UserRecord[] = [
  { id: 1, email: 'admin@admin.com', firstName: 'Admin', lastName: 'User', role: 'admin', isActive: true, lastLogin: '2026-06-13T08:30:00Z', createdAt: '2025-01-01T00:00:00Z', phone: '+233 24 000 0001' },
  { id: 2, email: 'kwame.asante@cytrack.com', firstName: 'Kwame', lastName: 'Asante', role: 'manager', isActive: true, lastLogin: '2026-06-13T07:15:00Z', createdAt: '2025-02-15T00:00:00Z', phone: '+233 24 100 2001' },
  { id: 3, email: 'ama.mensah@cytrack.com', firstName: 'Ama', lastName: 'Mensah', role: 'supervisor', isActive: true, lastLogin: '2026-06-12T16:45:00Z', createdAt: '2025-03-10T00:00:00Z', phone: '+233 50 200 3002' },
  { id: 4, email: 'yaw.boateng@cytrack.com', firstName: 'Yaw', lastName: 'Boateng', role: 'store', isActive: true, lastLogin: '2026-06-12T14:20:00Z', createdAt: '2025-04-05T00:00:00Z', phone: '+233 55 300 4003' },
  { id: 5, email: 'efia.owusu@cytrack.com', firstName: 'Efia', lastName: 'Owusu', role: 'driver', isActive: true, lastLogin: '2026-06-13T06:00:00Z', createdAt: '2025-05-20T00:00:00Z', phone: '+233 24 400 5004' },
  { id: 6, email: 'abena.osei@cytrack.com', firstName: 'Abena', lastName: 'Osei', role: 'driver', isActive: true, lastLogin: '2026-06-13T05:45:00Z', createdAt: '2025-06-01T00:00:00Z', phone: '+233 54 600 7006' },
  { id: 7, email: 'nana.sarpong@cytrack.com', firstName: 'Nana', lastName: 'Sarpong', role: 'driver', isActive: false, lastLogin: '2026-05-28T12:00:00Z', createdAt: '2025-07-15T00:00:00Z', phone: '+233 27 700 8007' },
  { id: 8, email: 'kojo.frimpong@cytrack.com', firstName: 'Kojo', lastName: 'Frimpong', role: 'supervisor', isActive: true, lastLogin: '2026-06-11T09:30:00Z', createdAt: '2025-08-20T00:00:00Z', phone: '+233 20 444 5445' },
  { id: 9, email: 'afia.badu@cytrack.com', firstName: 'Afia', lastName: 'Badu', role: 'store', isActive: true, lastLogin: '2026-06-10T11:00:00Z', createdAt: '2025-09-10T00:00:00Z', phone: '+233 24 333 4334' },
  { id: 10, email: 'debug+user@local.test', firstName: 'Debug', lastName: 'User', role: 'driver', isActive: true, lastLogin: null, createdAt: '2026-06-12T00:00:00Z', phone: '+233 20 000 0000' },
];

// â”€â”€ Audit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('users');
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
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}><img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />Settings</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>User management, role permissions, and platform configuration</div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ width: 190, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
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
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'permissions' && <PermissionsTab />}
            {activeTab === 'preferences' && <PreferencesTab darkMode={darkMode} setDarkMode={setDarkMode} layout={layout} setLayout={setLayout} timezone={timezone} setTimezone={setTimezone} />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'bulk-import' && <BulkImportTab />}
            {activeTab === 'audit-log' && <AuditLogTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Users & Roles Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function UsersTab() {
  const [users, setUsers] = useState<UserRecord[]>(DEMO_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [viewUser, setViewUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'driver' as RoleKey, password: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleStats = ROLES.map(r => ({
    ...r,
    count: users.filter(u => u.role === r.key).length,
  }));

  const openAdd = () => {
    setEditUser(null);
    setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'driver', password: '' });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (u: UserRecord) => {
    setEditUser(u);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone, role: u.role, password: '' });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setFormError('First name, last name, and email are required');
      return;
    }
    if (!editUser && !form.password) {
      setFormError('Password is required for new users');
      return;
    }
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u));
    } else {
      const newUser: UserRecord = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...form,
        isActive: true,
        lastLogin: null,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowForm(false);
  };

  const toggleActive = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const deleteUser = (id: number) => {
    if (!confirm('Delete this user?')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="las la-users" style={{ color: 'var(--accent)' }}></i> Users & Roles
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Manage user accounts and role-based access control</div>

      {/* Role summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
        {roleStats.map(r => (
          <div key={r.key} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, textAlign: 'center', cursor: 'pointer', border: roleFilter === r.key ? `2px solid ${r.color}` : '2px solid transparent', transition: 'all 0.15s' }}
            onClick={() => setRoleFilter(roleFilter === r.key ? 'all' : r.key)}
            onMouseEnter={e => e.currentTarget.style.borderColor = r.color}
            onMouseLeave={e => { if (roleFilter !== r.key) e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <i className={`ti ${r.icon}`} style={{ fontSize: 20, color: r.color, marginBottom: 4, display: 'block' }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: r.color }}>{r.count}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }} />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 240 }} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...selectStyle, width: 140 }}>
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{filtered.length} users</span>
        </div>
        <button onClick={openAdd} style={btnPrimary}>
          <i className="las la-plus" style={{ fontSize: 15 }}></i> Add User
        </button>
      </div>

      {/* User table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>User</th>
                <th style={hdrStyle}>Email</th>
                <th style={hdrStyle}>Role</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Last Login</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const rd = getRoleDef(u.role);
                const timeSince = u.lastLogin ? timeAgo(u.lastLogin) : 'Never';
                return (
                  <tr key={u.id} style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                    onClick={() => setViewUser(u)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${rd.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className={`ti ${rd.icon}`} style={{ fontSize: 15, color: rd.color }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{u.email}</td>
                    <td style={cellStyle}>{badge(rd.label, rd.color)}</td>
                    <td style={cellStyle}>
                      {u.isActive
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#22c55e', fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />Active</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ef4444', fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />Inactive</span>
                      }
                    </td>
                    <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text3)' }}>{timeSince}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        <button onClick={() => openEdit(u)} style={{ ...btn, padding: '5px 7px' }} title="Edit"><i className="las la-edit" style={{ fontSize: 14 }} /></button>
                        <button onClick={() => toggleActive(u.id)} style={{ ...btn, padding: '5px 7px', color: u.isActive ? '#f59e0b' : '#22c55e' }} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          <i className={`ti ${u.isActive ? 'ti-player-pause' : 'ti-player-play'}`} style={{ fontSize: 14 }} />
                        </button>
                        <button onClick={() => deleteUser(u.id)} style={{ ...btnDanger, padding: '5px 7px' }} title="Delete"><i className="las la-trash-alt" style={{ fontSize: 14 }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Detail Modal */}
      {viewUser && (() => {
        const rd = getRoleDef(viewUser.role);
        const permGroups = rd.permissions.reduce((acc, p) => {
          const def = ALL_PERMISSIONS.find(ap => ap.key === p);
          if (def) { if (!acc[def.group]) acc[def.group] = []; acc[def.group].push(def.label); }
          return acc;
        }, {} as Record<string, string[]>);
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setViewUser(null)}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, width: 620, maxWidth: '92vw', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${rd.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ti ${rd.icon}`} style={{ fontSize: 24, color: rd.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{viewUser.firstName} {viewUser.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{viewUser.email}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {badge(rd.label, rd.color)}
                      {viewUser.isActive ? badge('Active', '#22c55e') : badge('Inactive', '#ef4444')}
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewUser(null)} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="las la-times" /></button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Phone</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{viewUser.phone}</div>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Last Login</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{viewUser.lastLogin ? timeAgo(viewUser.lastLogin) : 'Never'}</div>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Joined</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{new Date(viewUser.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Role Description</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>{rd.description}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Permissions ({rd.permissions.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(permGroups).map(([group, perms]) => (
                      <div key={group}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{group}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {perms.map(p => (
                            <span key={p} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: `${rd.color}12`, color: rd.color }}>{p}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add/Edit User Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, width: 560, maxWidth: '92vw', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{editUser ? 'Edit User' : 'Add User'}</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="las la-times" /></button>
            </div>
            <div style={{ padding: 22 }}>
              {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: '#ef4444' }}>{formError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+233 ..." />
                </div>
                <div>
                  <label style={labelStyle}>Role *</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as RoleKey })} style={selectStyle}>
                    {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                  </select>
                </div>
                {!editUser && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Password *</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
                  </div>
                )}
              </div>
              {/* Role preview */}
              <div style={{ marginTop: 16, padding: 12, background: 'var(--bg3)', borderRadius: 8, border: `1px solid ${getRoleDef(form.role).color}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <i className={`ti ${getRoleDef(form.role).icon}`} style={{ fontSize: 16, color: getRoleDef(form.role).color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: getRoleDef(form.role).color }}>{getRoleDef(form.role).label} Role</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{getRoleDef(form.role).permissions.length} permissions</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{getRoleDef(form.role).description}</div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={btn}>Cancel</button>
              <button onClick={handleSubmit} style={btnPrimary}>{editUser ? 'Update User' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// â”€â”€ Permissions Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PermissionsTab() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>('admin');
  const rd = getRoleDef(selectedRole);
  const permGroups = ALL_PERMISSIONS.reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="las la-lock" style={{ color: '#8b5cf6' }}></i> Role Permissions
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>View and compare permissions for each role</div>

      {/* Role selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {ROLES.map(r => (
          <button key={r.key} onClick={() => setSelectedRole(r.key)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: selectedRole === r.key ? `2px solid ${r.color}` : '2px solid var(--border2)',
            background: selectedRole === r.key ? `${r.color}10` : 'var(--bg3)',
            color: selectedRole === r.key ? r.color : 'var(--text2)',
            transition: 'all 0.15s',
          }}>
            <i className={`ti ${r.icon}`} style={{ fontSize: 16 }} />
            {r.label}
            <span style={{ fontSize: 11, opacity: 0.7 }}>({r.permissions.length})</span>
          </button>
        ))}
      </div>

      {/* Role description */}
      <div style={{ background: `${rd.color}08`, border: `1px solid ${rd.color}25`, borderRadius: 10, padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${rd.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${rd.icon}`} style={{ fontSize: 20, color: rd.color }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: rd.color }}>{rd.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{rd.description}</div>
        </div>
      </div>

      {/* Full matrix comparison */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Permission Matrix</div>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg4)' }}>
                <th style={{ ...hdrStyle, minWidth: 200 }}>Permission</th>
                {ROLES.map(r => (
                  <th key={r.key} style={{ ...hdrStyle, textAlign: 'center', minWidth: 80, color: r.color, cursor: 'pointer' }}
                    onClick={() => setSelectedRole(r.key)}>
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(permGroups).map(([group, perms]) => (
                <>
                  <tr key={`group-${group}`}>
                    <td colSpan={6} style={{ ...cellStyle, fontWeight: 700, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg3)', paddingTop: 12 }}>
                      {group}
                    </td>
                  </tr>
                  {perms.map(p => (
                    <tr key={p.key} style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...cellStyle, fontSize: 12 }}>{p.label}</td>
                      {ROLES.map(r => (
                        <td key={r.key} style={{ ...cellStyle, textAlign: 'center' }}>
                          {r.permissions.includes(p.key) ? (
                            <i className="las la-check-circle" style={{ fontSize: 16, color: '#22c55e' }} />
                          ) : (
                            <i className="las la-times-circle" style={{ fontSize: 16, color: 'var(--border2)' }} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// â”€â”€ Preferences Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PreferencesTab({ darkMode, setDarkMode, layout, setLayout, timezone, setTimezone }: any) {
  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="las la-cog" style={{ color: 'var(--accent)' }}></i> Preferences
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="las la-moon" style={{ color: '#8b5cf6' }}></i> Dark Mode
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 26 }}>Toggle dark/light theme</div>
        </div>
        <Toggle enabled={darkMode} onChange={setDarkMode} />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="las la-columns" style={{ color: '#3b82f6' }}></i> Dashboard Layout
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['compact', 'comfortable'].map(v => (
            <label key={v} style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none',
              padding: '10px 16px', borderRadius: 8, background: layout === v ? 'rgba(0,201,167,0.08)' : 'var(--bg3)',
              border: layout === v ? '1px solid var(--accent)' : '1px solid var(--border2)',
              transition: 'all 0.1s',
            }}>
              <input type="radio" name="layout" value={v} checked={layout === v} onChange={e => setLayout(e.target.value)} style={{ accentColor: 'var(--accent)', margin: 0 }} />
              <span style={{ fontSize: 13, fontWeight: layout === v ? 600 : 400, color: layout === v ? 'var(--accent)' : 'var(--text2)' }}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
      <div>
        <label style={{ ...labelStyle, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="las la-globe" style={{ color: '#f59e0b' }}></i> Timezone
        </label>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, marginLeft: 26 }}>Display times in your local timezone</div>
        <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ ...selectStyle, maxWidth: 320 }}>
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>
    </>
  );
}

// â”€â”€ Security Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        <i className="las la-shield-alt" style={{ color: '#3b82f6' }}></i> Security
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="las la-shield-alt" style={{ color: '#8b5cf6' }}></i> Enable Two-Factor Authentication
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 26 }}>Add an extra layer of security to your account</div>
        </div>
        <Toggle enabled={twoFA} onChange={setTwoFA} />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="las la-key" style={{ color: '#f59e0b' }}></i> Change Password
        </div>
        <div style={{ display: 'grid', gap: 14, maxWidth: 400 }}>
          <div><label style={labelStyle}>Current Password</label><input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>New Password</label><input type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} style={inputStyle} /></div>
          <div>
            <button style={btnPrimary} onClick={handlePwSave} disabled={!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm}>
              {pwSaved ? <><i className="las la-check" style={{ fontSize: 14 }}></i> Saved</> : <><i className="las la-save" style={{ fontSize: 14 }}></i> Update Password</>}
            </button>
          </div>
        </div>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="las la-laptop" style={{ color: '#3b82f6' }}></i> Active Sessions
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--bg3)' }}>
              <th style={hdrStyle}>IP Address</th><th style={hdrStyle}>Browser</th><th style={hdrStyle}>Device</th><th style={hdrStyle}>Last Active</th><th style={{ ...hdrStyle, textAlign: 'center' }}>Status</th>
            </tr></thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.ip}</td>
                  <td style={cellStyle}>{s.browser}</td><td style={cellStyle}>{s.device}</td><td style={cellStyle}>{s.lastActive}</td>
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

// â”€â”€ Bulk Import Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function BulkImportTab() {
  const [entityType, setEntityType] = useState('Drivers');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) setFile(f); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0] || null; if (f) setFile(f); };
  const handleUpload = () => { if (!file) return; setImporting(true); setTimeout(() => { setImporting(false); setImportDone(true); setFile(null); setTimeout(() => setImportDone(false), 3000); }, 1200); };

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="las la-file-import" style={{ color: 'var(--accent)' }}></i> Bulk Import
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Entity Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Drivers', 'Vehicles', 'Users', 'Organization Units'].map(e => (
            <button key={e} onClick={() => setEntityType(e)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: entityType === e ? '1px solid var(--accent)' : '1px solid var(--border2)',
              background: entityType === e ? 'rgba(0,201,167,0.08)' : 'var(--bg3)',
              color: entityType === e ? 'var(--accent)' : 'var(--text2)', transition: 'all 0.1s',
            }}>{e}</button>
          ))}
        </div>
      </div>
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()} style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
        background: dragging ? 'rgba(0,201,167,0.04)' : 'var(--bg3)', transition: 'all 0.15s', marginBottom: 20,
      }}>
        <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
        <i className="las la-upload" style={{ fontSize: 28, color: dragging ? 'var(--accent)' : 'var(--text3)', marginBottom: 8, display: 'block' }}></i>
        {file ? <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}><i className="las la-file-text" style={{ marginRight: 6 }}></i>{file.name} <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400, marginLeft: 8 }}>({(file.size / 1024).toFixed(1)} KB)</span></div>
          : <><div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Drag & drop or click to upload</div><div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Supports CSV and XLSX files</div></>}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button style={file && !importing ? btnPrimary : { ...btn, opacity: 0.5 }} onClick={handleUpload} disabled={!file || importing}>
          {importing ? <><i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> Importing...</> :
           importDone ? <><i className="las la-check" style={{ fontSize: 14 }}></i> Done</> :
           <><i className="las la-upload" style={{ fontSize: 14 }}></i> Upload & Import</>}
        </button>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="las la-download" style={{ color: '#3b82f6' }}></i> Download Templates
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Drivers Template', 'Vehicles Template', 'Users Template'].map(t => (
            <button key={t} style={btn}><i className="las la-file-download" style={{ fontSize: 14 }}></i> {t}</button>
          ))}
        </div>
      </div>
    </>
  );
}

// â”€â”€ Audit Log Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      } catch { setEntries(MOCK_AUDIT); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.action === filter);

  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="las la-clipboard-list" style={{ color: '#8b5cf6' }}></i> Audit Log
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>Filter:</span>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 140 }}>
          <option value="all">All Actions</option>
          {Object.entries(actionLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>{filtered.length} entries</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--bg3)' }}>
            <th style={hdrStyle}>Timestamp</th><th style={hdrStyle}>User</th><th style={hdrStyle}>Action</th><th style={hdrStyle}>Entity</th><th style={hdrStyle}>Details</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>Loading...</td></tr>
            : filtered.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>No entries</td></tr>
            : filtered.map(e => (
              <tr key={e.id} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <td style={{ ...cellStyle, fontSize: 12, whiteSpace: 'nowrap' }}>{TZ(e.createdAt)}</td>
                <td style={cellStyle}><span style={{ fontWeight: 500 }}>{e.userName}</span></td>
                <td style={cellStyle}>{badge(actionLabel[e.action] || e.action, actionColor[e.action] || '#5c6f8a')}</td>
                <td style={cellStyle}>{e.entityType}</td>
                <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text2)' }}>{e.description}{e.ipAddress && <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text3)', marginLeft: 8, fontSize: 11 }}>{e.ipAddress}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
