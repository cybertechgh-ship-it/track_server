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

interface Supervisor {
  id: number; name: string; phone: string; email: string; region: string;
  activeDrivers: number; performance: number;
}
interface PendingApproval {
  id: number; type: 'deployment' | 'remittance' | 'incident' | 'leave';
  requester: string; amount: string; date: string; status: 'pending' | 'approved' | 'rejected';
}
interface LiveAlert {
  id: number; time: string; location: string; vehicle: string;
  type: string; severity: 'critical' | 'high' | 'medium' | 'low'; description: string;
}
interface TeamPerf { date: string; region: string; deliveries: number; incidents: number; avgTime: number; score: number; }
interface ApprovalChainLevel {
  level: string; role: string; person: string; status: 'approved' | 'pending' | 'rejected';
}

const DEMO_SUPERVISORS: Supervisor[] = [
  { id: 1, name: 'Samuel Tetteh', phone: '+233 24 123 4567', email: 'samuel.t@evergreen.com', region: 'Greater Accra', activeDrivers: 12, performance: 92 },
  { id: 2, name: 'Ama Serwaa', phone: '+233 55 234 5678', email: 'ama.s@evergreen.com', region: 'Ashanti', activeDrivers: 9, performance: 78 },
  { id: 3, name: 'Emmanuel Nkrumah', phone: '+233 20 345 6789', email: 'emmanuel.n@evergreen.com', region: 'Western', activeDrivers: 7, performance: 85 },
  { id: 4, name: 'Fatima Abubakar', phone: '+233 50 456 7890', email: 'fatima.a@evergreen.com', region: 'Northern', activeDrivers: 5, performance: 61 },
  { id: 5, name: 'Daniel Addo', phone: '+233 27 567 8901', email: 'daniel.a@evergreen.com', region: 'Eastern', activeDrivers: 8, performance: 73 },
  { id: 6, name: 'Grace Osei', phone: '+233 24 678 9012', email: 'grace.o@evergreen.com', region: 'Central', activeDrivers: 6, performance: 88 },
  { id: 7, name: 'Kwadwo Asamoah', phone: '+233 55 789 0123', email: 'kwadwo.a@evergreen.com', region: 'Volta', activeDrivers: 4, performance: 95 },
];

const DEMO_PENDING_APPROVALS: PendingApproval[] = [
  { id: 1, type: 'deployment', requester: 'Kwame Asante', amount: 'Vehicle GT-4521-21', date: '2026-06-10', status: 'pending' },
  { id: 2, type: 'remittance', requester: 'Akua Mensah', amount: 'GHS 2,450.00', date: '2026-06-10', status: 'pending' },
  { id: 3, type: 'incident', requester: 'Yaw Owusu', amount: 'Rear-end collision', date: '2026-06-09', status: 'pending' },
  { id: 4, type: 'leave', requester: 'Esi Boateng', amount: '3 days (Jun 14-16)', date: '2026-06-09', status: 'pending' },
  { id: 5, type: 'deployment', requester: 'Kofi Adjei', amount: 'Vehicle GW-3312-20', date: '2026-06-08', status: 'approved' },
  { id: 6, type: 'remittance', requester: 'Nana Yaa', amount: 'GHS 1,800.00', date: '2026-06-08', status: 'rejected' },
  { id: 7, type: 'incident', requester: 'Kojo Bonsu', amount: 'Tire burst - No injuries', date: '2026-06-07', status: 'pending' },
  { id: 8, type: 'leave', requester: 'Adwoa Sarpong', amount: '1 day (Jun 12)', date: '2026-06-07', status: 'approved' },
];

const DEMO_LIVE_ALERTS: LiveAlert[] = [
  { id: 1, time: '2 min ago', location: 'Tema Motorway, R12', vehicle: 'GT-4521-21', type: 'Speeding', severity: 'high', description: 'Exceeded 90 km/h in construction zone' },
  { id: 2, time: '7 min ago', location: 'Kumasi Central', vehicle: 'GW-3312-20', type: 'Idling', severity: 'low', description: 'Engine idling 15+ min at depot' },
  { id: 3, time: '15 min ago', location: 'Takoradi Harbour Rd', vehicle: 'GN-8710-22', type: 'Geofence Exit', severity: 'medium', description: 'Left authorized delivery zone' },
  { id: 4, time: '28 min ago', location: 'Accra Mall Lot B', vehicle: 'GT-1129-21', type: 'Unauthorized Use', severity: 'critical', description: 'Vehicle started outside shift hours' },
  { id: 5, time: '42 min ago', location: 'Nkawkaw Layby', vehicle: 'GW-5543-19', type: 'Maintenance Due', severity: 'medium', description: 'Oil change overdue by 340 km' },
  { id: 6, time: '1 hr ago', location: 'Mankessim Hwy', vehicle: 'GT-4521-21', type: 'Harsh Braking', severity: 'high', description: '6 rapid deceleration events' },
  { id: 7, time: '1 hr ago', location: 'Tamale Depot', vehicle: 'GN-8710-22', type: 'Fuel Theft', severity: 'critical', description: 'Unexpected 12L drop over 2 min' },
  { id: 8, time: '2 hr ago', location: 'Kasoa Interchange', vehicle: 'GW-3312-20', type: 'Route Deviation', severity: 'medium', description: 'Diverted 4 km from planned route' },
  { id: 9, time: '3 hr ago', location: 'Cape Coast Castle', vehicle: 'GT-1129-21', type: 'Speeding', severity: 'high', description: '69 km/h in 50 km/h zone' },
  { id: 10, time: '4 hr ago', location: 'Tema Port', vehicle: 'GT-4521-21', type: 'Idling', severity: 'low', description: 'Engine idling 8 min at customs' },
];

const DEMO_TEAM_PERFORMANCE: TeamPerf[] = [
  { date: 'Jun 05', region: 'Greater Accra', deliveries: 187, incidents: 1, avgTime: 24.5, score: 94 },
  { date: 'Jun 05', region: 'Ashanti', deliveries: 132, incidents: 2, avgTime: 28.1, score: 81 },
  { date: 'Jun 05', region: 'Western', deliveries: 98, incidents: 0, avgTime: 22.8, score: 96 },
  { date: 'Jun 05', region: 'Northern', deliveries: 64, incidents: 3, avgTime: 35.2, score: 62 },
  { date: 'Jun 05', region: 'Eastern', deliveries: 112, incidents: 1, avgTime: 26.4, score: 84 },
  { date: 'Jun 06', region: 'Greater Accra', deliveries: 175, incidents: 0, avgTime: 23.1, score: 97 },
  { date: 'Jun 06', region: 'Ashanti', deliveries: 128, incidents: 2, avgTime: 27.6, score: 79 },
  { date: 'Jun 06', region: 'Western', deliveries: 105, incidents: 1, avgTime: 24.2, score: 88 },
  { date: 'Jun 06', region: 'Northern', deliveries: 58, incidents: 2, avgTime: 33.8, score: 65 },
  { date: 'Jun 06', region: 'Eastern', deliveries: 109, incidents: 0, avgTime: 25.9, score: 90 },
  { date: 'Jun 07', region: 'Greater Accra', deliveries: 192, incidents: 1, avgTime: 22.9, score: 95 },
  { date: 'Jun 07', region: 'Ashanti', deliveries: 140, incidents: 1, avgTime: 26.4, score: 85 },
  { date: 'Jun 07', region: 'Western', deliveries: 101, incidents: 0, avgTime: 23.5, score: 92 },
  { date: 'Jun 07', region: 'Northern', deliveries: 71, incidents: 1, avgTime: 31.0, score: 72 },
  { date: 'Jun 07', region: 'Eastern', deliveries: 115, incidents: 2, avgTime: 27.1, score: 78 },
  { date: 'Jun 08', region: 'Greater Accra', deliveries: 180, incidents: 0, avgTime: 23.8, score: 96 },
  { date: 'Jun 08', region: 'Ashanti', deliveries: 135, incidents: 2, avgTime: 27.9, score: 80 },
  { date: 'Jun 08', region: 'Western', deliveries: 95, incidents: 1, avgTime: 25.0, score: 85 },
  { date: 'Jun 08', region: 'Northern', deliveries: 66, incidents: 2, avgTime: 34.5, score: 64 },
  { date: 'Jun 08', region: 'Eastern', deliveries: 108, incidents: 1, avgTime: 26.8, score: 82 },
  { date: 'Jun 09', region: 'Greater Accra', deliveries: 185, incidents: 0, avgTime: 22.5, score: 98 },
  { date: 'Jun 09', region: 'Ashanti', deliveries: 130, incidents: 1, avgTime: 27.0, score: 84 },
  { date: 'Jun 09', region: 'Western', deliveries: 99, incidents: 0, avgTime: 23.2, score: 93 },
  { date: 'Jun 09', region: 'Northern', deliveries: 62, incidents: 1, avgTime: 32.1, score: 68 },
  { date: 'Jun 09', region: 'Eastern', deliveries: 111, incidents: 0, avgTime: 25.4, score: 88 },
  { date: 'Jun 10', region: 'Greater Accra', deliveries: 190, incidents: 1, avgTime: 23.3, score: 95 },
  { date: 'Jun 10', region: 'Ashanti', deliveries: 138, incidents: 1, avgTime: 26.8, score: 83 },
  { date: 'Jun 10', region: 'Western', deliveries: 103, incidents: 0, avgTime: 23.0, score: 94 },
  { date: 'Jun 10', region: 'Northern', deliveries: 69, incidents: 1, avgTime: 32.8, score: 70 },
  { date: 'Jun 10', region: 'Eastern', deliveries: 113, incidents: 0, avgTime: 25.7, score: 87 },
  { date: 'Jun 11', region: 'Greater Accra', deliveries: 178, incidents: 0, avgTime: 23.6, score: 97 },
  { date: 'Jun 11', region: 'Ashanti', deliveries: 134, incidents: 1, avgTime: 27.3, score: 82 },
  { date: 'Jun 11', region: 'Western', deliveries: 100, incidents: 1, avgTime: 24.8, score: 86 },
  { date: 'Jun 11', region: 'Northern', deliveries: 65, incidents: 1, avgTime: 33.4, score: 66 },
  { date: 'Jun 11', region: 'Eastern', deliveries: 110, incidents: 1, avgTime: 26.0, score: 83 },
];

const DEMO_APPROVAL_CHAIN: ApprovalChainLevel[] = [
  { level: 'driver', role: 'Driver', person: 'Kwame Asante', status: 'approved' },
  { level: 'supervisor', role: 'Supervisor', person: 'Samuel Tetteh', status: 'pending' },
  { level: 'ops', role: 'Ops Manager', person: 'Grace Osei', status: 'pending' },
  { level: 'director', role: 'Director', person: 'Dr. Kofi Arthur', status: 'pending' },
];

const severityColors: Record<string, string> = { critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const approvalTypeIcon: Record<string, string> = {
  deployment: 'ti-user-check', remittance: 'ti-currency-cedi', incident: 'ti-alert-triangle', leave: 'ti-calendar-off',
};
const regionColors: Record<string, string> = {
  'Greater Accra': '#3b82f6', 'Ashanti': '#8b5cf6', 'Western': '#22c55e', 'Northern': '#f59e0b', 'Eastern': '#ef4444',
};

function perfColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

export default function CommandCenterPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDeployments, setActiveDeployments] = useState(0);
  const [openIncidents, setOpenIncidents] = useState(0);
  const [revenueSummary, setRevenueSummary] = useState<any>({});
  const [kpiData, setKpiData] = useState<any>(null);
  const sim = useSimulation();

  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [approvalQueueOpen, setApprovalQueueOpen] = useState(true);
  const [expandedSupervisor, setExpandedSupervisor] = useState<number | null>(null);
  const [approvals, setApprovals] = useState<PendingApproval[]>(DEMO_PENDING_APPROVALS);

  const DEMO_STATS: DashboardStats = {
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

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [dashData, deploys, incidents, revenue, kpis] = await Promise.all([
        analyticsService.getDashboardStats().catch(() => null),
        deploymentService.getActive().catch(() => []),
        incidentService.getAll({ status: 'reported' }).catch(() => []),
        revenueService.getSummary().catch(() => ({})),
        kpiService.getDashboard().catch(() => null),
      ]);
      setStats(dashData?.summary ? dashData : DEMO_STATS);
      setActiveDeployments(deploys.length || 4);
      setOpenIncidents(incidents.length || 3);
      setRevenueSummary(revenue);
      setKpiData(kpis?.totals ? kpis : { totals: { avgAchievement: 89.1, avgCurrent: 85.2 } });
    } catch (err: any) {
      setStats(DEMO_STATS);
      setActiveDeployments(4);
      setOpenIncidents(3);
      setKpiData({ totals: { avgAchievement: 89.1, avgCurrent: 85.2 } });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: number) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as const } : a));
  };
  const handleReject = (id: number) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' as const } : a));
  };

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const criticalAlerts = DEMO_LIVE_ALERTS.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  const avgTeamScore = Math.round(DEMO_TEAM_PERFORMANCE.filter(t => t.date === 'Jun 11').reduce((s, t) => s + t.score, 0) / 5);

  const filteredApprovals = approvalFilter === 'all' ? approvals : approvals.filter(a => a.type === approvalFilter);

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
      {/* Supervisor Dashboard Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="las la-users" style={{ fontSize: 22, color: '#3b82f6' }}></i>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{DEMO_SUPERVISORS.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Active Supervisors</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="las la-clipboard-list" style={{ fontSize: 22, color: '#f59e0b' }}></i>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
              {pendingCount}
              {pendingCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>Pending</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Approvals</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <i className="las la-bell-ringing" style={{ fontSize: 22, color: '#ef4444' }}></i>
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{DEMO_LIVE_ALERTS.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Live Alerts ({criticalAlerts} critical)</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="las la-chart-line" style={{ fontSize: 22, color: '#22c55e' }}></i>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: perfColor(avgTeamScore) }}>{avgTeamScore}%</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Team Performance</div>
          </div>
        </div>
      </div>

      {/* Approval Queue Panel + Live Operations Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 16 }}>
        {/* Approval Queue */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, cursor: 'pointer' }} onClick={() => setApprovalQueueOpen(v => !v)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="las la-clipboard-list" style={{ fontSize: 18, color: 'var(--text)' }}></i>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Approval Queue</span>
              {pendingCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>{pendingCount} pending</span>}
            </div>
            <i className={`ti ${approvalQueueOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 16, color: 'var(--text3)' }}></i>
          </div>
          {approvalQueueOpen && (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                {['all', 'deployment', 'remittance', 'incident', 'leave'].map(f => (
                  <button key={f} onClick={() => setApprovalFilter(f)} style={{
                    ...btnStyle, padding: '4px 12px', fontSize: 12,
                    background: approvalFilter === f ? 'var(--accent)' : 'var(--bg3)',
                    color: approvalFilter === f ? '#00221c' : 'var(--text2)',
                    borderColor: approvalFilter === f ? 'var(--accent)' : 'var(--border2)',
                    fontWeight: approvalFilter === f ? 600 : 400,
                  }}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredApprovals.map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                    borderRadius: 8, background: 'var(--bg3)',
                    border: '1px solid var(--border2)',
                    opacity: a.status !== 'pending' ? 0.6 : 1,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.status === 'approved' ? '#22c55e' : a.status === 'rejected' ? '#ef4444' : '#3b82f6'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${approvalTypeIcon[a.type] || 'ti-file'}`} style={{ fontSize: 16, color: a.status === 'approved' ? '#22c55e' : a.status === 'rejected' ? '#ef4444' : '#3b82f6' }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.requester}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 999, background: a.type === 'deployment' ? 'rgba(59,130,246,0.15)' : a.type === 'remittance' ? 'rgba(245,158,11,0.15)' : a.type === 'incident' ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)', color: a.type === 'deployment' ? '#3b82f6' : a.type === 'remittance' ? '#f59e0b' : a.type === 'incident' ? '#ef4444' : '#8b5cf6' }}>
                          {a.type}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{a.amount} &middot; {a.date}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {a.status === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(a.id)} style={{ ...btnStyle, padding: '4px 10px', background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>
                            <i className="las la-check" style={{ fontSize: 14 }}></i>
                          </button>
                          <button onClick={() => handleReject(a.id)} style={{ ...btnStyle, padding: '4px 10px', background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
                            <i className="las la-times" style={{ fontSize: 14 }}></i>
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: a.status === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: a.status === 'approved' ? '#22c55e' : '#ef4444' }}>
                          <i className={`ti ${a.status === 'approved' ? 'ti-check' : 'ti-x'}`} style={{ fontSize: 12, marginRight: 4 }}></i>
                          {a.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredApprovals.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No approvals match this filter</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Live Operations Feed */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="las la-bell-ringing" style={{ fontSize: 18, color: 'var(--text)' }}></i>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Live Operations Feed</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>Real-time</span>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_LIVE_ALERTS.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg3)', borderLeft: `3px solid ${severityColors[a.severity]}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${severityColors[a.severity]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="las la-exclamation-triangle" style={{ fontSize: 14, color: severityColors[a.severity] }}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: severityColors[a.severity] }}>{a.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 999, background: `${severityColors[a.severity]}18`, color: severityColors[a.severity] }}>{a.severity}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2 }}>{a.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    <i className="las la-map-pin" style={{ fontSize: 11, marginRight: 3 }}></i>{a.location}
                    <span style={{ margin: '0 6px' }}>&middot;</span>
                    <i className="las la-truck" style={{ fontSize: 11, marginRight: 3 }}></i>{a.vehicle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supervisor Team Overview */}
      <div style={cardStyle}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="las la-users" style={{ fontSize: 18 }}></i>
          Supervisor Team Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {DEMO_SUPERVISORS.map((sup, idx) => (
            <div key={sup.id} style={{ background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border2)', overflow: 'hidden' }}>
              <div style={{ padding: 14, cursor: 'pointer' }} onClick={() => setExpandedSupervisor(expandedSupervisor === sup.id ? null : sup.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${regionColors[sup.region] || '#5c6f8a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {sup.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{sup.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="las la-map-pin" style={{ fontSize: 11 }}></i>{sup.region}
                      <span style={{ margin: '0 4px' }}>&middot;</span>
                      <i className="las la-compass" style={{ fontSize: 11 }}></i>{sup.activeDrivers} drivers
                    </div>
                  </div>
                  <i className={`ti ${expandedSupervisor === sup.id ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 14, color: 'var(--text3)' }}></i>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>Performance</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: perfColor(sup.performance) }}>{sup.performance}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 10, background: 'var(--bg2)' }}>
                    <div style={{ height: '100%', borderRadius: 10, background: perfColor(sup.performance), width: `${sup.performance}%` }} />
                  </div>
                </div>
              </div>
              {expandedSupervisor === sup.id && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', marginTop: 0 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                    <div style={{ padding: 8, background: 'var(--bg2)', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Phone</div>
                      <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, marginTop: 2 }}>{sup.phone}</div>
                    </div>
                    <div style={{ padding: 8, background: 'var(--bg2)', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Email</div>
                      <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{sup.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button style={{ ...btnStyle, flex: 1, justifyContent: 'center', padding: '6px 0', fontSize: 11 }}>
                      <i className="las la-phone" style={{ fontSize: 12 }}></i> Call
                    </button>
                    <button style={{ ...btnStyle, flex: 1, justifyContent: 'center', padding: '6px 0', fontSize: 11 }}>
                      <i className="las la-envelope" style={{ fontSize: 12 }}></i> Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance 7-Day + Approval Chain */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        {/* 7-Day Team Performance */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="las la-chart-line" style={{ fontSize: 18 }}></i>
            7-Day Team Performance
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date', 'Region', 'Deliveries', 'Incidents', 'Avg Time', 'Score'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text3)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_TEAM_PERFORMANCE.filter(t => t.date === 'Jun 11').map((t, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text)' }}>{t.date}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text)' }}>
                      <span style={{ color: regionColors[t.region] || 'var(--text)' }}>{t.region}</span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text)' }}>{t.deliveries}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: t.incidents > 1 ? '#ef4444' : t.incidents === 1 ? '#f59e0b' : '#22c55e' }}>{t.incidents}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text)' }}>{t.avgTime} min</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: perfColor(t.score) }}>{t.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Chain Visualization */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="las la-sitemap" style={{ fontSize: 18 }}></i>
            Approval Chain
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
            {DEMO_APPROVAL_CHAIN.map((item, idx) => (
              <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', position: 'relative' }}>
                {idx < DEMO_APPROVAL_CHAIN.length - 1 && (
                  <div style={{ position: 'absolute', left: 20, top: 44, width: 2, height: 28, background: item.status === 'approved' ? '#22c55e' : 'var(--border)' }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${item.status === 'approved' ? '#22c55e' : item.status === 'rejected' ? '#ef4444' : 'var(--border2)'}`,
                  background: item.status === 'approved' ? 'rgba(34,197,94,0.12)' : item.status === 'rejected' ? 'rgba(239,68,68,0.12)' : 'var(--bg3)',
                }}>
                  <i className={`ti ${item.status === 'approved' ? 'ti-check' : item.status === 'rejected' ? 'ti-x' : 'ti-minus'}`} style={{ fontSize: 16, color: item.status === 'approved' ? '#22c55e' : item.status === 'rejected' ? '#ef4444' : 'var(--text3)' }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{item.person}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 999,
                  background: item.status === 'approved' ? 'rgba(34,197,94,0.12)' : item.status === 'rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                  color: item.status === 'approved' ? '#22c55e' : item.status === 'rejected' ? '#ef4444' : '#f59e0b',
                }}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div style={cardStyle}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="las la-bolt" style={{ fontSize: 18 }}></i>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          <button onClick={() => handleApprove(approvals.filter(a => a.status === 'pending')[0]?.id)} style={{ ...btnStyle, flexDirection: 'column', padding: 18, gap: 8, alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
            <i className="las la-check-circle" style={{ fontSize: 24, color: '#22c55e' }}></i>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>Approve Pending</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{pendingCount} items waiting</span>
          </button>
          <button style={{ ...btnStyle, flexDirection: 'column', padding: 18, gap: 8, alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <i className="las la-user-plus" style={{ fontSize: 24, color: '#3b82f6' }}></i>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>Deploy Driver</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Assign to route</span>
          </button>
          <button style={{ ...btnStyle, flexDirection: 'column', padding: 18, gap: 8, alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <i className="las la-file-text" style={{ fontSize: 24, color: '#ef4444' }}></i>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Review Incident</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{openIncidents} open cases</span>
          </button>
          <button style={{ ...btnStyle, flexDirection: 'column', padding: 18, gap: 8, alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
            <i className="las la-chart-bar" style={{ fontSize: 24, color: '#8b5cf6' }}></i>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>Generate Report</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>PDF / Excel</span>
          </button>
        </div>
      </div>

      {/* Existing stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard value={stats?.summary.totalDrivers ?? 0} label="Total Drivers" icon="ti-users" color="#3b82f6" />
        <StatCard value={stats?.summary.totalVehicles ?? 0} label="Total Vehicles" icon="ti-truck" color="#8b5cf6" />
        <StatCard value={stats?.summary.activeSessions ?? 0} label="Active Sessions" icon="ti-player-play" color="#22c55e" />
        <StatCard value={Math.round(stats?.summary.totalDistance ?? 0)} label="Total KM" icon="ti-route" color="#f59e0b" />
        <StatCard value={activeDeployments} label="Active Deployments" icon="ti-user-check" color="#14b8a6" />
        <StatCard value={openIncidents} label="Open Incidents" icon="ti-alert-triangle" color="#ef4444" />
      </div>

      {/* Existing charts */}
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
              <i className="las la-satellite-dish" style={{ fontSize: 22, color: sim.status.running ? 'var(--success)' : 'var(--text3)' }}></i>
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
            <button onClick={sim.refresh} style={btnStyle}><i className="las la-sync" style={{ fontSize: 15 }}></i> Routes</button>
            <button onClick={sim.status.running ? sim.stop : sim.start} disabled={sim.loading} style={{ ...btnStyle, background: sim.status.running ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', color: sim.status.running ? 'var(--danger)' : 'var(--success)', borderColor: sim.status.running ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)', fontWeight: 600 }}>
              <i className={`ti ${sim.status.running ? 'ti-player-stop' : 'ti-player-play'}`} style={{ fontSize: 15 }}></i>
              {sim.status.running ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Snapshot */}
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
