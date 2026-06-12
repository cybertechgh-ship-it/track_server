import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%',
};
const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
);

interface Report {
  id: number;
  title: string;
  type: string;
  period: string;
  format: string;
  createdAt: string;
  status: 'ready' | 'generating' | 'failed';
}

interface ReportCard {
  title: string;
  desc: string;
  icon: string;
  color: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

interface ScheduledReport {
  id: number;
  name: string;
  frequency: string;
  nextRun: string;
  status: string;
  icon: string;
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CHART_DATA = MONTHS_SHORT.map((m, i) => ({
  month: m,
  distance: [42000, 38500, 48392, 51200, 47800, 52300, 55600, 48900, 53400, 49800, 56100, 60200][i],
  fuel: [11200, 10800, 12847, 13500, 12200, 14100, 14800, 12500, 13800, 12900, 15200, 16100][i],
  revenue: [185000, 172000, 210500, 228000, 215000, 243000, 261000, 232000, 251000, 238000, 274000, 295000][i],
  incidents: [23, 18, 15, 21, 19, 12, 14, 17, 11, 13, 9, 8][i],
  activity: [2450, 2320, 2680, 2870, 2760, 3010, 3120, 2840, 2950, 2780, 3180, 3350][i],
}));

const chartConfigs: Record<string, { bars: { key: string; color: string; name: string }[] }> = {
  distance: { bars: [{ key: 'distance', color: '#3b82f6', name: 'Distance (km)' }] },
  fuel: { bars: [{ key: 'fuel', color: '#f59e0b', name: 'Fuel (L)' }] },
  revenue: { bars: [{ key: 'revenue', color: '#22c55e', name: 'Revenue (GHS)' }] },
  incidents: { bars: [{ key: 'incidents', color: '#ef4444', name: 'Incidents' }] },
  activity: { bars: [{ key: 'activity', color: '#8b5cf6', name: 'Activity (hrs)' }] },
};

const REPORT_CARDS: ReportCard[] = [
  { title: 'Distance Traveled', desc: 'Total fleet distance this month', icon: 'ti-route', color: '#3b82f6', value: '48,392 km', trend: '+12.4%', trendUp: true },
  { title: 'Speed Violations', desc: 'Vehicles exceeding speed limit', icon: 'ti-speedometer', color: '#ef4444', value: '187', trend: '-8.2%', trendUp: false },
  { title: 'Fuel Consumption', desc: 'Total fuel used this period', icon: 'ti-gas-station', color: '#f59e0b', value: '12,847 L', trend: '+3.1%', trendUp: true },
  { title: 'Stop Duration', desc: 'Average idle / stop time', icon: 'ti-clock-pause', color: '#8b5cf6', value: '43 min', trend: '-5.7%', trendUp: false },
  { title: 'Driver Activity', desc: 'Active driving hours', icon: 'ti-user-check', color: '#22c55e', value: '2,940 hrs', trend: '+7.3%', trendUp: true },
  { title: 'Device Health', desc: 'Online vs offline devices', icon: 'ti-devices', color: '#00c9a7', value: '94% online', trend: '+2.1%', trendUp: true },
  { title: 'Trip Completion Rate', desc: 'Trips completed successfully', icon: 'ti-flag-check', color: '#06b6d4', value: '96.8%', trend: '+1.5%', trendUp: true },
  { title: 'Revenue per KM', desc: 'Average revenue per kilometer', icon: 'ti-coin', color: '#eab308', value: 'GHS 4.52', trend: '+6.3%', trendUp: true },
  { title: 'Fleet Utilization', desc: 'Active vs available vehicles', icon: 'ti-truck', color: '#a855f7', value: '78%', trend: '+4.8%', trendUp: true },
  { title: 'Incident Rate', desc: 'Incidents per 10,000 km', icon: 'ti-alert-triangle', color: '#f97316', value: '2.3', trend: '-12.1%', trendUp: false },
  { title: 'Idle Time Ratio', desc: 'Engine-on idle percentage', icon: 'ti-hourglass-empty', color: '#ec4899', value: '14.2%', trend: '-3.4%', trendUp: false },
  { title: 'On-Time Performance', desc: 'Deliveries on schedule', icon: 'ti-clock-check', color: '#14b8a6', value: '91.5%', trend: '+2.7%', trendUp: true },
];

const MOCK_REPORTS: Report[] = [
  { id: 1, title: 'Monthly Fleet Summary', type: 'Summary', period: 'May 2026', format: 'PDF', createdAt: '2026-06-01', status: 'ready' },
  { id: 2, title: 'Driver Performance Q2', type: 'Performance', period: 'Q2 2026', format: 'XLSX', createdAt: '2026-06-05', status: 'ready' },
  { id: 3, title: 'Fuel Consumption Analysis', type: 'Analytics', period: 'May 2026', format: 'PDF', createdAt: '2026-06-10', status: 'generating' },
  { id: 4, title: 'Geofence Violations', type: 'Compliance', period: 'Last 30 Days', format: 'CSV', createdAt: '2026-06-11', status: 'ready' },
  { id: 5, title: 'Speed Violation Report', type: 'Safety', period: 'May 2026', format: 'PDF', createdAt: '2026-06-12', status: 'ready' },
  { id: 6, title: 'Maintenance Schedule', type: 'Maintenance', period: 'June 2026', format: 'XLSX', createdAt: '2026-06-13', status: 'ready' },
  { id: 7, title: 'Quarterly Audit Report', type: 'Audit', period: 'Q1 2026', format: 'PDF', createdAt: '2026-04-01', status: 'ready' },
  { id: 8, title: 'Annual Safety Compliance', type: 'Compliance', period: '2025', format: 'PDF', createdAt: '2026-01-15', status: 'ready' },
  { id: 9, title: 'Driver Scorecard Ranking', type: 'Performance', period: 'April 2026', format: 'XLSX', createdAt: '2026-05-02', status: 'ready' },
  { id: 10, title: 'Fuel Theft Detection Report', type: 'Fuel', period: 'March 2026', format: 'CSV', createdAt: '2026-04-05', status: 'ready' },
  { id: 11, title: 'Route Efficiency Analysis', type: 'Analytics', period: 'April 2026', format: 'PDF', createdAt: '2026-05-10', status: 'generating' },
  { id: 12, title: 'Vehicle Inspection Summary', type: 'Maintenance', period: 'May 2026', format: 'PDF', createdAt: '2026-06-08', status: 'ready' },
  { id: 13, title: 'Tire Wear & Replacement', type: 'Maintenance', period: 'Q2 2026', format: 'XLSX', createdAt: '2026-06-14', status: 'ready' },
  { id: 14, title: 'Insurance Risk Assessment', type: 'Safety', period: '2025', format: 'PDF', createdAt: '2026-02-20', status: 'ready' },
  { id: 15, title: 'Driver Hours of Service', type: 'Compliance', period: 'May 2026', format: 'CSV', createdAt: '2026-06-03', status: 'ready' },
  { id: 16, title: 'GPS Anomaly Detection', type: 'Audit', period: 'April 2026', format: 'XLSX', createdAt: '2026-05-22', status: 'generating' },
  { id: 17, title: 'CO2 Emissions Report', type: 'Fuel', period: 'May 2026', format: 'PDF', createdAt: '2026-06-07', status: 'ready' },
  { id: 18, title: 'Fleet Expansion Analysis', type: 'Analytics', period: 'Q2 2026', format: 'PDF', createdAt: '2026-06-15', status: 'ready' },
  { id: 19, title: 'Accident & Incident Log', type: 'Safety', period: 'Last 90 Days', format: 'CSV', createdAt: '2026-06-09', status: 'ready' },
  { id: 20, title: 'Monthly Revenue Report', type: 'Summary', period: 'May 2026', format: 'PDF', createdAt: '2026-06-02', status: 'ready' },
];

const SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 1, name: 'Weekly Fleet Summary', frequency: 'Weekly', nextRun: '2026-06-15', status: 'Active', icon: 'ti-file-report' },
  { id: 2, name: 'Monthly Performance Review', frequency: 'Monthly', nextRun: '2026-07-01', status: 'Active', icon: 'ti-chart-bar' },
  { id: 3, name: 'Fuel Cost Report', frequency: 'Weekly', nextRun: '2026-06-16', status: 'Active', icon: 'ti-gas-station' },
  { id: 4, name: 'Driver Compliance Check', frequency: 'Daily', nextRun: '2026-06-13', status: 'Active', icon: 'ti-shield-check' },
  { id: 5, name: 'Quarterly Audit Package', frequency: 'Quarterly', nextRun: '2026-07-01', status: 'Paused', icon: 'ti-file-text' },
  { id: 6, name: 'Maintenance Forecast', frequency: 'Monthly', nextRun: '2026-07-01', status: 'Active', icon: 'ti-tool' },
  { id: 7, name: 'Safety Incident Log', frequency: 'Daily', nextRun: '2026-06-13', status: 'Active', icon: 'ti-alert-triangle' },
  { id: 8, name: 'Annual Fleet Review', frequency: 'Quarterly', nextRun: '2026-10-01', status: 'Paused', icon: 'ti-clipboard-data' },
];

const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

export default function ReportsPage() {
  const [reports] = useState<Report[]>(MOCK_REPORTS);
  const [chartTab, setChartTab] = useState('distance');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState('Fleet Summary');

  const handleDownload = useCallback((title: string) => {
    setToastMsg(`Downloading "${title}"...`);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setToastMsg('Report generated successfully!');
          setTimeout(() => setToastMsg(null), 2500);
          return 100;
        }
        return p + 10;
      });
    }, 300);
  }, []);

  const cfg = chartConfigs[chartTab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: 'var(--bg2)', border: '1px solid var(--accent)', borderRadius: 10,
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', fontSize: 13, color: 'var(--text)',
        }}>
          <i className="ti ti-circle-check" style={{ color: 'var(--accent)', fontSize: 18 }}></i>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            <i className="ti ti-report-analytics" style={{ marginRight: 8, color: 'var(--accent)' }}></i>Reports & Analytics
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Generate, schedule, and download fleet performance reports</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn}><i className="ti ti-calendar-stats" style={{ fontSize: 15 }}></i> Schedule</button>
          <button style={btnPrimary}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Generate Report</button>
        </div>
      </div>

      {/* 12 Summary Cards (3 columns, 4 rows) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {REPORT_CARDS.map(c => (
          <div key={c.title} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <i className={`ti ${c.icon}`} style={{ fontSize: 20, color: c.color }}></i>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{c.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{c.value}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                  background: c.trendUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: c.trendUp ? '#22c55e' : '#ef4444',
                }}>
                  <i className={`ti ${c.trendUp ? 'ti-trending-up' : 'ti-trending-down'}`} style={{ fontSize: 10, marginRight: 2 }}></i>
                  {c.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section with Tabs */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-chart-line" style={{ color: 'var(--accent)' }}></i> Monthly Overview
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'distance', label: 'Distance' },
              { key: 'fuel', label: 'Fuel' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'incidents', label: 'Incidents' },
              { key: 'activity', label: 'Activity' },
            ].map(t => (
              <button key={t.key} onClick={() => setChartTab(t.key)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                border: '1px solid var(--border2)', cursor: 'pointer',
                background: chartTab === t.key ? 'rgba(0,201,167,0.1)' : 'var(--bg3)',
                color: chartTab === t.key ? 'var(--accent)' : 'var(--text2)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={CHART_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 12, color: 'var(--text)',
              }}
            />
            {cfg.bars.map(b => (
              <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={[4, 4, 0, 0]} maxBarSize={32} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Generate + Scheduled Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Quick Generate Panel */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
            <i className="ti ti-file-text" style={{ marginRight: 6, color: 'var(--accent)' }}></i>Quick Generate
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select style={inputStyle} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              <option>Fleet Summary</option>
              <option>Driver Performance</option>
              <option>Fuel Analysis</option>
              <option>Violation Report</option>
              <option>Compliance Audit</option>
              <option>Maintenance Log</option>
              <option>Safety Review</option>
              <option>Route Optimization</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" style={{ ...inputStyle, flex: 1 }} defaultValue="2026-06-01" />
              <input type="date" style={{ ...inputStyle, flex: 1 }} defaultValue="2026-06-30" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select style={inputStyle}>
                <option>All Vehicles</option>
                <option>Vehicle #001 - Toyota</option>
                <option>Vehicle #002 - Nissan</option>
                <option>Vehicle #003 - Isuzu</option>
                <option>Vehicle #004 - Mercedes</option>
              </select>
              <select style={inputStyle}>
                <option>All Drivers</option>
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Mike Johnson</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select style={inputStyle}>
                <option>PDF</option>
                <option>XLSX</option>
                <option>CSV</option>
              </select>
              <button
                style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: generating ? 0.6 : 1 }}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <><i className="ti ti-loader ti-spin" style={{ fontSize: 15 }}></i> Generating... {progress}%</>
                ) : (
                  <><i className="ti ti-file-download" style={{ fontSize: 15 }}></i> Generate</>
                )}
              </button>
            </div>
            {generating && (
              <div style={{ width: '100%', height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
            <i className="ti ti-calendar-stats" style={{ marginRight: 6, color: '#3b82f6' }}></i>Scheduled Reports
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SCHEDULED_REPORTS.map(sr => (
              <div key={sr.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`ti ${sr.icon}`} style={{ fontSize: 14, color: 'var(--text3)' }}></i>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{sr.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {sr.frequency} &middot; Next: {dayjs(sr.nextRun).format('DD.MM.YYYY')}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                  background: sr.status === 'Active' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                  color: sr.status === 'Active' ? '#22c55e' : '#f59e0b',
                }}>
                  {sr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-table" style={{ color: 'var(--accent)' }}></i> Generated Reports
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>({reports.length} reports)</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...btn, padding: '5px 10px', fontSize: 12 }}><i className="ti ti-filter" style={{ fontSize: 13 }}></i> Filter</button>
            <button style={{ ...btn, padding: '5px 10px', fontSize: 12 }}><i className="ti ti-download" style={{ fontSize: 13 }}></i> Export All</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Title</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Period</th>
                <th style={hdrStyle}>Format</th>
                <th style={hdrStyle}>Created</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}></th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr
                  key={r.id}
                  style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className={`ti ${r.format === 'PDF' ? 'ti-file-type-pdf' : r.format === 'XLSX' ? 'ti-file-spreadsheet' : 'ti-file-csv'}`}
                        style={{ fontSize: 14, color: r.format === 'PDF' ? '#ef4444' : r.format === 'XLSX' ? '#22c55e' : '#3b82f6' }} />
                      <span style={{ fontWeight: 600 }}>{r.title}</span>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'var(--bg3)', color: 'var(--text2)' }}>{r.type}</span>
                  </td>
                  <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text3)' }}>{r.period}</td>
                  <td style={cellStyle}>{badge(r.format, '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text3)' }}>{dayjs(r.createdAt).format('DD.MM.YYYY')}</td>
                  <td style={cellStyle}>
                    {r.status === 'ready' ? badge('Ready', '#22c55e') :
                     r.status === 'generating' ? badge('Generating...', '#f59e0b') :
                     badge('Failed', '#ef4444')}
                  </td>
                  <td style={cellStyle}>
                    <button
                      style={{
                        ...btn, padding: '4px 10px', fontSize: 11,
                        opacity: r.status !== 'ready' ? 0.4 : 1,
                        cursor: r.status !== 'ready' ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => r.status === 'ready' && handleDownload(r.title)}
                      disabled={r.status !== 'ready'}
                    >
                      <i className="ti ti-download" style={{ fontSize: 13 }}></i> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
