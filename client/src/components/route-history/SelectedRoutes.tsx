import type { ExtendedRouteData } from '../../types';

interface SelectedRoutesProps {
  routes: ExtendedRouteData[];
  onRemoveRoute: (sessionId: number) => void;
  onClearAll: () => void;
}

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)',
  transition: 'all 0.12s',
};

export const SelectedRoutes: React.FC<SelectedRoutesProps> = ({ routes, onRemoveRoute, onClearAll }) => {
  if (routes.length === 0) return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Selected Routes</div>
      <div style={{ textAlign: 'center', padding: 16, color: 'var(--text3)', fontSize: 12 }}>No routes selected yet</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Selected Routes ({routes.length})</span>
        <button style={{ ...btn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={onClearAll}>
          <i className="las la-trash-alt" style={{ fontSize: 13 }}></i> Clear All
        </button>
      </div>
      <div>
        {routes.map(r => (
          <div key={r.session.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            borderBottom: '1px solid var(--border)', borderLeft: `4px solid ${r.color}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {r.session.vehicle?.plateNumber} - {r.session.driver?.firstName} {r.session.driver?.lastName}
                <span style={{ padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: r.color, color: '#fff' }}>
                  {r.session.totalDistance} km
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: 'var(--text3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <i className="las la-map-pins" style={{ fontSize: 12 }}></i> {r.stats.totalPoints} pts
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <i className="las la-tachometer-alt" style={{ fontSize: 12 }}></i> Max: {r.stats.maxSpeed} km/h
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <i className="las la-location-arrow" style={{ fontSize: 12 }}></i> Avg: {r.stats.avgSpeed} km/h
                </span>
              </div>
            </div>
            <button style={{ ...btn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => onRemoveRoute(r.session.id)}>
              <i className="las la-times" style={{ fontSize: 14 }}></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
