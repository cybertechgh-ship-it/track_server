import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSimulation } from '../../hooks/useSimulation';
import { CYTRACK_LOGO } from '../../constants/logo';
import { WhatsAppFloat } from './WhatsAppFloat';
import api from '../../services/api';
import type { ApiResponse } from '../../types';

const navSections = [
  {
    label: 'Live',
    items: [
      { name: 'Live Map', href: '/live-tracking', icon: 'ti ti-map' },
      { name: 'Trips & History', href: '/route-history', icon: 'ti ti-route' },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { name: 'Vehicles', href: '/vehicles', icon: 'ti ti-car' },
      { name: 'Drivers', href: '/drivers', icon: 'ti ti-steering-wheel' },
      { name: 'Driver Ledger', href: '/driver-ledger', icon: 'ti ti-wallet' },
      { name: 'Fuel', href: '/fuel', icon: 'ti ti-gas-station' },
      { name: 'Servicing', href: '/servicing', icon: 'ti ti-tool' },
      { name: 'Parts', href: '/parts', icon: 'ti ti-box' },
      { name: 'Vendors', href: '/vendors', icon: 'ti ti-building' },
      { name: 'Geofences', href: '/geofences', icon: 'ti ti-vector-bezier' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Organization', href: '/organization', icon: 'ti ti-building-community' },
      { name: 'Deployments', href: '/deployments', icon: 'ti ti-user-check' },
      { name: 'Bookings', href: '/bookings', icon: 'ti ti-calendar-check' },
      { name: 'Shifts', href: '/shifts', icon: 'ti ti-clock' },
      { name: 'Revenue', href: '/revenue', icon: 'ti ti-currency-dollar' },
      { name: 'Expenses', href: '/expenses', icon: 'ti ti-receipt' },
      { name: 'Invoices', href: '/invoices', icon: 'ti ti-file-invoice' },
      { name: 'Payments', href: '/payments', icon: 'ti ti-credit-card' },
      { name: 'Incidents', href: '/incidents', icon: 'ti ti-alert-triangle' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Dashboard', href: '/', icon: 'ti ti-layout-dashboard' },
      { name: 'Command Center', href: '/command-center', icon: 'ti ti-radar' },
      { name: 'Fleet Intelligence', href: '/fleet-intelligence', icon: 'ti ti-brain' },
      { name: 'Reports', href: '/reports', icon: 'ti ti-file-analytics' },
      { name: 'PDF Reports', href: '/report-management', icon: 'ti ti-file-text' },
      { name: 'KPI', href: '/kpi', icon: 'ti ti-chart-bar' },
      { name: 'Alerts', href: '/alerts', icon: 'ti ti-bell', badge: null as number | null },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Audit Log', href: '/audit', icon: 'ti ti-clipboard-list' },
      { name: 'Devices', href: '/devices', icon: 'ti ti-cpu' },
      { name: 'Documents', href: '/documents', icon: 'ti ti-files' },
      { name: 'Webhooks', href: '/webhooks', icon: 'ti ti-webhook' },
      { name: 'Settings', href: '/settings', icon: 'ti ti-settings' },
    ],
  },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const sim = useSimulation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get<ApiResponse<any[]>>('/alerts?isRead=false&limit=1');
        setAlertCount(res.data.meta?.total || 0);
      } catch {
        setAlertCount(0);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sectionBadges = navSections.map(s => ({
    ...s,
    items: s.items.map(item => {
      if (item.name === 'Alerts') return { ...item, badge: alertCount };
      if (item.name === 'Fleet') return { ...item, badge: null };
      return item;
    }),
  }));

  const SIDEBAR_W = 240;
  const SIDEBAR_COLLAPSED_W = 64;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        style={{
          width: sidebarExpanded ? SIDEBAR_W : SIDEBAR_COLLAPSED_W,
          minHeight: '100vh',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: sidebarExpanded ? '16px 18px 14px' : '16px 0',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarExpanded ? 'flex-start' : 'center',
          gap: 10,
          minHeight: 56,
        }}>
          <img
            src={CYTRACK_LOGO.url}
            alt={CYTRACK_LOGO.alt}
            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
          {sidebarExpanded && (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)' }}>{CYTRACK_LOGO.brandName}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{CYTRACK_LOGO.tagline}</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: sidebarExpanded ? '10px 8px' : '10px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {sectionBadges.map(section => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              {sidebarExpanded && (
                <div style={{
                  fontSize: 9, color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: '1.2px',
                  padding: '0 12px 4px', fontWeight: 600,
                }}>{section.label}</div>
              )}
              {section.items.map(item => {
                const isActive = item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href);
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    title={!sidebarExpanded ? item.name : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: sidebarExpanded ? '7px 12px' : '9px 0',
                      margin: sidebarExpanded ? '0 4px' : '0 auto',
                      width: sidebarExpanded ? 'auto' : 44,
                      borderRadius: 8,
                      color: isActive ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      position: 'relative',
                      background: isActive ? 'rgba(0,201,167,0.12)' : 'transparent',
                      justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--bg3)';
                        e.currentTarget.style.color = 'var(--text)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text2)';
                      }
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute', left: sidebarExpanded ? 0 : 0,
                        top: 4, bottom: 4, width: 3,
                        background: 'var(--accent)', borderRadius: '0 3px 3px 0',
                      }} />
                    )}
                    <i className={item.icon} style={{ fontSize: 17, width: 20, flexShrink: 0, textAlign: 'center' }} />
                    {sidebarExpanded && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.name}</span>}
                    {sidebarExpanded && item.badge != null && item.badge > 0 && (
                      <span style={{
                        background: 'var(--danger)', color: '#fff',
                        fontSize: 10, fontWeight: 700,
                        padding: '1px 6px', borderRadius: 20,
                        minWidth: 18, textAlign: 'center',
                      }}>{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                    {!sidebarExpanded && item.badge != null && item.badge > 0 && (
                      <div style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--danger)',
                      }} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: sidebarExpanded ? '12px 10px' : '12px 0',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarExpanded ? 'stretch' : 'center',
          gap: 4,
        }}>
          {sidebarExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email?.split('@')[0] || 'Admin'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                  {user?.role === 'admin' ? 'Super Admin' : user?.role || 'User'}
                </div>
              </div>
              <button onClick={handleLogout} aria-label="Logout" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', fontSize: 14, padding: 4, display: 'flex',
                alignItems: 'center', justifyContent: 'center', borderRadius: 6,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; }}
              >
                <i className="ti ti-logout" style={{ fontSize: 14 }} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} aria-label="Logout" title="Logout" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text3)', fontSize: 14, padding: 6, display: 'flex',
              alignItems: 'center', justifyContent: 'center', borderRadius: 6,
              margin: '0 auto',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; }}
            >
              <i className="ti ti-logout" style={{ fontSize: 16 }} />
            </button>
          )}
          <a href="https://cybergh.netlify.app" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 9, color: 'var(--text3)', textDecoration: 'none', textAlign: 'center', padding: '2px 0', letterSpacing: '0.5px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            {sidebarExpanded ? 'Developed by ' : ''}<span style={{ fontWeight: 700 }}>{sidebarExpanded ? 'CYBER' : 'C'}</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <div style={{
        marginLeft: sidebarExpanded ? SIDEBAR_W : SIDEBAR_COLLAPSED_W,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.2s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Topbar */}
        <header style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '0 20px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 20,
              color: 'var(--success)',
              fontSize: 11,
              fontWeight: 600,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
              LIVE
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              background: sim.status.running ? 'rgba(16,185,129,0.08)' : 'rgba(92,111,138,0.1)',
              border: `1px solid ${sim.status.running ? 'rgba(16,185,129,0.2)' : 'rgba(92,111,138,0.2)'}`,
              borderRadius: 20,
              color: sim.status.running ? 'var(--success)' : 'var(--text3)',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onClick={() => navigate('/live-tracking')}
              title={sim.status.running ? `${sim.status.activeVehicles} vehicles active` : 'Simulation idle'}
            >
              <i className="ti ti-radar" style={{ fontSize: 12 }}></i>
              SIM
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: sim.status.running ? 'var(--success)' : 'var(--text3)',
                animation: sim.status.running ? 'pulse 1.5s infinite' : 'none',
              }} />
            </div>

            <button onClick={toggleTheme} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '6px 10px', borderRadius: 8, fontSize: 14,
              cursor: 'pointer', border: '1px solid var(--border2)',
              background: 'var(--bg3)', color: 'var(--text2)',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg4)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text2)'; }}
            >
              <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
            </button>

            <button onClick={() => navigate('/alerts')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8, fontSize: 12,
              fontWeight: 500, cursor: 'pointer', position: 'relative',
              border: '1px solid var(--border2)',
              background: 'var(--bg3)', color: 'var(--text2)',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg4)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text2)'; }}
            >
              <i className="ti ti-bell" style={{ fontSize: 15 }}></i>
              Alerts
              {alertCount > 0 && (
                <span style={{
                  background: 'var(--danger)', color: '#fff',
                  fontSize: 10, padding: '1px 5px', borderRadius: 10, marginLeft: 2,
                }}>
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {children}
        </main>
      </div>

      <WhatsAppFloat />
    </div>
  );
};
