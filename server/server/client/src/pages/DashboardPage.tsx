import { useState, useEffect } from 'react';
import {
  BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { useSimulation } from '../hooks/useSimulation';
import api from '../services/api';
import type { DashboardStats, ApiResponse } from '../types';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const sim = useSimulation();

  useEffect(() => { loadDashboardData(); }, []);

  const seedDemoData = async () => {
    setSeeding(true); setSeedMsg(null);
    try {
      const res = await api.post<ApiResponse<any>>('/seed', { email: 'admin@admin.com' });
      setSeedMsg(res.data.message || 'Demo data loaded successfully!');
      setTimeout(() => { setSeedMsg(null); loadDashboardData(); }, 1500);
    } catch (err: any) {
      setSeedMsg(err.response?.data?.message || err.message || 'Seed failed');
      setTimeout(() => setSeedMsg(null), 3000);
    } finally { setSeeding(false); }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</span>
      <span style={{ cursor: 'pointer', fontSize: 13, padding: '4px 12px', borderRadius: 6, background: 'var(--bg3)', color: 'var(--text2)' }} onClick={loadDashboardData}>Retry</span>
    </div>
  );

  if (!stats) return (
    <div style={{ padding: 16, background: 'rgba(0,201,167,0.08)', border: '1px solid rgba(0,201,167,0.15)', borderRadius: 10, fontSize: 14, color: 'var(--accent)' }}>
      Dashboard data not found
    </div>
  );

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20,
    position: 'relative', overflow: 'hidden',
  };

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
    transition: 'all 0.15s',
  };

  const StatCard = ({ value, label, icon, color }: { value: number | string; label: string; icon: string; color: string }) => (
    <div style={cardStyle}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderBottomLeftRadius: '100%', opacity: 0.07, background: `linear-gradient(135deg, ${color}, ${color}40)` }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{label}</div>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`ti ${icon}`} style={{ fontSize: 22, color }}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <StatCard value={stats.summary.totalDrivers} label="Total Drivers" icon="ti-users" color="#3b82f6" />
        <StatCard value={stats.summary.totalVehicles} label="Total Vehicles" icon="ti-truck" color="#8b5cf6" />
        <StatCard value={stats.summary.activeSessions} label="Active Sessions" icon="ti-player-play" color="#22c55e" />
        <StatCard value={Math.round(stats.summary.totalDistance)} label="Total KM" icon="ti-route" color="#f59e0b" />
      </div>

      {/* Seed Demo Data */}
      {(stats.summary.totalDrivers === 0 || seedMsg) && (
        <div style={{
          ...cardStyle,
          borderColor: 'rgba(0,201,167,0.3)',
          background: 'linear-gradient(135deg, rgba(0,201,167,0.06), rgba(0,150,136,0.02))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,201,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-database" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {seedMsg ? 'Demo Data' : 'No Data Available'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                  {seedMsg || 'Load demo data to explore all features with sample vehicles, drivers, and tracking sessions.'}
                </div>
              </div>
            </div>
            <button
              onClick={seedDemoData}
              disabled={seeding}
              style={{
                ...btnStyle,
                background: 'var(--accent)',
                color: '#00221c',
                borderColor: 'var(--accent)',
                fontWeight: 600,
                opacity: seeding ? 0.6 : 1,
              }}
            >
              {seeding ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-loader" style={{ fontSize: 15, animation: 'spin 0.8s linear infinite' }}></i>
                  Loading...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-plus" style={{ fontSize: 15 }}></i>
                  Load Demo Data
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Simulation Status */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: sim.status.running ? 'rgba(16,185,129,0.15)' : 'rgba(92,111,138,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-radar" style={{ fontSize: 22, color: sim.status.running ? 'var(--success)' : 'var(--text3)' }}></i>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Live Simulation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: sim.status.running ? 'var(--success)' : 'var(--text3)',
                  animation: sim.status.running ? 'pulse 1.5s infinite' : 'none',
                }} />
                <span style={{ fontSize: 12, color: sim.status.running ? 'var(--success)' : 'var(--text3)', fontWeight: 500 }}>
                  {sim.status.running ? `Running – ${sim.status.activeVehicles} vehicles active` : 'Stopped'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={sim.refresh}
              style={btnStyle}
              title="Refresh routes"
            >
              <i className="ti ti-refresh" style={{ fontSize: 15 }}></i> Routes
            </button>
            <button
              onClick={sim.status.running ? sim.stop : sim.start}
              disabled={sim.loading}
              style={{
                ...btnStyle,
                background: sim.status.running ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                color: sim.status.running ? 'var(--danger)' : 'var(--success)',
                borderColor: sim.status.running ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
                fontWeight: 600,
              }}
            >
              <i className={`ti ${sim.status.running ? 'ti-player-stop' : 'ti-player-play'}`} style={{ fontSize: 15 }}></i>
              {sim.status.running ? 'Stop' : 'Start'} Simulation
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Top Drivers</div>
          {stats.topDrivers.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats.topDrivers.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border2)" />
                  <XAxis dataKey="firstName" tick={{ fontSize: 12, fill: 'var(--text3)' }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text3)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} formatter={(value, name) => [name === 'sessionCount' ? `${value} Sessions` : `${value} KM`, '']} labelFormatter={(label) => `Driver: ${label}`} />
                  <Bar dataKey="sessionCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No driver data available</div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Top Vehicles</div>
          {stats.topVehicles.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.topVehicles.slice(0, 5)} cx="50%" cy="50%" labelLine={false} label={({ plateNumber, sessionCount }: any) => `${plateNumber} (${sessionCount})`} outerRadius={80} dataKey="sessionCount">
                    {stats.topVehicles.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} formatter={(value) => [`${value} Sessions`, 'Usage Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No vehicle data available</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Driver Performance</div>
          {stats.topDrivers.length > 0 ? (
            <div>
              {stats.topDrivers.slice(0, 5).map((driver, index) => {
                const maxDist = Math.max(...stats.topDrivers.map(d => d.totalDistance));
                return (
                  <div key={driver.driverId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: index < 4 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: PIE_COLORS[index % PIE_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                      {driver.firstName[0]}{driver.lastName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{driver.firstName} {driver.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{driver.sessionCount} sessions &bull; {Math.round(driver.totalDistance)} km</div>
                      <div style={{ marginTop: 4, height: 5, borderRadius: 10, background: 'var(--bg3)' }}>
                        <div style={{ height: '100%', borderRadius: 10, background: 'var(--accent)', width: `${(driver.totalDistance / maxDist) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No driver performance data available</div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Vehicle Usage Rates</div>
          {stats.topVehicles.length > 0 ? (
            <div>
              {stats.topVehicles.slice(0, 5).map((vehicle, index) => {
                const maxSess = Math.max(...stats.topVehicles.map(v => v.sessionCount));
                return (
                  <div key={vehicle.vehicleId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: index < 4 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: PIE_COLORS[index % PIE_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-truck" style={{ fontSize: 16, color: '#fff' }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{vehicle.plateNumber}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{vehicle.brand} {vehicle.model} &bull; {vehicle.sessionCount} sessions</div>
                      <div style={{ marginTop: 4, height: 5, borderRadius: 10, background: 'var(--bg3)' }}>
                        <div style={{ height: '100%', borderRadius: 10, background: 'var(--accent)', width: `${(vehicle.sessionCount / maxSess) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No vehicle usage data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
