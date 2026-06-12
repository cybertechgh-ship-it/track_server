import { useState } from 'react';
import dayjs from 'dayjs';

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

const REPORT_CARDS: ReportCard[] = [
  { title: 'Distance Traveled', desc: 'Total fleet distance this month', icon: 'ti-route', color: '#3b82f6', value: '48,392 km', trend: '+12.4%', trendUp: true },
  { title: 'Speed Violations', desc: 'Vehicles exceeding speed limit', icon: 'ti-speedometer', color: '#ef4444', value: '187', trend: '-8.2%', trendUp: false },
  { title: 'Fuel Consumption', desc: 'Total fuel used this period', icon: 'ti-gas-station', color: '#f59e0b', value: '12,847 L', trend: '+3.1%', trendUp: true },
  { title: 'Stop Duration', desc: 'Average idle / stop time', icon: 'ti-clock-pause', color: '#8b5cf6', value: '43 min', trend: '-5.7%', trendUp: false },
  { title: 'Driver Activity', desc: 'Active driving hours', icon: 'ti-user-check', color: '#22c55e', value: '2,940 hrs', trend: '+7.3%', trendUp: true },
  { title: 'Device Health', desc: 'Online vs offline devices', icon: 'ti-devices', color: '#00c9a7', value: '94% online', trend: '+2.1%', trendUp: true },
];

const MOCK_REPORTS: Report[] = [
  { id: 1, title: 'Monthly Fleet Summary', type: 'Summary', period: 'May 2026', format: 'PDF', createdAt: '2026-06-01', status: 'ready' },
  { id: 2, title: 'Driver Performance Q2', type: 'Performance', period: 'Q2 2026', format: 'XLSX', createdAt: '2026-06-05', status: 'ready' },
  { id: 3, title: 'Fuel Consumption Analysis', type: 'Analytics', period: 'May 2026', format: 'PDF', createdAt: '2026-06-10', status: 'generating' },
  { id: 4, title: 'Geofence Violations', type: 'Compliance', period: 'Last 30 Days', format: 'CSV', createdAt: '2026-06-11', status: 'ready' },
  { id: 5, title: 'Speed Violation Report', type: 'Safety', period: 'May 2026', format: 'PDF', createdAt: '2026-06-12', status: 'ready' },
  { id: 6, title: 'Maintenance Schedule', type: 'Maintenance', period: 'June 2026', format: 'XLSX', createdAt: '2026-06-13', status: 'ready' },
];

const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

export default function ReportsPage() {
  const [reports] = useState<Report[]>(MOCK_REPORTS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Reports</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Generate and download fleet reports</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn}><i className="ti ti-refresh" style={{ fontSize: 15 }}></i> Refresh</button>
          <button style={btnPrimary}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Generate Report</button>
        </div>
      </div>

      {/* Report Cards */}
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
                  {c.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Chart Placeholder */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-chart-line" style={{ color: 'var(--accent)' }}></i> Monthly Overview
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Distance', 'Speed', 'Fuel', 'Activity'].map(l => (
              <button key={l} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                border: '1px solid var(--border2)', cursor: 'pointer',
                background: l === 'Distance' ? 'rgba(0,201,167,0.1)' : 'var(--bg3)',
                color: l === 'Distance' ? 'var(--accent)' : 'var(--text2)',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 10, paddingTop: 10 }}>
          {[35, 52, 41, 68, 55, 72, 61, 78, 64, 49, 73, 58].map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 9, color: 'var(--text3)' }}>{v}</span>
              <div style={{
                width: '100%', height: `${v}%`, borderRadius: '4px 4px 0 0',
                background: `linear-gradient(180deg, var(--accent), rgba(0,201,167,0.3))`,
                transition: 'height 0.3s',
                minHeight: 4,
              }} />
              <span style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}><i className="ti ti-file-text" style={{ marginRight: 6, color: 'var(--accent)' }}></i>Quick Generate</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select style={inputStyle}>
              <option>Fleet Summary</option>
              <option>Driver Performance</option>
              <option>Fuel Analysis</option>
              <option>Violation Report</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" style={{ ...inputStyle, flex: 1 }} />
              <input type="date" style={{ ...inputStyle, flex: 1 }} />
            </div>
            <button style={btnPrimary}><i className="ti ti-file-download" style={{ fontSize: 15 }}></i> Generate</button>
          </div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}><i className="ti ti-chart-bar" style={{ marginRight: 6, color: '#3b82f6' }}></i>Scheduled Reports</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>Weekly Summary</span><span style={{ color: 'var(--accent)' }}>Every Monday</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>Monthly Report</span><span style={{ color: 'var(--accent)' }}>1st of Month</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>Compliance Audit</span><span style={{ color: 'var(--accent)' }}>Quarterly</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
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
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={cellStyle}><span style={{ fontWeight: 600 }}>{r.title}</span></td>
                  <td style={cellStyle}>{r.type}</td>
                  <td style={cellStyle}>{r.period}</td>
                  <td style={cellStyle}>{badge(r.format, '#5c6f8a')}</td>
                  <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text3)' }}>{dayjs(r.createdAt).format('DD.MM.YYYY')}</td>
                  <td style={cellStyle}>
                    {r.status === 'ready' ? badge('Ready', '#22c55e') :
                     r.status === 'generating' ? badge('Generating...', '#f59e0b') :
                     badge('Failed', '#ef4444')}
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
