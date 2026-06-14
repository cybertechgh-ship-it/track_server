import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CYTRACK_LOGO } from '../constants/logo';
import { printReport } from '../utils/printDocument';

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
  summary?: { label: string; value: string; color: string; icon: string }[];
  chartData?: { name: string; value: number; color: string }[];
  highlights?: string[];
  generatedBy?: string;
  fileSize?: string;
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
  { id: 1, title: 'Monthly Fleet Summary', type: 'Summary', period: 'May 2026', format: 'PDF', createdAt: '2026-06-01', status: 'ready', generatedBy: 'Admin', fileSize: '2.4 MB',
    summary: [
      { label: 'Total Trips', value: '1,247', color: '#3b82f6', icon: 'ti-route' },
      { label: 'Distance', value: '48,392 km', color: '#22c55e', icon: 'ti-road' },
      { label: 'Fuel Used', value: '12,847 L', color: '#f59e0b', icon: 'ti-gas-station' },
      { label: 'Revenue', value: 'GHS 210,500', color: '#8b5cf6', icon: 'ti-coin' },
    ],
    chartData: [
      { name: 'Week 1', value: 11200, color: '#3b82f6' },
      { name: 'Week 2', value: 12800, color: '#22c55e' },
      { name: 'Week 3', value: 13500, color: '#f59e0b' },
      { name: 'Week 4', value: 10892, color: '#8b5cf6' },
    ],
    highlights: ['Fleet utilization improved by 8.2% vs April', 'Zero critical incidents reported', 'Avg fuel efficiency: 3.77 km/L', 'Top performer: Kwame Asante (5,840 km)'],
  },
  { id: 2, title: 'Driver Performance Q2', type: 'Performance', period: 'Q2 2026', format: 'XLSX', createdAt: '2026-06-05', status: 'ready', generatedBy: 'Admin', fileSize: '1.8 MB',
    summary: [
      { label: 'Drivers Ranked', value: '15', color: '#3b82f6', icon: 'ti-users' },
      { label: 'Avg Score', value: '82.4', color: '#22c55e', icon: 'ti-star' },
      { label: 'Top Score', value: '97', color: '#f59e0b', icon: 'ti-trophy' },
      { label: 'At Risk', value: '2', color: '#ef4444', icon: 'ti-alert-triangle' },
    ],
    chartData: [
      { name: 'Kwame A.', value: 97, color: '#22c55e' },
      { name: 'Abena O.', value: 95, color: '#3b82f6' },
      { name: 'Kojo F.', value: 92, color: '#8b5cf6' },
      { name: 'Akua M.', value: 88, color: '#f59e0b' },
      { name: 'Yaw B.', value: 65, color: '#ef4444' },
    ],
    highlights: ['Kojo Frimpong: 192 trips, zero incidents', 'Nana Yaw suspended â€” 5 incidents in 30 days', 'Avg remittance compliance: 89%', 'Training completion rate: 72%'],
  },
  { id: 3, title: 'Fuel Consumption Analysis', type: 'Analytics', period: 'May 2026', format: 'PDF', createdAt: '2026-06-10', status: 'generating', generatedBy: 'System', fileSize: 'â€”' },
  { id: 4, title: 'Geofence Violations', type: 'Compliance', period: 'Last 30 Days', format: 'CSV', createdAt: '2026-06-11', status: 'ready', generatedBy: 'Admin', fileSize: '340 KB',
    summary: [
      { label: 'Total Violations', value: '23', color: '#ef4444', icon: 'ti-alert-triangle' },
      { label: 'Unique Vehicles', value: '8', color: '#f59e0b', icon: 'ti-truck' },
      { label: 'Unique Drivers', value: '6', color: '#3b82f6', icon: 'ti-user' },
      { label: 'Resolved', value: '18', color: '#22c55e', icon: 'ti-check' },
    ],
    chartData: [
      { name: 'Accra Central', value: 9, color: '#ef4444' },
      { name: 'Tema Industrial', value: 6, color: '#f59e0b' },
      { name: 'Kumasi Ring Road', value: 5, color: '#3b82f6' },
      { name: 'Cape Coast', value: 3, color: '#8b5cf6' },
    ],
    highlights: ['60% of violations occurred between 6-8 AM', 'GT-4521-21 flagged 4 times in restricted zone', 'All violations resolved within 48 hours', 'Recommendation: Update geofence boundaries for Tema'],
  },
  { id: 5, title: 'Speed Violation Report', type: 'Safety', period: 'May 2026', format: 'PDF', createdAt: '2026-06-12', status: 'ready', generatedBy: 'Admin', fileSize: '1.2 MB',
    summary: [
      { label: 'Violations', value: '187', color: '#ef4444', icon: 'ti-speedometer' },
      { label: 'Avg Over Speed', value: '22 km/h', color: '#f59e0b', icon: 'ti-trending-up' },
      { label: 'Worst Offender', value: '34 violations', color: '#ef4444', icon: 'ti-user' },
      { label: 'Improvement', value: '-8.2%', color: '#22c55e', icon: 'ti-trending-down' },
    ],
    chartData: [
      { name: 'Morning', value: 52, color: '#ef4444' },
      { name: 'Afternoon', value: 68, color: '#f59e0b' },
      { name: 'Evening', value: 41, color: '#3b82f6' },
      { name: 'Night', value: 26, color: '#8b5cf6' },
    ],
    highlights: ['72% of violations on Accra-Tema Motorway', 'GT-1001-20 recorded highest avg speed: 112 km/h', 'Speed limiter compliance: 94%', 'Recommendation: Install GPS-based speed alerts'],
  },
  { id: 6, title: 'Maintenance Schedule', type: 'Maintenance', period: 'June 2026', format: 'XLSX', createdAt: '2026-06-13', status: 'ready', generatedBy: 'Admin', fileSize: '890 KB',
    summary: [
      { label: 'Scheduled', value: '18', color: '#3b82f6', icon: 'ti-calendar' },
      { label: 'Overdue', value: '3', color: '#ef4444', icon: 'ti-alert' },
      { label: 'Completed', value: '12', color: '#22c55e', icon: 'ti-check' },
      { label: 'Est. Cost', value: 'GHS 24,500', color: '#f59e0b', icon: 'ti-coin' },
    ],
    chartData: [
      { name: 'Oil Change', value: 8, color: '#3b82f6' },
      { name: 'Brake Service', value: 4, color: '#ef4444' },
      { name: 'Tire Rotation', value: 3, color: '#22c55e' },
      { name: 'General Inspection', value: 3, color: '#8b5cf6' },
    ],
    highlights: ['GT-8123-21 brake service overdue by 14 days', 'Next fleet inspection: June 20, 2026', 'Estimated downtime: 2.5 days total', 'Parts in stock for 14 of 18 scheduled services'],
  },
  { id: 7, title: 'Quarterly Audit Report', type: 'Audit', period: 'Q1 2026', format: 'PDF', createdAt: '2026-04-01', status: 'ready', generatedBy: 'Compliance Team', fileSize: '3.1 MB',
    summary: [
      { label: 'Audits Completed', value: '4', color: '#22c55e', icon: 'ti-clipboard-check' },
      { label: 'Findings', value: '12', color: '#f59e0b', icon: 'ti-file-search' },
      { label: 'Critical', value: '1', color: '#ef4444', icon: 'ti-alert' },
      { label: 'Resolved', value: '9', color: '#3b82f6', icon: 'ti-check' },
    ],
    chartData: [
      { name: 'Jan', value: 3, color: '#3b82f6' },
      { name: 'Feb', value: 4, color: '#22c55e' },
      { name: 'Mar', value: 5, color: '#f59e0b' },
    ],
    highlights: ['Critical: Missing insurance docs for GT-5543-19', 'GPS data integrity: 99.2% uptime', 'All driver licenses verified and current', 'Recommendation: Automate document expiry alerts'],
  },
  { id: 8, title: 'Annual Safety Compliance', type: 'Compliance', period: '2025', format: 'PDF', createdAt: '2026-01-15', status: 'ready', generatedBy: 'Safety Officer', fileSize: '4.5 MB',
    summary: [
      { label: 'Compliance Rate', value: '96.2%', color: '#22c55e', icon: 'ti-shield-check' },
      { label: 'Incidents', value: '14', color: '#ef4444', icon: 'ti-alert-triangle' },
      { label: 'Training Hours', value: '1,240', color: '#3b82f6', icon: 'ti-school' },
      { label: 'Fines', value: 'GHS 3,200', color: '#f59e0b', icon: 'ti-coin' },
    ],
    chartData: [
      { name: 'Q1', value: 97, color: '#22c55e' },
      { name: 'Q2', value: 95, color: '#3b82f6' },
      { name: 'Q3', value: 96, color: '#8b5cf6' },
      { name: 'Q4', value: 98, color: '#22c55e' },
    ],
    highlights: ['Exceeded 95% compliance target for all quarters', 'Zero fatal accidents in 2025', 'DVLA inspection pass rate: 100%', 'Implemented new driver onboarding protocol'],
  },
  { id: 9, title: 'Driver Scorecard Ranking', type: 'Performance', period: 'April 2026', format: 'XLSX', createdAt: '2026-05-02', status: 'ready', generatedBy: 'Admin', fileSize: '1.1 MB',
    summary: [
      { label: 'Ranked', value: '15', color: '#3b82f6', icon: 'ti-list-ol' },
      { label: 'Avg Score', value: '79.8', color: '#22c55e', icon: 'ti-star' },
      { label: 'Improved', value: '6', color: '#22c55e', icon: 'ti-trending-up' },
      { label: 'Declined', value: '3', color: '#ef4444', icon: 'ti-trending-down' },
    ],
    chartData: [
      { name: 'Kwame A.', value: 94, color: '#22c55e' },
      { name: 'Abena O.', value: 91, color: '#3b82f6' },
      { name: 'Akua M.', value: 87, color: '#8b5cf6' },
      { name: 'Yaw B.', value: 62, color: '#ef4444' },
    ],
    highlights: ['Kwame Asante: #1 for 3 consecutive months', 'Biggest improver: Kweku Andoh (+12 pts)', 'Nana Yaw: score dropped to 45 â€” action required', 'Remittance compliance correlated with score (+0.73)'],
  },
  { id: 10, title: 'Fuel Theft Detection Report', type: 'Fuel', period: 'March 2026', format: 'CSV', createdAt: '2026-04-05', status: 'ready', generatedBy: 'System', fileSize: '520 KB',
    summary: [
      { label: 'Suspicious Events', value: '7', color: '#ef4444', icon: 'ti-alert' },
      { label: 'Vehicles Flagged', value: '3', color: '#f59e0b', icon: 'ti-truck' },
      { label: 'Fuel Lost', value: '185 L', color: '#ef4444', icon: 'ti-droplet' },
      { label: 'Value', value: 'GHS 2,775', color: '#f59e0b', icon: 'ti-coin' },
    ],
    chartData: [
      { name: 'GT-4521-21', value: 72, color: '#ef4444' },
      { name: 'GW-3312-20', value: 68, color: '#f59e0b' },
      { name: 'GN-8710-22', value: 45, color: '#3b82f6' },
    ],
    highlights: ['GT-4521-21: 3 fuel drops detected in off-route locations', 'GW-3312-20: fuel level dropped 15% during parked hours', 'Recommendation: Install tamper-proof fuel sensors', 'Insurance claim filed for GN-8710-22 incident'],
  },
  { id: 11, title: 'Route Efficiency Analysis', type: 'Analytics', period: 'April 2026', format: 'PDF', createdAt: '2026-05-10', status: 'generating', generatedBy: 'System', fileSize: 'â€”' },
  { id: 12, title: 'Vehicle Inspection Summary', type: 'Maintenance', period: 'May 2026', format: 'PDF', createdAt: '2026-06-08', status: 'ready', generatedBy: 'Admin', fileSize: '1.6 MB',
    summary: [
      { label: 'Inspections', value: '24', color: '#3b82f6', icon: 'ti-search' },
      { label: 'Passed', value: '20', color: '#22c55e', icon: 'ti-check' },
      { label: 'Failed', value: '4', color: '#ef4444', icon: 'ti-x' },
      { label: 'Issues Found', value: '11', color: '#f59e0b', icon: 'ti-tool' },
    ],
    chartData: [
      { name: 'Engine', value: 3, color: '#ef4444' },
      { name: 'Brakes', value: 4, color: '#f59e0b' },
      { name: 'Tires', value: 2, color: '#3b82f6' },
      { name: 'Electrical', value: 2, color: '#8b5cf6' },
    ],
    highlights: ['GT-8124-21: brake pads below minimum threshold', 'GW-5543-19: battery replacement needed', 'All passed vehicles certified until Sept 2026', 'Avg inspection time: 45 min per vehicle'],
  },
  { id: 13, title: 'Tire Wear & Replacement', type: 'Maintenance', period: 'Q2 2026', format: 'XLSX', createdAt: '2026-06-14', status: 'ready', generatedBy: 'Admin', fileSize: '780 KB',
    summary: [
      { label: 'Tires Replaced', value: '16', color: '#3b82f6', icon: 'ti-circle' },
      { label: 'Avg Wear', value: '72%', color: '#f59e0b', icon: 'ti-gauge' },
      { label: 'Cost', value: 'GHS 8,400', color: '#8b5cf6', icon: 'ti-coin' },
      { label: 'Next Due', value: '6', color: '#ef4444', icon: 'ti-clock' },
    ],
    chartData: [
      { name: 'Front Left', value: 4, color: '#ef4444' },
      { name: 'Front Right', value: 3, color: '#f59e0b' },
      { name: 'Rear Left', value: 5, color: '#3b82f6' },
      { name: 'Rear Right', value: 4, color: '#8b5cf6' },
    ],
    highlights: ['GT-1000-20: all 4 tires replaced (128,000 km)', 'Recommended tire brand: Michelin XDA2+', 'Avg tire life: 65,000 km under current conditions', 'Potential savings: GHS 1,200 with bulk purchase'],
  },
  { id: 14, title: 'Insurance Risk Assessment', type: 'Safety', period: '2025', format: 'PDF', createdAt: '2026-02-20', status: 'ready', generatedBy: 'Compliance Team', fileSize: '2.8 MB',
    summary: [
      { label: 'Policies', value: '12', color: '#3b82f6', icon: 'ti-file-check' },
      { label: 'Claims', value: '3', color: '#ef4444', icon: 'ti-file-alert' },
      { label: 'Premium', value: 'GHS 42,000', color: '#f59e0b', icon: 'ti-coin' },
      { label: 'Risk Score', value: 'Low', color: '#22c55e', icon: 'ti-shield-check' },
    ],
    chartData: [
      { name: 'Comprehensive', value: 8, color: '#3b82f6' },
      { name: 'Third Party', value: 3, color: '#f59e0b' },
      { name: 'Liability', value: 1, color: '#8b5cf6' },
    ],
    highlights: ['No at-fault accidents in Q3-Q4 2025', 'Claims ratio: 12% (industry avg: 35%)', 'Recommended: increase coverage for GT-4521-21', 'Discount eligibility: 8% no-claims bonus'],
  },
  { id: 15, title: 'Driver Hours of Service', type: 'Compliance', period: 'May 2026', format: 'CSV', createdAt: '2026-06-03', status: 'ready', generatedBy: 'System', fileSize: '430 KB',
    summary: [
      { label: 'Violations', value: '8', color: '#ef4444', icon: 'ti-alert' },
      { label: 'Avg Hours/Day', value: '9.2', color: '#3b82f6', icon: 'ti-clock' },
      { label: 'Over 12hrs', value: '3', color: '#f59e0b', icon: 'ti-alert-triangle' },
      { label: 'Compliant', value: '94%', color: '#22c55e', icon: 'ti-check' },
    ],
    chartData: [
      { name: '8-10 hrs', value: 9, color: '#22c55e' },
      { name: '10-12 hrs', value: 3, color: '#f59e0b' },
      { name: '12+ hrs', value: 3, color: '#ef4444' },
    ],
    highlights: ['Kojo Frimpong: avg 11.2 hrs/day â€” review needed', 'Mandatory rest break compliance: 87%', 'Weekend violations: 0 (improvement from 4 in April)', 'Recommendation: limit shifts to 10 hrs max'],
  },
  { id: 16, title: 'GPS Anomaly Detection', type: 'Audit', period: 'April 2026', format: 'XLSX', createdAt: '2026-05-22', status: 'generating', generatedBy: 'System', fileSize: 'â€”' },
  { id: 17, title: 'CO2 Emissions Report', type: 'Fuel', period: 'May 2026', format: 'PDF', createdAt: '2026-06-07', status: 'ready', generatedBy: 'Admin', fileSize: '1.4 MB',
    summary: [
      { label: 'Total CO2', value: '34.2 tons', color: '#22c55e', icon: 'ti-leaf' },
      { label: 'Per Vehicle', value: '2.85 tons', color: '#3b82f6', icon: 'ti-truck' },
      { label: 'Per KM', value: '0.71 kg', color: '#f59e0b', icon: 'ti-route' },
      { label: 'Reduction', value: '-4.2%', color: '#22c55e', icon: 'ti-trending-down' },
    ],
    chartData: [
      { name: 'Diesel', value: 22, color: '#f59e0b' },
      { name: 'Petrol', value: 8, color: '#3b82f6' },
      { name: 'Hybrid Savings', value: 4.2, color: '#22c55e' },
    ],
    highlights: ['CO2 down 4.2% vs same period last year', 'Hybrid vehicles saved 4.2 tons CO2', 'Recommendation: phase out 3 oldest diesel vehicles', 'Target: 10% reduction by end of 2026'],
  },
  { id: 18, title: 'Fleet Expansion Analysis', type: 'Analytics', period: 'Q2 2026', format: 'PDF', createdAt: '2026-06-15', status: 'ready', generatedBy: 'Admin', fileSize: '2.1 MB',
    summary: [
      { label: 'Current Fleet', value: '12', color: '#3b82f6', icon: 'ti-truck' },
      { label: 'Utilization', value: '78%', color: '#22c55e', icon: 'ti-chart-pie' },
      { label: 'Projected Need', value: '16', color: '#f59e0b', icon: 'ti-trending-up' },
      { label: 'Investment', value: 'GHS 480K', color: '#8b5cf6', icon: 'ti-coin' },
    ],
    chartData: [
      { name: 'Current', value: 12, color: '#3b82f6' },
      { name: 'Q3 Need', value: 14, color: '#22c55e' },
      { name: 'Q4 Need', value: 16, color: '#f59e0b' },
      { name: '2027 Forecast', value: 20, color: '#8b5cf6' },
    ],
    highlights: ['Recommend adding 2 Toyota Hiace by August', 'Revenue per vehicle: GHS 17,542/month', 'ROI on new vehicles: 14 months', 'Priority routes: Accra-Kumasi, Accra-Takoradi'],
  },
  { id: 19, title: 'Accident & Incident Log', type: 'Safety', period: 'Last 90 Days', format: 'CSV', createdAt: '2026-06-09', status: 'ready', generatedBy: 'Safety Officer', fileSize: '290 KB',
    summary: [
      { label: 'Incidents', value: '14', color: '#ef4444', icon: 'ti-alert-triangle' },
      { label: 'Minor', value: '9', color: '#f59e0b', icon: 'ti-info-circle' },
      { label: 'Major', value: '4', color: '#ef4444', icon: 'ti-alert' },
      { label: 'Fatal', value: '0', color: '#22c55e', icon: 'ti-shield-check' },
    ],
    chartData: [
      { name: 'Collision', value: 5, color: '#ef4444' },
      { name: 'Scratch', value: 4, color: '#f59e0b' },
      { name: 'Mechanical', value: 3, color: '#3b82f6' },
      { name: 'Weather', value: 2, color: '#8b5cf6' },
    ],
    highlights: ['50% of incidents between 7-9 AM rush hour', 'GT-8123-21 involved in 2 incidents â€” review driver', 'All major incidents reported to police within 24hrs', 'Insurance claims pending for 2 incidents'],
  },
  { id: 20, title: 'Monthly Revenue Report', type: 'Summary', period: 'May 2026', format: 'PDF', createdAt: '2026-06-02', status: 'ready', generatedBy: 'Admin', fileSize: '1.9 MB',
    summary: [
      { label: 'Revenue', value: 'GHS 210,500', color: '#22c55e', icon: 'ti-coin' },
      { label: 'Expenses', value: 'GHS 87,200', color: '#ef4444', icon: 'ti-receipt' },
      { label: 'Net Profit', value: 'GHS 123,300', color: '#3b82f6', icon: 'ti-trending-up' },
      { label: 'Margin', value: '58.6%', color: '#22c55e', icon: 'ti-chart-pie' },
    ],
    chartData: [
      { name: 'Revenue', value: 210500, color: '#22c55e' },
      { name: 'Fuel', value: 38400, color: '#f59e0b' },
      { name: 'Maintenance', value: 24500, color: '#ef4444' },
      { name: 'Salaries', value: 18300, color: '#3b82f6' },
      { name: 'Other', value: 6000, color: '#8b5cf6' },
    ],
    highlights: ['Revenue up 12.4% vs April', 'Fuel costs: 18.2% of revenue (target: <20%)', 'Highest revenue route: Accra-Kumasi (GHS 48,200)', 'Outstanding invoices: GHS 34,800 (14 days overdue)'],
  },
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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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
          <i className="las la-check-circle" style={{ color: 'var(--accent)', fontSize: 18 }}></i>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={CYTRACK_LOGO.url} alt={CYTRACK_LOGO.alt} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />Reports & Analytics
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Generate, schedule, and download fleet performance reports</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn}><i className="las la-calendar-stats" style={{ fontSize: 15 }}></i> Schedule</button>
          <button style={btnPrimary}><i className="las la-plus" style={{ fontSize: 15 }}></i> Generate Report</button>
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
            <i className="las la-chart-line" style={{ color: 'var(--accent)' }}></i> Monthly Overview
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
            <i className="las la-file-text" style={{ marginRight: 6, color: 'var(--accent)' }}></i>Quick Generate
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
                  <><i className="las la-spinner ti-spin" style={{ fontSize: 15 }}></i> Generating... {progress}%</>
                ) : (
                  <><i className="las la-file-download" style={{ fontSize: 15 }}></i> Generate</>
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
            <i className="las la-calendar-stats" style={{ marginRight: 6, color: '#3b82f6' }}></i>Scheduled Reports
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
            <i className="las la-table" style={{ color: 'var(--accent)' }}></i> Generated Reports
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>({reports.length} reports)</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...btn, padding: '5px 10px', fontSize: 12 }}><i className="las la-filter" style={{ fontSize: 13 }}></i> Filter</button>
            <button style={{ ...btn, padding: '5px 10px', fontSize: 12 }}><i className="las la-download" style={{ fontSize: 13 }}></i> Export All</button>
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
                  onClick={() => r.status === 'ready' && setSelectedReport(r)}
                  style={{ transition: 'background 0.1s', cursor: r.status === 'ready' ? 'pointer' : 'default' }}
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
                      <i className="las la-download" style={{ fontSize: 13 }}></i> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div
          onClick={() => setSelectedReport(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', animation: 'fadeModal .2s ease' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '90%', maxWidth: 720, maxHeight: '85vh', overflowY: 'auto',
              background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)',
              boxShadow: '0 24px 80px rgba(0,0,0,.5)', animation: 'slideUpModal .3s cubic-bezier(.175,.885,.32,1.275)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 28px 20px', borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(0,201,167,.06), rgba(59,130,246,.04))',
              borderRadius: '16px 16px 0 0', position: 'relative',
            }}>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
              >
                <i className="las la-times"></i>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: selectedReport.format === 'PDF' ? 'rgba(239,68,68,.12)' : selectedReport.format === 'XLSX' ? 'rgba(34,197,94,.12)' : 'rgba(59,130,246,.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`ti ${selectedReport.format === 'PDF' ? 'ti-file-type-pdf' : selectedReport.format === 'XLSX' ? 'ti-file-spreadsheet' : 'ti-file-csv'}`}
                    style={{ fontSize: 20, color: selectedReport.format === 'PDF' ? '#ef4444' : selectedReport.format === 'XLSX' ? '#22c55e' : '#3b82f6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{selectedReport.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                    {selectedReport.type} &middot; {selectedReport.period} &middot; Generated {dayjs(selectedReport.createdAt).format('DD MMM YYYY')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {badge(selectedReport.format, selectedReport.format === 'PDF' ? '#ef4444' : selectedReport.format === 'XLSX' ? '#22c55e' : '#3b82f6')}
                {badge(selectedReport.type, '#8b5cf6')}
                {badge(selectedReport.fileSize || 'â€”', '#5c6f8a')}
                {selectedReport.generatedBy && badge(`By ${selectedReport.generatedBy}`, '#06b6d4')}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 28px 28px' }}>
              {/* Summary Cards */}
              {selectedReport.summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                  {selectedReport.summary.map((s, i) => (
                    <div key={i} style={{
                      padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                      background: `${s.color}08`, border: `1px solid ${s.color}18`,
                    }}>
                      <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color, display: 'block', marginBottom: 6 }}></i>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chart */}
              {selectedReport.chartData && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="las la-chart-bar" style={{ color: 'var(--accent)' }}></i> Breakdown
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={selectedReport.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
                        {selectedReport.chartData.map((entry, idx) => (
                          <rect key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Key Highlights */}
              {selectedReport.highlights && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="las la-lightbulb" style={{ color: '#f59e0b' }}></i> Key Highlights
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedReport.highlights.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--bg3)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                        <i className="las la-check-circle" style={{ color: 'var(--accent)', fontSize: 14, marginTop: 1, flexShrink: 0 }}></i>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button style={btn} onClick={async () => await printReport(selectedReport)}><i className="las la-print" style={{ fontSize: 15 }}></i> Print</button>
                <button style={btn}><i className="las la-share-alt" style={{ fontSize: 15 }}></i> Share</button>
                <button style={btnPrimary} onClick={() => { handleDownload(selectedReport.title); setSelectedReport(null); }}>
                  <i className="las la-download" style={{ fontSize: 15 }}></i> Download {selectedReport.format}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeModal { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUpModal { from { opacity: 0; transform: translateY(30px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}
