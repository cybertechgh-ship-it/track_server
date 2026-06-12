import { useMemo } from 'react';
import type { DrivingSession, ExtendedRouteData } from '../../types';

interface SessionListProps {
  sessions: DrivingSession[];
  selectedRoutes: ExtendedRouteData[];
  onAddRoute: (sessionId: number) => void;
  loading: boolean;
  type: 'driver' | 'vehicle';
}

const badge = (label: string, color: string, bg?: string) => (
  <span style={{ padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: bg || `${color}18`, color }}>{label}</span>
);

export const SessionList: React.FC<SessionListProps> = ({ sessions, selectedRoutes, onAddRoute, loading, type }) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'Ongoing';
    const d = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
    const h = Math.floor(d / 3600); const m = Math.floor((d % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getInfo = (s: DrivingSession) => type === 'driver'
    ? { icon: 'ti-truck', primary: s.vehicle ? `${s.vehicle.plateNumber} - ${s.vehicle.brand} ${s.vehicle.model}` : 'No vehicle info' }
    : { icon: 'ti-user', primary: s.driver ? `${s.driver.firstName} ${s.driver.lastName}` : 'No driver info' };

  if (loading && sessions.length === 0) return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 13, color: 'var(--text3)' }}>Loading sessions...</span>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Session List</span>
        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,201,167,0.12)', color: 'var(--accent)' }}>{sessions.length}</span>
      </div>
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>No sessions found for selected criteria</div>
      ) : (
        <div>
          {sessions.map(s => {
            const { icon, primary } = getInfo(s);
            const loaded = selectedRoutes.some(r => r.session.id === s.id);
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderBottom: '1px solid var(--border)', transition: 'background 0.1s',
              }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${icon}`} style={{ fontSize: 16, color: '#3b82f6' }}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {primary}
                    {badge(`${Math.round(s.totalDistance || 0)} km`, '#3b82f6')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                    {formatDate(s.startTime)}{s.endTime && ` - ${formatDate(s.endTime)}`}
                    <span style={{ marginLeft: 8 }}>Duration: {formatDuration(s.startTime, s.endTime)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onAddRoute(s.id)}
                  disabled={loaded || loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px',
                    borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    border: loaded ? '1px solid #22c55e' : '1px solid var(--border2)',
                    background: loaded ? 'rgba(34,197,94,0.12)' : 'transparent',
                    color: loaded ? '#22c55e' : 'var(--text2)',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <i className={`ti ${loaded ? 'ti-check' : 'ti-route'}`} style={{ fontSize: 13 }}></i>
                  {loaded ? 'Loaded' : 'Show Route'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
