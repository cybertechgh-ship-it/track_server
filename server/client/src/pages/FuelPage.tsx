import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';

interface FuelEntry {
  id: number;
  vehicleId: number;
  plateNumber: string;
  driverName: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  station: string;
  fuelType: 'diesel' | 'petrol';
  odometer: number;
  isFullTank: boolean;
  status: 'completed' | 'pending' | 'flagged';
  notes: string;
}

interface VehicleEfficiency {
  plateNumber: string;
  brand: string;
  model: string;
  avgKmPerLiter: number;
  tankCapacity: number;
  lastRefuelDate: string;
  currentFuelLevel: number;
  estimatedRange: number;
}

interface MonthlyConsumption {
  month: string;
  liters: number;
  cost: number;
  vehicleCount: number;
}

interface FuelAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: string;
  vehicle: string;
}

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%',
};
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tabBtn: React.CSSProperties = {
  flex: 1, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  border: 'none', background: 'transparent', color: 'var(--text3)',
  transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};

const DRIVERS = ['Kwame Asante', 'Abena Osei', 'Yaw Mensah', 'Afia Owusu', 'Kofi Boateng', 'Esi Quansah', 'Nana Yeboah', 'Akua Sarpong', 'Kwesi Adjei', 'Ama Donkor'];
const PLATES = ['GT-1000-20', 'GT-1001-20', 'GT-1002-20', 'GT-1003-20', 'GT-1004-20'];
const STATIONS = ['GOIL Tema', 'Shell Spintex', 'Total Madina', 'StarOil Accra', 'PetroGhana Kwame Nkrumah Circle', 'Zen Kanda', 'Puma Kaneshie', 'Allied Oil Lapaz'];

const DEMO_ENTRIES: FuelEntry[] = [
  { id: 1, vehicleId: 1, plateNumber: 'GT-1000-20', driverName: 'Kwame Asante', date: '2026-06-12T08:15:00Z', liters: 45, costPerLiter: 13.5, totalCost: 607.5, station: 'GOIL Tema', fuelType: 'diesel', odometer: 45210, isFullTank: true, status: 'completed', notes: '' },
  { id: 2, vehicleId: 2, plateNumber: 'GT-1001-20', driverName: 'Abena Osei', date: '2026-06-12T10:30:00Z', liters: 32, costPerLiter: 14.2, totalCost: 454.4, station: 'Shell Spintex', fuelType: 'petrol', odometer: 32150, isFullTank: false, status: 'completed', notes: 'Half fill' },
  { id: 3, vehicleId: 3, plateNumber: 'GT-1002-20', driverName: 'Yaw Mensah', date: '2026-06-11T14:45:00Z', liters: 60, costPerLiter: 13.0, totalCost: 780, station: 'Total Madina', fuelType: 'diesel', odometer: 58420, isFullTank: true, status: 'pending', notes: 'Awaiting approval' },
  { id: 4, vehicleId: 4, plateNumber: 'GT-1003-20', driverName: 'Afia Owusu', date: '2026-06-11T09:00:00Z', liters: 28, costPerLiter: 14.5, totalCost: 406, station: 'StarOil Accra', fuelType: 'petrol', odometer: 28640, isFullTank: false, status: 'flagged', notes: 'Mismatch with odometer reading' },
  { id: 5, vehicleId: 5, plateNumber: 'GT-1004-20', driverName: 'Kofi Boateng', date: '2026-06-10T16:20:00Z', liters: 55, costPerLiter: 12.8, totalCost: 704, station: 'PetroGhana Kwame Nkrumah Circle', fuelType: 'diesel', odometer: 67890, isFullTank: true, status: 'completed', notes: '' },
  { id: 6, vehicleId: 1, plateNumber: 'GT-1000-20', driverName: 'Esi Quansah', date: '2026-06-10T07:00:00Z', liters: 20, costPerLiter: 13.5, totalCost: 270, station: 'GOIL Tema', fuelType: 'diesel', odometer: 45500, isFullTank: false, status: 'completed', notes: 'Emergency top-up' },
  { id: 7, vehicleId: 2, plateNumber: 'GT-1001-20', driverName: 'Nana Yeboah', date: '2026-06-09T11:30:00Z', liters: 38, costPerLiter: 14.0, totalCost: 532, station: 'Zen Kanda', fuelType: 'petrol', odometer: 32480, isFullTank: true, status: 'pending', notes: '' },
  { id: 8, vehicleId: 3, plateNumber: 'GT-1002-20', driverName: 'Akua Sarpong', date: '2026-06-09T13:10:00Z', liters: 70, costPerLiter: 13.2, totalCost: 924, station: 'Puma Kaneshie', fuelType: 'diesel', odometer: 58760, isFullTank: true, status: 'completed', notes: 'Full tank before trip' },
  { id: 9, vehicleId: 4, plateNumber: 'GT-1003-20', driverName: 'Kwesi Adjei', date: '2026-06-08T08:45:00Z', liters: 25, costPerLiter: 15.0, totalCost: 375, station: 'Shell Spintex', fuelType: 'petrol', odometer: 28910, isFullTank: false, status: 'flagged', notes: 'Suspicious quantity for trip distance' },
  { id: 10, vehicleId: 5, plateNumber: 'GT-1004-20', driverName: 'Ama Donkor', date: '2026-06-08T15:30:00Z', liters: 50, costPerLiter: 13.0, totalCost: 650, station: 'Total Madina', fuelType: 'diesel', odometer: 68200, isFullTank: true, status: 'completed', notes: '' },
  { id: 11, vehicleId: 1, plateNumber: 'GT-1000-20', driverName: 'Kwame Asante', date: '2026-06-07T06:00:00Z', liters: 42, costPerLiter: 13.5, totalCost: 567, station: 'Allied Oil Lapaz', fuelType: 'diesel', odometer: 45680, isFullTank: true, status: 'completed', notes: '' },
  { id: 12, vehicleId: 2, plateNumber: 'GT-1001-20', driverName: 'Abena Osei', date: '2026-06-07T12:20:00Z', liters: 35, costPerLiter: 14.2, totalCost: 497, station: 'StarOil Accra', fuelType: 'petrol', odometer: 32730, isFullTank: false, status: 'completed', notes: '' },
  { id: 13, vehicleId: 3, plateNumber: 'GT-1002-20', driverName: 'Yaw Mensah', date: '2026-06-06T09:10:00Z', liters: 65, costPerLiter: 13.0, totalCost: 845, station: 'GOIL Tema', fuelType: 'diesel', odometer: 59050, isFullTank: true, status: 'pending', notes: 'Receipt pending' },
  { id: 14, vehicleId: 4, plateNumber: 'GT-1003-20', driverName: 'Afia Owusu', date: '2026-06-06T14:00:00Z', liters: 30, costPerLiter: 14.5, totalCost: 435, station: 'PetroGhana Kwame Nkrumah Circle', fuelType: 'petrol', odometer: 29100, isFullTank: false, status: 'flagged', notes: 'Unexpected drop in fuel level' },
  { id: 15, vehicleId: 5, plateNumber: 'GT-1004-20', driverName: 'Kofi Boateng', date: '2026-06-05T07:30:00Z', liters: 58, costPerLiter: 12.8, totalCost: 742.4, station: 'Zen Kanda', fuelType: 'diesel', odometer: 68540, isFullTank: true, status: 'completed', notes: '' },
  { id: 16, vehicleId: 1, plateNumber: 'GT-1000-20', driverName: 'Esi Quansah', date: '2026-06-05T16:45:00Z', liters: 22, costPerLiter: 13.5, totalCost: 297, station: 'Puma Kaneshie', fuelType: 'diesel', odometer: 45900, isFullTank: false, status: 'completed', notes: 'Top-up' },
  { id: 17, vehicleId: 2, plateNumber: 'GT-1001-20', driverName: 'Nana Yeboah', date: '2026-06-04T10:00:00Z', liters: 40, costPerLiter: 14.0, totalCost: 560, station: 'Total Madina', fuelType: 'petrol', odometer: 33000, isFullTank: true, status: 'completed', notes: '' },
  { id: 18, vehicleId: 3, plateNumber: 'GT-1002-20', driverName: 'Akua Sarpong', date: '2026-06-04T08:20:00Z', liters: 80, costPerLiter: 13.2, totalCost: 1056, station: 'Shell Spintex', fuelType: 'diesel', odometer: 59420, isFullTank: true, status: 'completed', notes: 'Long haul refuel' },
  { id: 19, vehicleId: 4, plateNumber: 'GT-1003-20', driverName: 'Kwesi Adjei', date: '2026-06-03T11:15:00Z', liters: 18, costPerLiter: 15.0, totalCost: 270, station: 'GOIL Tema', fuelType: 'petrol', odometer: 29250, isFullTank: false, status: 'completed', notes: 'Small top-up' },
  { id: 20, vehicleId: 5, plateNumber: 'GT-1004-20', driverName: 'Ama Donkor', date: '2026-06-03T14:30:00Z', liters: 52, costPerLiter: 12.8, totalCost: 665.6, station: 'Allied Oil Lapaz', fuelType: 'diesel', odometer: 68880, isFullTank: true, status: 'completed', notes: '' },
];

const DEMO_EFFICIENCY: VehicleEfficiency[] = [
  { plateNumber: 'GT-1000-20', brand: 'Toyota', model: 'Hilux', avgKmPerLiter: 9.2, tankCapacity: 80, lastRefuelDate: '2026-06-12T08:15:00Z', currentFuelLevel: 65, estimatedRange: 478 },
  { plateNumber: 'GT-1001-20', brand: 'Nissan', model: 'Navara', avgKmPerLiter: 8.5, tankCapacity: 73, lastRefuelDate: '2026-06-12T10:30:00Z', currentFuelLevel: 52, estimatedRange: 323 },
  { plateNumber: 'GT-1002-20', brand: 'Hyundai', model: 'Tucson', avgKmPerLiter: 10.8, tankCapacity: 62, lastRefuelDate: '2026-06-11T14:45:00Z', currentFuelLevel: 78, estimatedRange: 522 },
  { plateNumber: 'GT-1003-20', brand: 'Kia', model: 'Sorento', avgKmPerLiter: 7.3, tankCapacity: 67, lastRefuelDate: '2026-06-11T09:00:00Z', currentFuelLevel: 31, estimatedRange: 152 },
  { plateNumber: 'GT-1004-20', brand: 'Mercedes', model: 'Sprinter', avgKmPerLiter: 6.1, tankCapacity: 100, lastRefuelDate: '2026-06-10T16:20:00Z', currentFuelLevel: 44, estimatedRange: 268 },
];

const DEMO_MONTHLY: MonthlyConsumption[] = [
  { month: 'Jan', liters: 1280, cost: 16640, vehicleCount: 5 },
  { month: 'Feb', liters: 1420, cost: 18460, vehicleCount: 5 },
  { month: 'Mar', liters: 1350, cost: 17550, vehicleCount: 5 },
  { month: 'Apr', liters: 1510, cost: 19630, vehicleCount: 5 },
  { month: 'May', liters: 1640, cost: 21320, vehicleCount: 5 },
  { month: 'Jun', liters: 810, cost: 10692, vehicleCount: 5 },
];

const DEMO_ALERTS: FuelAlert[] = [
  { id: 1, type: 'suspicious_drop', severity: 'high', message: 'Fuel level dropped 22L without recorded trip for GT-1003-20', date: '2026-06-11T09:00:00Z', vehicle: 'GT-1003-20' },
  { id: 2, type: 'odometer_mismatch', severity: 'critical', message: 'Odometer jump mismatch for GT-1003-20 - possible fuel theft', date: '2026-06-11T09:00:00Z', vehicle: 'GT-1003-20' },
  { id: 3, type: 'unexpected_usage', severity: 'medium', message: 'GT-1004-20 refueled 3 times in 24 hours', date: '2026-06-10T16:20:00Z', vehicle: 'GT-1004-20' },
  { id: 4, type: 'station_anomaly', severity: 'medium', message: 'GT-1002-20 refueled at non-approved station Shell Spintex', date: '2026-06-09T13:10:00Z', vehicle: 'GT-1002-20' },
  { id: 5, type: 'quantity_anomaly', severity: 'high', message: 'GT-1003-20: 25L claimed but odometer shows only 8km traveled', date: '2026-06-08T08:45:00Z', vehicle: 'GT-1003-20' },
  { id: 6, type: 'suspicious_drop', severity: 'low', message: 'GT-1000-20 fuel consumption above fleet average by 18%', date: '2026-06-07T06:00:00Z', vehicle: 'GT-1000-20' },
];

const statusColors: Record<string, string> = { completed: '#22c55e', pending: '#f59e0b', flagged: '#ef4444' };

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color, whiteSpace: 'nowrap' }}>{label}</span>
);

const fmt = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dFmt = (d: string) => dayjs(d).format('DD MMM YYYY');
const dtFmt = (d: string) => dayjs(d).format('DD MMM YYYY HH:mm');

export default function FuelPage() {
  const [activeTab, setActiveTab] = useState('entries');
  const [entries, setEntries] = useState<FuelEntry[]>(DEMO_ENTRIES);
  const [search, setSearch] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [detailEntry, setDetailEntry] = useState<FuelEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<FuelEntry | null>(null);
  const [formData, setFormData] = useState<Partial<FuelEntry>>({});
  const [alerts, setAlerts] = useState<FuelAlert[]>(DEMO_ALERTS);

  const todayStr = dayjs().format('YYYY-MM-DD');
  const fueledToday = entries.filter(e => dayjs(e.date).format('YYYY-MM-DD') === todayStr).length;
  const totalSpent = entries.reduce((s, e) => s + e.totalCost, 0);
  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const avgPrice = totalLiters > 0 ? totalSpent / totalLiters : 0;
  const avgEfficiency = DEMO_EFFICIENCY.reduce((s, v) => s + v.avgKmPerLiter, 0) / DEMO_EFFICIENCY.length;
  const pendingFlagged = entries.filter(e => e.status === 'pending' || e.status === 'flagged').length;

  const summaryCards = [
    { label: 'Total Spent', value: fmt(totalSpent), color: '#22c55e', icon: 'ti-currency-dollar' },
    { label: 'Fuel Used (L)', value: `${totalLiters.toLocaleString()} L`, color: '#3b82f6', icon: 'ti-gas-station' },
    { label: 'Avg Price / L', value: fmt(avgPrice), color: '#f59e0b', icon: 'ti-trending-up' },
    { label: 'Fleet Efficiency', value: `${avgEfficiency.toFixed(1)} km/L`, color: '#8b5cf6', icon: 'ti-dashboard' },
    { label: 'Vehicles Fueled Today', value: fueledToday, color: '#06b6d4', icon: 'ti-truck' },
    { label: 'Pending / Flagged', value: pendingFlagged, color: '#ef4444', icon: 'ti-alert-triangle' },
  ];

  const filteredEntries = entries.filter(e => {
    if (search && !`${e.plateNumber} ${e.driverName} ${e.station} ${e.fuelType}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (fuelTypeFilter !== 'all' && e.fuelType !== fuelTypeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (dateFrom && dayjs(e.date).isBefore(dayjs(dateFrom))) return false;
    if (dateTo && dayjs(e.date).isAfter(dayjs(dateTo).endOf('day'))) return false;
    return true;
  });
  const paginatedEntries = filteredEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / rowsPerPage));

  const handleAdd = () => {
    setEditEntry(null);
    setFormData({ plateNumber: PLATES[0], driverName: DRIVERS[0], liters: 40, costPerLiter: 13.5, station: STATIONS[0], fuelType: 'diesel', odometer: 50000, isFullTank: true, status: 'pending', notes: '' });
    setShowForm(true);
  };

  const handleEdit = (entry: FuelEntry) => {
    setEditEntry(entry);
    setFormData({ ...entry });
    setShowForm(true);
  };

  const handleDelete = (entry: FuelEntry) => {
    if (!confirm(`Delete fuel entry #${entry.id}?`)) return;
    setEntries(prev => prev.filter(x => x.id !== entry.id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editEntry) {
      setEntries(prev => prev.map(x => x.id === editEntry.id ? { ...x, ...formData, totalCost: (formData.liters || 0) * (formData.costPerLiter || 0) } as FuelEntry : x));
    } else {
      const newEntry: FuelEntry = {
        id: Math.max(...entries.map(x => x.id), 0) + 1,
        vehicleId: PLATES.indexOf(formData.plateNumber || 'GT-1000-20') + 1,
        date: new Date().toISOString(),
        totalCost: (formData.liters || 0) * (formData.costPerLiter || 0),
        ...formData as any,
      };
      setEntries(prev => [newEntry, ...prev]);
    }
    setShowForm(false);
  };

  const acknowledgeAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id));
  const resolveAlert = (id: number) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, severity: 'low' as const } : a));

  const efficiencyChartData = DEMO_EFFICIENCY.map(v => ({ name: v.plateNumber, kmPerLiter: v.avgKmPerLiter }));

  const costTrendData = DEMO_MONTHLY.map(m => ({ month: m.month, cost: m.cost, liters: m.liters }));

  const renderTabs = () => (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, display: 'flex', overflow: 'hidden' }}>
      {[
        { key: 'entries', label: 'All Entries', icon: 'ti-list' },
        { key: 'efficiency', label: 'Efficiency', icon: 'ti-dashboard' },
        { key: 'alerts', label: 'Alerts', icon: 'ti-alert-triangle' },
        { key: 'analytics', label: 'Analytics', icon: 'ti-chart-bar' },
      ].map(t => (
        <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(0); }}
          style={{
            ...tabBtn,
            borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            background: activeTab === t.key ? 'rgba(0,201,167,0.04)' : 'transparent',
            color: activeTab === t.key ? 'var(--accent)' : 'var(--text3)',
          }}>
          <i className={`ti ${t.icon}`} style={{ fontSize: 14 }}></i>
          {t.label}
        </button>
      ))}
    </div>
  );

  const gch = (color: string) => (
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', marginRight: 4 }}></div>
  );

  const efficiencyLevel = (kmpl: number) => {
    if (kmpl >= 8) return { color: '#22c55e', label: 'Good' };
    if (kmpl >= 6) return { color: '#f59e0b', label: 'Average' };
    return { color: '#ef4444', label: 'Poor' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="ti ti-gas-station" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
        Fuel Management
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: s.label === 'Total Spent' || s.label === 'Avg Price / L' ? "'JetBrains Mono', monospace" : 'inherit' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      {renderTabs()}

      {/* ALL ENTRIES TAB */}
      {activeTab === 'entries' && (
        <div>
          {/* Filter bar */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
                <input placeholder="Search vehicle, driver..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 200 }} />
              </div>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 140 }} title="From date" />
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 140 }} title="To date" />
              <select value={fuelTypeFilter} onChange={e => { setFuelTypeFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 110, cursor: 'pointer' }}>
                <option value="all">All Fuel</option>
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
              </select>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 120, cursor: 'pointer' }}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <button style={btnPrimary} onClick={handleAdd}><i className="ti ti-plus" style={{ fontSize: 15 }}></i> Add Entry</button>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    <th style={hdrStyle}>Date</th>
                    <th style={hdrStyle}>Vehicle</th>
                    <th style={hdrStyle}>Driver</th>
                    <th style={{ ...hdrStyle, textAlign: 'right' }}>Liters</th>
                    <th style={{ ...hdrStyle, textAlign: 'right' }}>Cost/L</th>
                    <th style={{ ...hdrStyle, textAlign: 'right' }}>Total</th>
                    <th style={hdrStyle}>Station</th>
                    <th style={hdrStyle}>Fuel Type</th>
                    <th style={{ ...hdrStyle, textAlign: 'right' }}>Odometer</th>
                    <th style={hdrStyle}>Full Tank?</th>
                    <th style={hdrStyle}>Status</th>
                    <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map(e => (
                    <tr key={e.id} onClick={() => setDetailEntry(e)} style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...cellStyle, whiteSpace: 'nowrap', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{dFmt(e.date)}</td>
                      <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{e.plateNumber}</td>
                      <td style={cellStyle}>{e.driverName}</td>
                      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{e.liters}L</td>
                      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>GHS {e.costPerLiter.toFixed(2)}</td>
                      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{e.totalCost.toFixed(2)}</td>
                      <td style={{ ...cellStyle, fontSize: 12 }}>{e.station}</td>
                      <td style={cellStyle}>{badge(e.fuelType, e.fuelType === 'diesel' ? '#3b82f6' : '#f59e0b')}</td>
                      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{e.odometer.toLocaleString()}</td>
                      <td style={cellStyle}>{e.isFullTank ? badge('Yes', '#22c55e') : badge('No', '#5c6f8a')}</td>
                      <td style={cellStyle}>{badge(e.status, statusColors[e.status])}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }} onClick={ev => ev.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                          <button style={{ ...btn, padding: '4px 8px' }} onClick={() => handleEdit(e)}><i className="ti ti-edit" style={{ fontSize: 13 }}></i></button>
                          <button style={{ ...btn, padding: '4px 8px', color: 'var(--danger)' }} onClick={() => handleDelete(e)}><i className="ti ti-trash" style={{ fontSize: 13 }}></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedEntries.length === 0 && (
                    <tr><td colSpan={12} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No entries found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
              <span>{filteredEntries.length} total</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <i className="ti ti-chevron-left" style={{ fontSize: 14 }}></i>
                </button>
                <span>{page + 1} / {totalPages}</span>
                <button style={{ ...btn, padding: '4px 10px', opacity: page >= totalPages - 1 ? 0.4 : 1 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <i className="ti ti-chevron-right" style={{ fontSize: 14 }}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EFFICIENCY TAB */}
      {activeTab === 'efficiency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Compare Bar Chart */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-dashboard" style={{ fontSize: 16, color: 'var(--accent)' }}></i>
              Fleet Efficiency Comparison (km/L)
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={efficiencyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} unit=" km/L" />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="kmPerLiter" name="km/L" radius={[6, 6, 0, 0]}>
                  {efficiencyChartData.map((entry, i) => (
                    <rect key={i} fill={entry.kmPerLiter >= 8 ? '#22c55e' : entry.kmPerLiter >= 6 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Vehicle Efficiency Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {DEMO_EFFICIENCY.map(v => {
              const eff = efficiencyLevel(v.avgKmPerLiter);
              const fuelPct = v.currentFuelLevel;
              const gaugeColor = fuelPct > 60 ? '#22c55e' : fuelPct > 30 ? '#f59e0b' : '#ef4444';
              return (
                <div key={v.plateNumber} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{v.plateNumber}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{v.brand} {v.model}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${eff.color}18`, color: eff.color }}>{eff.label}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Avg km/L</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: eff.color }}>{v.avgKmPerLiter.toFixed(1)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Tank Capacity</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{v.tankCapacity}L</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Fuel Level</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{v.currentFuelLevel}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Est. Range</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{v.estimatedRange} km</div>
                    </div>
                  </div>
                  {/* Gauge bar */}
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden' }}>
                    <div style={{ width: `${fuelPct}%`, height: '100%', borderRadius: 3, background: gaugeColor, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text3)' }}>
                    <span>0%</span>
                    <span>{fuelPct}%</span>
                    <span>100%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consumption Trend */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-trending-down" style={{ fontSize: 16, color: 'var(--accent)' }}></i>
              Fuel Consumption Trend (Liters)
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} unit=" L" />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="liters" name="Liters" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Flagged Entries */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-flag" style={{ fontSize: 16, color: '#ef4444' }}></i>
              Fuel Alerts & Anomalies
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    <th style={hdrStyle}>Type</th>
                    <th style={hdrStyle}>Vehicle</th>
                    <th style={hdrStyle}>Message</th>
                    <th style={hdrStyle}>Severity</th>
                    <th style={hdrStyle}>Date</th>
                    <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(a => {
                    const sevColor = a.severity === 'critical' ? '#dc2626' : a.severity === 'high' ? '#ef4444' : a.severity === 'medium' ? '#f59e0b' : '#22c55e';
                    return (
                      <tr key={a.id} style={{ transition: 'background 0.1s' }}
                        onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                        <td style={cellStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <i className={`ti ${a.type === 'suspicious_drop' ? 'ti-drop' : a.type === 'odometer_mismatch' ? 'ti-speedometer' : a.type === 'unexpected_usage' ? 'ti-alert-triangle' : a.type === 'station_anomaly' ? 'ti-map-pin' : 'ti-question-mark'}`} style={{ fontSize: 14, color: sevColor }}></i>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{a.type.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{a.vehicle}</td>
                        <td style={{ ...cellStyle, maxWidth: 350, fontSize: 12 }}>{a.message}</td>
                        <td style={cellStyle}>{badge(a.severity, sevColor)}</td>
                        <td style={{ ...cellStyle, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{dtFmt(a.date)}</td>
                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                            <button style={{ ...btn, padding: '4px 10px', color: 'var(--success)', fontSize: 11 }} onClick={() => acknowledgeAlert(a.id)}>Acknowledge</button>
                            <button style={{ ...btn, padding: '4px 10px', color: '#3b82f6', fontSize: 11 }} onClick={() => resolveAlert(a.id)}>Resolve</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {alerts.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>All alerts resolved</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fuel Theft Detection */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-shield-off" style={{ fontSize: 16, color: 'var(--danger)' }}></i>
              Fuel Theft Detection
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {entries.filter(e => e.status === 'flagged').map(e => (
                <div key={e.id} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{e.plateNumber}</span>
                    {badge('Flagged', '#ef4444')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                    {e.notes || 'Suspicious activity detected'} &middot; {dFmt(e.date)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button style={{ ...btn, padding: '4px 10px', fontSize: 11, color: 'var(--success)' }} onClick={() => {
                      setEntries(prev => prev.map(x => x.id === e.id ? { ...x, status: 'completed' as const } : x));
                    }}>Mark Resolved</button>
                  </div>
                </div>
              ))}
              {entries.filter(e => e.status === 'flagged').length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 12 }}>No flagged entries detected</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Monthly Consumption Bar Chart */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-chart-bar" style={{ fontSize: 16, color: 'var(--accent)' }}></i>
              Monthly Fuel Consumption
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text3)' }} unit=" L" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text3)' }} unit=" GHS" />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="liters" name="Liters" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Trend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-currency-dollar" style={{ fontSize: 16, color: '#22c55e' }}></i>
                Cost Trend
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} unit=" GHS" />
                  <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="cost" name="Cost" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-chart-pie" style={{ fontSize: 16, color: '#8b5cf6' }}></i>
                Quick Stats
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(() => {
                  const stationCosts: Record<string, number> = {};
                  entries.forEach(e => { stationCosts[e.station] = (stationCosts[e.station] || 0) + e.totalCost; });
                  const mostExpensiveStation = Object.entries(stationCosts).sort((a, b) => b[1] - a[1])[0];
                  const bestVehicle = [...DEMO_EFFICIENCY].sort((a, b) => b.avgKmPerLiter - a.avgKmPerLiter)[0];
                  const avgMonthlySpend = DEMO_MONTHLY.reduce((s, m) => s + m.cost, 0) / DEMO_MONTHLY.length;
                  return (
                    <>
                      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-building" style={{ fontSize: 16, color: '#ef4444' }}></i>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>Most Expensive Station</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{mostExpensiveStation?.[0] || 'N/A'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>{mostExpensiveStation ? fmt(mostExpensiveStation[1]) : ''}</div>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-truck" style={{ fontSize: 16, color: '#22c55e' }}></i>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>Most Fuel-Efficient Vehicle</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{bestVehicle.plateNumber}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{bestVehicle.brand} {bestVehicle.model} &middot; {bestVehicle.avgKmPerLiter} km/L</div>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-calculator" style={{ fontSize: 16, color: '#3b82f6' }}></i>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>Avg Monthly Spend</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{fmt(avgMonthlySpend)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Across {DEMO_MONTHLY.length} months</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Popup */}
      {detailEntry && (
        <div onClick={() => setDetailEntry(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-gas-station" style={{ fontSize: 18, color: 'var(--accent)' }}></i>
                Fuel Entry #{detailEntry.id}
              </div>
              <button onClick={() => setDetailEntry(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border2)', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: 16 }}></i>
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Date & Time', value: dtFmt(detailEntry.date), icon: 'ti-clock' },
                  { label: 'Vehicle', value: detailEntry.plateNumber, icon: 'ti-truck' },
                  { label: 'Driver', value: detailEntry.driverName, icon: 'ti-user' },
                  { label: 'Station', value: detailEntry.station, icon: 'ti-map-pin' },
                  { label: 'Fuel Type', value: detailEntry.fuelType.charAt(0).toUpperCase() + detailEntry.fuelType.slice(1), icon: 'ti-droplet' },
                  { label: 'Liters', value: `${detailEntry.liters} L`, icon: 'ti-droplet-filled' },
                  { label: 'Cost / Liter', value: `GHS ${detailEntry.costPerLiter.toFixed(2)}`, icon: 'ti-currency-dollar' },
                  { label: 'Total Cost', value: `GHS ${detailEntry.totalCost.toFixed(2)}`, icon: 'ti-receipt' },
                  { label: 'Odometer', value: `${detailEntry.odometer.toLocaleString()} km`, icon: 'ti-speedometer' },
                  { label: 'Full Tank', value: detailEntry.isFullTank ? 'Yes' : 'No', icon: 'ti-check' },
                ].map(d => (
                  <div key={d.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className={`ti ${d.icon}`} style={{ fontSize: 14, color: 'var(--accent)' }}></i>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{d.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>{badge(detailEntry.status, statusColors[detailEntry.status])}</div>
                {detailEntry.notes && <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>{detailEntry.notes}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 540, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editEntry ? 'Edit Fuel Entry' : 'Add Fuel Entry'}</div>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="ti ti-x"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Vehicle</label>
                    <select value={formData.plateNumber || ''} onChange={e => setFormData({ ...formData, plateNumber: e.target.value })} style={inputStyle}>
                      {PLATES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Driver</label>
                    <select value={formData.driverName || ''} onChange={e => setFormData({ ...formData, driverName: e.target.value })} style={inputStyle}>
                      {DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Liters</label>
                    <input type="number" required value={formData.liters || ''} onChange={e => setFormData({ ...formData, liters: Number(e.target.value) })} min={1} max={150} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cost / Liter (GHS)</label>
                    <input type="number" step="0.01" required value={formData.costPerLiter || ''} onChange={e => setFormData({ ...formData, costPerLiter: Number(e.target.value) })} min={1} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Station</label>
                    <select value={formData.station || ''} onChange={e => setFormData({ ...formData, station: e.target.value })} style={inputStyle}>
                      {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Fuel Type</label>
                    <select value={formData.fuelType || 'diesel'} onChange={e => setFormData({ ...formData, fuelType: e.target.value as 'diesel' | 'petrol' })} style={inputStyle}>
                      <option value="diesel">Diesel</option>
                      <option value="petrol">Petrol</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Odometer (km)</label>
                    <input type="number" required value={formData.odometer || ''} onChange={e => setFormData({ ...formData, odometer: Number(e.target.value) })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Full Tank</label>
                    <select value={formData.isFullTank ? 'yes' : 'no'} onChange={e => setFormData({ ...formData, isFullTank: e.target.value === 'yes' })} style={inputStyle}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={formData.status || 'pending'} onChange={e => setFormData({ ...formData, status: e.target.value as 'completed' | 'pending' | 'flagged' })} style={inputStyle}>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="flagged">Flagged</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Total Cost (calculated)</label>
                    <div style={{ ...inputStyle, background: 'var(--bg2)', color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                      GHS {((formData.liters || 0) * (formData.costPerLiter || 0)).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>
                  <i className="ti ti-device-floppy" style={{ fontSize: 14 }}></i>
                  {editEntry ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
