import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { deploymentService } from '../services/deploymentService';
import { incidentService } from '../services/incidentService';
import { revenueService } from '../services/revenueService';
import { kpiService } from '../services/kpiService';
import { useSimulation } from '../hooks/useSimulation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { DashboardStats } from '../types';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
const cardStyle: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' };

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s',
};

export default function CommandCenterPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDeployments, setActiveDeployments] = useState(0);
  const [openIncidents, setOpenIncidents] = useState(0);
  const [revenueSummary, setRevenueSummary] = useState<any>({});
  const [kpiData, setKpiData] = useState<any>(null);
  const sim = useSimulation();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [dashData, deploys, incidents, revenue, kpis] = await Promise.all([
        analyticsService.getDashboardStats(),
        deploymentService.getActive().catch(() => []),
        incidentService.getAll({ status: 'reported' }).catch(() => []),
        revenueService.getSummary().catch(() => ({})),
        kpiService.getDashboard().catch(() => null),
      ]);
      setStats(dashData);
      setActiveDeployments(deploys.length);
      setOpenIncidents(incidents.length);
      setRevenueSummary(revenue);
      setKpiData(kpis);
    } catch (err: any) {
      setError(err.message || 'Failed to load command center');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;
  if (error) return <div style={{ padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</span>
    <span style={{ cursor: 'pointer', fontSize: 13, padding: '4px 12px', borderRadius: 6, background: 'var(--bg3)', color: 'var(--text2)' }} onClick={load}>Retry</span>
  </div>;

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard value={stats?.summary.totalDrivers ?? 0} label="Total Drivers" icon="ti-users" color="#3b82f6" />
        <StatCard value={stats?.summary.totalVehicles ?? 0} label="Total Vehicles" icon="ti-truck" color="#8b5cf6" />
        <StatCard value={stats?.summary.activeSessions ?? 0} label="Active Sessions" icon="ti-player-play" color="#22c55e" />
        <StatCard value={Math.round(stats?.summary.totalDistance ?? 0)} label="Total KM" icon="ti-route" color="#f59e0b" />
        <StatCard value={activeDeployments} label="Active Deployments" icon="ti-user-check" color="#14b8a6" />
        <StatCard value={openIncidents} label="Open Incidents" icon="ti-alert-triangle" color="#ef4444" />
      </div>

      {stats && (
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
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                    <Bar dataKey="sessionCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No data</div>}
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Vehicle Usage</div>
            {stats.topVehicles.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stats.topVehicles.slice(0, 5)} cx="50%" cy="50%" labelLine={false} label={({ plateNumber, sessionCount }: any) => `${plateNumber} (${sessionCount})`} outerRadius={80} dataKey="sessionCount">
                      {stats.topVehicles.slice(0, 5).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No data</div>}
          </div>
        </div>
      )}

      {/* Simulation Status */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: sim.status.running ? 'rgba(16,185,129,0.15)' : 'rgba(92,111,138,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-radar" style={{ fontSize: 22, color: sim.status.running ? 'var(--success)' : 'var(--text3)' }}></i>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Live Simulation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sim.status.running ? 'var(--success)' : 'var(--text3)', animation: sim.status.running ? 'pulse 1.5s infinite' : 'none' }} />
                <span style={{ fontSize: 12, color: sim.status.running ? 'var(--success)' : 'var(--text3)', fontWeight: 500 }}>
                  {sim.status.running ? `Running - ${sim.status.activeVehicles} vehicles` : 'Stopped'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={sim.refresh} style={btnStyle}><i className="ti ti-refresh" style={{ fontSize: 15 }}></i> Routes</button>
            <button onClick={sim.status.running ? sim.stop : sim.start} disabled={sim.loading} style={{ ...btnStyle, background: sim.status.running ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', color: sim.status.running ? 'var(--danger)' : 'var(--success)', borderColor: sim.status.running ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)', fontWeight: 600 }}>
              <i className={`ti ${sim.status.running ? 'ti-player-stop' : 'ti-player-play'}`} style={{ fontSize: 15 }}></i>
              {sim.status.running ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI & Revenue Mini */}
      {kpiData?.totals && (
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>KPI Snapshot</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { label: 'Avg Achievement', value: `${kpiData.totals.avgAchievement?.toFixed(1) || 0}%`, color: '#f59e0b' },
              { label: 'Avg Current', value: kpiData.totals.avgCurrent?.toFixed(1) || 0, color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
