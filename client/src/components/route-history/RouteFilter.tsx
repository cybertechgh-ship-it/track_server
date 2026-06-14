import { useState, useEffect, useMemo, useCallback } from 'react';
import { driverService } from '../../services/driverService';
import { vehicleService } from '../../services/vehicleService';
import type { Driver, Vehicle, SessionFilters } from '../../types';

interface RouteFilterProps {
  type: 'driver' | 'vehicle';
  onSearch: (filters: SessionFilters) => void;
  loading: boolean;
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%',
};
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };

export const RouteFilter: React.FC<RouteFilterProps> = ({ type, onSearch, loading }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setSelectedId(''); }, [type]);

  const loadData = useCallback(async () => {
    try {
      setDataLoading(true);
      const [d, v] = await Promise.all([driverService.getAll(), vehicleService.getAll()]);
      setDrivers(d.filter(x => x.isActive));
      setVehicles(v.filter(x => x.isActive));
    } catch (e) { console.error('Failed to load filter data:', e); }
    finally { setDataLoading(false); }
  }, []);

  const handleSearch = useCallback(() => {
    const f: SessionFilters = {};
    if (type === 'driver' && selectedId) f.driverId = selectedId as number;
    if (type === 'vehicle' && selectedId) f.vehicleId = selectedId as number;
    if (startDate) f.startDate = new Date(startDate).toISOString();
    if (endDate) f.endDate = new Date(endDate).toISOString();
    onSearch(f);
  }, [type, selectedId, startDate, endDate, onSearch]);

  const { items, getItemLabel } = useMemo(() => {
    const items = type === 'driver' ? drivers : vehicles;
    const getItemLabel = (item: Driver | Vehicle) =>
      type === 'driver'
        ? `${(item as Driver).firstName} ${(item as Driver).lastName}`
        : `${(item as Vehicle).plateNumber} - ${(item as Vehicle).brand} ${(item as Vehicle).model}`;
    return { items, getItemLabel };
  }, [type, drivers, vehicles]);

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
        <i className={`ti ${type === 'driver' ? 'ti-user' : 'ti-truck'}`} style={{ marginRight: 6, color: 'var(--accent)' }}></i>
        {type === 'driver' ? 'Driver Filter' : 'Vehicle Filter'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value ? Number(e.target.value) : '')} style={{ ...inputStyle, cursor: 'pointer' }} disabled={dataLoading}>
          <option value="">{type === 'driver' ? 'All Drivers' : 'All Vehicles'}</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>{getItemLabel(item)}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || dataLoading}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: '1px solid var(--accent)', background: 'var(--accent)', color: '#00221c',
            opacity: loading || dataLoading ? 0.6 : 1,
          }}
        >
          {loading ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-search" style={{ fontSize: 14 }}></i>}
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
};
