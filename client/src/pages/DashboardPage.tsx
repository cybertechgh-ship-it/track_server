import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { DashboardStats, ApiResponse } from '../types';
import { DASHBOARD_DRIVER_PHOTOS } from '../constants/photos';
import { CYTRACK_LOGO } from '../constants/logo';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

interface RenewalAlert {
  id: number;
  type: 'license' | 'dvla';
  driverName: string;
  plateNumber: string;
  expiryDate: string;
  daysLeft: number;
}

const RENEWAL_ALERTS: RenewalAlert[] = [
  { id: 1, type: 'license', driverName: 'Kwame Asante', plateNumber: 'GT-1000-20', expiryDate: '2026-06-20', daysLeft: 7 },
  { id: 2, type: 'dvla', driverName: 'Akua Mensah', plateNumber: 'GT-1001-20', expiryDate: '2026-06-25', daysLeft: 12 },
  { id: 3, type: 'license', driverName: 'Yaw Owusu', plateNumber: 'GT-1002-20', expiryDate: '2026-07-01', daysLeft: 18 },
  { id: 4, type: 'dvla', driverName: 'Esi Boateng', plateNumber: 'GT-1003-20', expiryDate: '2026-06-18', daysLeft: 5 },
  { id: 5, type: 'license', driverName: 'Kofi Adjei', plateNumber: 'GT-1004-20', expiryDate: '2026-07-10', daysLeft: 27 },
  { id: 6, type: 'dvla', driverName: 'Abena Osei', plateNumber: 'GT-1005-20', expiryDate: '2026-06-15', daysLeft: 2 },
  { id: 7, type: 'license', driverName: 'Nana Yaw', plateNumber: 'GT-1006-20', expiryDate: '2026-06-30', daysLeft: 17 },
  { id: 8, type: 'dvla', driverName: 'Akua Sarpong', plateNumber: 'GT-1007-20', expiryDate: '2026-07-05', daysLeft: 22 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = (user?.role || 'user') === 'admin';

  useEffect(() => { loadDashboardData(); }, []);

  const DEMO_DASHBOARD: DashboardStats = {
    summary: { totalDrivers: 15, totalVehicles: 12, activeSessions: 8, totalSessions: 342, totalDistance: 48392, avgDistance: 141.5 },
    topDrivers: [
      { driverId: 1, sessionCount: 48, totalDistance: 5840, firstName: 'Kwame', lastName: 'Asante' },
      { driverId: 2, sessionCount: 42, totalDistance: 5120, firstName: 'Akua', lastName: 'Mensah' },
      { driverId: 3, sessionCount: 39, totalDistance: 4780, firstName: 'Yaw', lastName: 'Owusu' },
      { driverId: 4, sessionCount: 35, totalDistance: 4210, firstName: 'Esi', lastName: 'Boateng' },
      { driverId: 5, sessionCount: 31, totalDistance: 3980, firstName: 'Kofi', lastName: 'Adjei' },
    ],
    topVehicles: [
      { vehicleId: 1, sessionCount: 52, totalDistance: 6200, plateNumber: 'GT-4521-21', brand: 'Toyota', model: 'Hiace' },
      { vehicleId: 2, sessionCount: 47, totalDistance: 5800, plateNumber: 'GW-3312-20', brand: 'Mercedes', model: 'Sprinter' },
      { vehicleId: 3, sessionCount: 41, totalDistance: 5100, plateNumber: 'GN-8710-22', brand: 'Nissan', model: 'Urvan' },
      { vehicleId: 4, sessionCount: 38, totalDistance: 4750, plateNumber: 'GT-1129-21', brand: 'Toyota', model: 'Hilux' },
      { vehicleId: 5, sessionCount: 29, totalDistance: 3620, plateNumber: 'GW-5543-19', brand: 'Ford', model: 'Ranger' },
    ],
  };

  const seedDemoData = async () => {
    setSeeding(true); setSeedMsg(null);
    try {
      const res = await api.post<ApiResponse<any>>('/seed', { email: 'admin@admin.com' });
      setSeedMsg(res.data.message || 'Demo data loaded!');
      setTimeout(() => { setSeedMsg(null); loadDashboardData(); }, 1500);
    } catch (err: any) {
      setSeedMsg(err.response?.data?.message || err.message || 'Seed failed');
      setTimeout(() => setSeedMsg(null), 3000);
    } finally { setSeeding(false); }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true); setError(null);
      const data = await analyticsService.getDashboardStats();
      if (data?.summary?.totalDrivers > 0) setStats(data);
      else setStats(DEMO_DASHBOARD);
    } catch { setStats(DEMO_DASHBOARD); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</span>
      <span style={{ cursor: 'pointer', fontSize: 12, padding: '4px 12px', borderRadius: 6, background: 'var(--bg3)', color: 'var(--text2)' }} onClick={loadDashboardData}>Retry</span>
    </div>
  );

  if (!stats) return (
    <div style={{ padding: 14, background: 'rgba(0,201,167,0.08)', border: '1px solid rgba(0,201,167,0.15)', borderRadius: 10, fontSize: 13, color: 'var(--accent)' }}>
      Dashboard data not found
    </div>
  );

  const card: React.CSSProperties = {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16,
    position: 'relative', overflow: 'hidden',
  };

  const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
        <img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        Dashboard
      </div>
      {/* Renewal Marquee */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
          padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6,
          flexShrink: 0, zIndex: 2,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Alerts</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 12px' }}>
          <div style={{ display: 'flex', gap: 36, animation: 'marquee 45s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
            {[...RENEWAL_ALERTS, ...RENEWAL_ALERTS].map((a, i) => (
              <div key={`${a.id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, padding: '8px 0' }}>
                <i className={`ti ${a.type === 'license' ? 'ti-id' : 'ti-car'}`} style={{ fontSize: 13, color: a.type === 'license' ? '#3b82f6' : '#8b5cf6' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.driverName}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{a.plateNumber}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                  background: a.daysLeft <= 7 ? 'rgba(239,68,68,0.12)' : a.daysLeft <= 14 ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                  color: a.daysLeft <= 7 ? '#ef4444' : a.daysLeft <= 14 ? '#f59e0b' : '#22c55e',
                }}>{a.type === 'license' ? 'License' : 'DVLA'} {a.daysLeft}d</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} } @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }`}</style>
      </div>

      {/* Stat Cards â€” 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { value: stats.summary.totalDrivers, label: 'Drivers', icon: 'ti-users', color: '#3b82f6' },
          { value: stats.summary.totalVehicles, label: 'Vehicles', icon: 'ti-truck', color: '#8b5cf6' },
          { value: stats.summary.activeSessions, label: 'Active Now', icon: 'ti-player-play', color: '#22c55e' },
          { value: Math.round(stats.summary.totalDistance).toLocaleString(), label: 'Total KM', icon: 'ti-route', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={card}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderBottomLeftRadius: '100%', opacity: 0.06, background: `linear-gradient(135deg, ${s.color}, ${s.color}40)` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 17, color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seed Demo Data â€” admin only */}
      {isAdmin && (stats.summary.totalDrivers === 0 || seedMsg) && (
        <div style={{ ...card, borderColor: 'rgba(0,201,167,0.3)', background: 'linear-gradient(135deg, rgba(0,201,167,0.06), rgba(0,150,136,0.02))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,201,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="las la-database" style={{ fontSize: 18, color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{seedMsg ? 'Demo Data' : 'No Data Available'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{seedMsg || 'Load demo data to explore all features.'}</div>
              </div>
            </div>
            <button onClick={seedDemoData} disabled={seeding} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: '1px solid var(--accent)', background: 'var(--accent)', color: '#00221c',
              opacity: seeding ? 0.6 : 1,
            }}>
              {seeding ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }} /> : <i className="las la-plus" style={{ fontSize: 14 }} />}
              {seeding ? 'Loading...' : 'Load Demo'}
            </button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Top Drivers Chart */}
        <div style={card}>
          <div style={sectionTitle}>Top Drivers</div>
          {stats.topDrivers.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={stats.topDrivers.slice(0, 5)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="firstName" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(value: any) => [`${value} sessions`, 'Trips']} />
                  <Bar dataKey="sessionCount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 12 }}>No data</div>}
        </div>

        {/* Top Vehicles Pie */}
        <div style={card}>
          <div style={sectionTitle}>Top Vehicles</div>
          {stats.topVehicles.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.topVehicles.slice(0, 5)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="sessionCount" label={({ plateNumber, sessionCount }: any) => `${plateNumber.split('-')[1]} (${sessionCount})`}>
                    {stats.topVehicles.slice(0, 5).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 12 }}>No data</div>}
        </div>
      </div>

      {/* Performance Lists Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Driver Performance */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={sectionTitle}>Driver Performance</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg3)', padding: '3px 8px', borderRadius: 6 }}>Top 5</div>
          </div>
          {stats.topDrivers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.topDrivers.slice(0, 5).map((driver, index) => {
                const maxDist = Math.max(...stats.topDrivers.map(d => d.totalDistance));
                const pct = maxDist > 0 ? (driver.totalDistance / maxDist) * 100 : 0;
                const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32'];
                const isTop3 = index < 3;
                return (
                  <div key={driver.driverId} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                    background: isTop3 ? `linear-gradient(135deg, ${PIE_COLORS[index]}10, transparent)` : 'transparent',
                    border: isTop3 ? `1px solid ${PIE_COLORS[index]}20` : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, flexShrink: 0,
                      background: isTop3 ? rankColors[index] : 'var(--bg3)',
                      color: isTop3 ? '#fff' : 'var(--text3)',
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0, overflow: 'hidden', position: 'relative',
                      background: `linear-gradient(135deg, ${PIE_COLORS[index]}, ${PIE_COLORS[index]}aa)`,
                      boxShadow: `0 2px 8px ${PIE_COLORS[index]}30`,
                    }}>
                      {DASHBOARD_DRIVER_PHOTOS[index] ? (
                        <img
                          src={DASHBOARD_DRIVER_PHOTOS[index]}
                          alt={`${driver.firstName} ${driver.lastName}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                        />
                      ) : null}
                      <div style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff', position: 'relative', zIndex: 1,
                      }}>
                        {driver.firstName[0]}{driver.lastName[0]}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{driver.firstName} {driver.lastName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>{driver.sessionCount} trips</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: PIE_COLORS[index] }}>{Math.round(driver.totalDistance)} km</span>
                      </div>
                      <div style={{ marginTop: 5, height: 4, borderRadius: 10, background: 'var(--bg3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 10, background: `linear-gradient(90deg, ${PIE_COLORS[index]}, ${PIE_COLORS[index]}88)`, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                    {isTop3 && (
                      <div style={{ fontSize: 16, flexShrink: 0 }}>
                        {index === 0 ? 'ðŸ¥‡' : index === 1 ? 'ðŸ¥ˆ' : 'ðŸ¥‰'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 12 }}>No data</div>}
        </div>

        {/* Vehicle Usage */}
        <div style={card}>
          <div style={sectionTitle}>Vehicle Usage</div>
          {stats.topVehicles.length > 0 ? (
            <div>
              {stats.topVehicles.slice(0, 5).map((vehicle, index) => {
                const maxSess = Math.max(...stats.topVehicles.map(v => v.sessionCount));
                return (
                  <div key={vehicle.vehicleId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: index < 4 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: PIE_COLORS[index % PIE_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="las la-truck" style={{ fontSize: 13, color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{vehicle.plateNumber}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{vehicle.brand} {vehicle.model} &bull; {vehicle.sessionCount} trips</div>
                      <div style={{ marginTop: 3, height: 3, borderRadius: 10, background: 'var(--bg3)' }}>
                        <div style={{ height: '100%', borderRadius: 10, background: PIE_COLORS[index % PIE_COLORS.length], width: `${(vehicle.sessionCount / maxSess) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 12 }}>No data</div>}
        </div>
      </div>
    </div>
  );
}
