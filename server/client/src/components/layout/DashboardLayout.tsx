import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSimulation } from '../../hooks/useSimulation';
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
    label: 'Management',
    items: [
      { name: 'Fleet', href: '/vehicles', icon: 'ti ti-car', badge: null as number | null },
      { name: 'Drivers', href: '/drivers', icon: 'ti ti-steering-wheel' },
      { name: 'Geofences', href: '/geofences', icon: 'ti ti-vector-bezier' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Organization', href: '/organization', icon: 'ti ti-building-community' },
      { name: 'Deployments', href: '/deployments', icon: 'ti ti-user-check' },
      { name: 'Revenue', href: '/revenue', icon: 'ti ti-currency-dollar' },
      { name: 'Incidents', href: '/incidents', icon: 'ti ti-alert-triangle' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Dashboard', href: '/', icon: 'ti ti-layout-dashboard' },
      { name: 'Command Center', href: '/command-center', icon: 'ti ti-radar' },
      { name: 'Reports', href: '/reports', icon: 'ti ti-file-analytics' },
      { name: 'KPI', href: '/kpi', icon: 'ti ti-chart-bar' },
      { name: 'Alerts', href: '/alerts', icon: 'ti ti-bell', badge: null as number | null },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Audit Log', href: '/audit', icon: 'ti ti-clipboard-list' },
      { name: 'Devices', href: '/devices', icon: 'ti ti-cpu' },
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
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
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="https://res.cloudinary.com/dwsl2ktt2/image/upload/v1781229649/trackker_h8mkk8.png"
                alt="cyTrack"
              style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)' }}>cyTrack</div>
              <div style={{
                fontSize: 10, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '1px', marginTop: 1,
              }}>Fleet Intelligence</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {sectionBadges.map(section => (
            <div key={section.label} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '1.2px',
                padding: '0 8px 6px',
              }}>{section.label}</div>
              {section.items.map(item => {
                const isActive = item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href);
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      color: isActive ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      position: 'relative',
                      background: isActive ? 'rgba(0,201,167,0.12)' : 'transparent',
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
                        position: 'absolute', left: 0, top: 4, bottom: 4, width: 3,
                        background: 'var(--accent)', borderRadius: '0 3px 3px 0',
                      }} />
                    )}
                    <i className={item.icon} style={{ fontSize: 17, width: 20, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span style={{
                        background: 'var(--danger)', color: '#fff',
                        fontSize: 10, fontWeight: 700,
                        padding: '1px 6px', borderRadius: 20,
                        minWidth: 18, textAlign: 'center',
                      }}>{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Branding */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <a href="https://cybergh.netlify.app" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 10, color: 'var(--text3)', textDecoration: 'none', letterSpacing: '0.5px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            Developed by <span style={{ fontWeight: 700 }}>CYBER</span>
          </a>
        </div>

        {/* User */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.email?.split('@')[0] || 'Admin'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {user?.role === 'admin' ? 'Super Admin' : user?.role || 'User'}
              </div>
            </div>
            <button onClick={handleLogout} aria-label="Logout" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text3)', fontSize: 14, padding: 4, display: 'flex',
              alignItems: 'center', justifyContent: 'center', borderRadius: 6,
              transition: 'color .15s ease, background .15s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#39e6d2'; e.currentTarget.style.background = 'rgba(57,230,210,.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}
            >
              <i className="ti ti-logout" style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>cyTrack</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
              Real-time fleet tracking
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 20,
              color: 'var(--success)',
              fontSize: 12,
              fontWeight: 600,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--success)',
                animation: 'pulse 1.5s infinite',
              }} />
              LIVE
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px',
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
              <i className="ti ti-radar" style={{ fontSize: 13 }}></i>
              SIM
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: sim.status.running ? 'var(--success)' : 'var(--text3)',
                animation: sim.status.running ? 'pulse 1.5s infinite' : 'none',
              }} />
            </div>

            <button
              onClick={toggleTheme}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, fontSize: 13,
                fontWeight: 500, cursor: 'pointer',
                border: '1px solid var(--border2)',
                background: 'var(--bg3)', color: 'var(--text2)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg4)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text2)'; }}
            >
              <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} style={{ fontSize: 16 }}></i>
            </button>

            <button
              onClick={() => navigate('/alerts')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, fontSize: 13,
                fontWeight: 500, cursor: 'pointer', position: 'relative',
                border: '1px solid var(--border2)',
                background: 'var(--bg3)', color: 'var(--text2)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg4)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text2)'; }}
            >
              <i className="ti ti-bell" style={{ fontSize: 16 }}></i>
              Alerts
              {alertCount > 0 && (
                <span style={{
                  background: 'var(--danger)', color: '#fff',
                  fontSize: 10, padding: '1px 5px', borderRadius: 10,
                  marginLeft: 2,
                }}>
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '22px 24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
