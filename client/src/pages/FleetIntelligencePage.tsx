import { useState, useEffect, useCallback } from 'react';
import { fleetAnalyticsService } from '../services/fleetAnalyticsService';
import { CYTRACK_LOGO } from '../constants/logo';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const sectionHeader: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 };

const metricCard = (label: string, value: string, color: string, icon: string) => (
  <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <i className={`ti ${icon}`} style={{ fontSize: 20, color }}></i>
    </div>
  </div>
);

export default function FleetIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [utilization, setUtilization] = useState<any>(null);
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [costData, setCostData] = useState<any>(null);
  const [idleData, setIdleData] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s, c, i] = await Promise.all([
        fleetAnalyticsService.utilization().catch(() => null),
        fleetAnalyticsService.driverScoreboard().catch(() => []),
        fleetAnalyticsService.costPerKm().catch(() => null),
        fleetAnalyticsService.idleMonitoring().catch(() => null),
      ]);
      setUtilization(u);
      setScoreboard(Array.isArray(s) ? s : []);
      setCostData(c);
      setIdleData(i);
    } catch { /* fallbacks applied */ }
    if (startDate && endDate) {
      fleetAnalyticsService.kpiComparison(startDate, endDate).then(setKpiData).catch(() => setKpiData(null));
    }
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleKpiCompare = () => {
    if (!startDate || !endDate) return;
    fleetAnalyticsService.kpiComparison(startDate, endDate).then(setKpiData).catch(() => setKpiData(null));
  };

  const fmt = (v: any, suffix = '') => v !== null && v !== undefined && v !== '-' ? `${Number(v).toLocaleString()}${suffix}` : '-';
  const fmtMoney = (v: any) => v !== null && v !== undefined && v !== '-' ? `GHS ${Number(v).toLocaleString()}` : '-';
  const fmtFloat = (v: any) => v !== null && v !== undefined && v !== '-' ? Number(v).toFixed(2) : '-';

  if (loading && !utilization && !costData) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}><img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />Fleet Intelligence</div>
          <div style={{ fontSize: 14, color: 'var(--text3)' }}>Analytics, KPIs, and operational insights</div>
        </div>
        <button style={btnPrimary} onClick={fetchAll}><i className="las la-sync" style={{ fontSize: 14 }}></i> Refresh</button>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12 }}>
          <div style={{ width: 24, height: 24, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Section 1 - Fleet Utilization */}
      <div>
        <div style={sectionHeader}><i className="las la-chart-bar" style={{ fontSize: 16, color: 'var(--accent)' }}></i> Fleet Utilization</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
          {metricCard('Total Vehicles', fmt(utilization?.totalVehicles), '#3b82f6', 'ti-truck')}
          {metricCard('Total Driving Hours', fmt(utilization?.totalDrivingHours, 'h'), '#22c55e', 'ti-clock')}
          {metricCard('Total Trips', fmt(utilization?.totalTrips), '#f59e0b', 'ti-route')}
          {metricCard('Avg Hours / Vehicle', fmtFloat(utilization?.avgHoursPerVehicle), '#8b5cf6', 'ti-chart-infographic')}
        </div>
      </div>

      {/* Section 2 - Driver Scoreboard */}
      <div>
        <div style={sectionHeader}><i className="las la-users" style={{ fontSize: 16, color: 'var(--accent)' }}></i> Driver Scoreboard</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  <th style={{ ...hdrStyle, width: 60 }}>#</th>
                  <th style={hdrStyle}>Driver Name</th>
                  <th style={hdrStyle}>Score</th>
                  <th style={hdrStyle}>Trips</th>
                </tr>
              </thead>
              <tbody>
                {(scoreboard.length > 0 ? scoreboard : []).map((d: any, i: number) => {
                  const score = d.score ?? d.behaviorScore ?? 0;
                  const scoreColor = score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={d.driverId || i} style={{ transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...cellStyle, width: 60, color: 'var(--text3)', fontWeight: 600, fontSize: 12 }}>{i + 1}</td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${scoreColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="las la-user" style={{ fontSize: 13, color: scoreColor }}></i>
                          </div>
                          <span style={{ fontWeight: 500 }}>{d.firstName} {d.lastName}</span>
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ fontWeight: 700, color: scoreColor }}>{score}</span>
                      </td>
                      <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{d.totalTrips ?? d.trips ?? '-'}</td>
                    </tr>
                  );
                })}
                {scoreboard.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No driver scoreboard data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3 - Cost Analysis */}
      <div>
        <div style={sectionHeader}><i className="las la-dollar-sign" style={{ fontSize: 16, color: 'var(--accent)' }}></i> Cost Analysis</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
          {metricCard('Total Distance', fmt(costData?.totalDistance, ' km'), '#3b82f6', 'ti-speedometer')}
          {metricCard('Total Cost', fmtMoney(costData?.totalCost), '#ef4444', 'ti-currency-dollar')}
          {metricCard('Fuel Cost', fmtMoney(costData?.fuelCost), '#f59e0b', 'ti-gas-station')}
          {metricCard('Maintenance', fmtMoney(costData?.maintenanceCost), '#8b5cf6', 'ti-tool')}
          {metricCard('Other Costs', fmtMoney(costData?.otherCosts), '#64748b', 'ti-adjustments')}
          {metricCard('Cost / Km', fmtMoney(costData?.costPerKm), '#22c55e', 'ti-chart-line')}
        </div>
      </div>

      {/* Section 4 - Idle Monitoring */}
      <div>
        <div style={sectionHeader}><i className="las la-clock-pause" style={{ fontSize: 16, color: 'var(--accent)' }}></i> Idle Monitoring</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
          {metricCard('Idle Alerts', fmt(idleData?.idleAlerts ?? idleData?.total ?? idleData?.count), '#f59e0b', 'ti-clock-pause')}
        </div>
      </div>

      {/* Section 5 - KPI Comparison */}
      <div>
        <div style={sectionHeader}><i className="las la-chart-line" style={{ fontSize: 16, color: 'var(--accent)' }}></i> KPI Comparison</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, width: 160 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, width: 160 }} />
          </div>
          <button style={btnPrimary} onClick={handleKpiCompare}><i className="las la-chart-pie" style={{ fontSize: 14 }}></i> Compare</button>
        </div>
        {kpiData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
            {[
              { label: 'Trips (Current)', value: fmt(kpiData?.current?.trips ?? kpiData?.currentPeriod?.trips), color: '#3b82f6', icon: 'ti-route' },
              { label: 'Trips (Previous)', value: fmt(kpiData?.previous?.trips ?? kpiData?.previousPeriod?.trips), color: '#64748b', icon: 'ti-route' },
              { label: 'Distance (Current)', value: fmt(kpiData?.current?.distance ?? kpiData?.currentPeriod?.distance, ' km'), color: '#22c55e', icon: 'ti-speedometer' },
              { label: 'Distance (Previous)', value: fmt(kpiData?.previous?.distance ?? kpiData?.previousPeriod?.distance, ' km'), color: '#64748b', icon: 'ti-speedometer' },
              { label: 'Revenue (Current)', value: fmtMoney(kpiData?.current?.revenue ?? kpiData?.currentPeriod?.revenue), color: '#f59e0b', icon: 'ti-currency-dollar' },
              { label: 'Revenue (Previous)', value: fmtMoney(kpiData?.previous?.revenue ?? kpiData?.previousPeriod?.revenue), color: '#64748b', icon: 'ti-currency-dollar' },
            ].map(m => metricCard(m.label, m.value, m.color, m.icon))}
          </div>
        )}
        {!kpiData && startDate && endDate && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13, marginTop: 12 }}>No KPI comparison data available for this period</div>
        )}
      </div>
    </div>
  );
}
