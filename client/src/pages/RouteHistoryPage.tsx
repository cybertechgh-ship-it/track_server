import { useState } from 'react';
import { RouteFilter } from '../components/route-history/RouteFilter';
import { SessionList } from '../components/route-history/SessionList';
import { RouteMap } from '../components/route-history/RouteMap';
import { SelectedRoutes } from '../components/route-history/SelectedRoutes';
import { useRouteHistory } from '../hooks/useRouteHistory';

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
  transition: 'all 0.15s',
};

export default function RouteHistoryPage() {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const { sessions, selectedRoutes, loading, error, loadSessions, addRoute, removeRoute, clearRoutes, mapCenter, mapZoom, setError } = useRouteHistory();

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
          <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Route History</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Analyze past routes by driver or vehicle</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['today', 'week', 'month'] as const).map(d => (
            <button key={d} onClick={() => setDateRange(d)} style={{
              ...btn, fontSize: 11, padding: '5px 12px',
              background: dateRange === d ? 'rgba(0,201,167,0.12)' : 'var(--bg3)',
              color: dateRange === d ? 'var(--accent)' : 'var(--text2)',
              borderColor: dateRange === d ? 'rgba(0,201,167,0.3)' : 'var(--border2)',
            }}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, display: 'flex' }}>
        {['Driver Analysis', 'Vehicle Analysis'].map((label, i) => (
          <button key={label}
            onClick={() => setTabValue(i)}
            style={{
              flex: 1, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: 'none', borderBottom: tabValue === i ? '2px solid var(--accent)' : '2px solid transparent',
              background: tabValue === i ? 'rgba(0,201,167,0.04)' : 'transparent',
              color: tabValue === i ? 'var(--accent)' : 'var(--text3)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <i className={`ti ${i === 0 ? 'ti-user' : 'ti-truck'}`} style={{ fontSize: 16 }}></i>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <RouteFilter type={tabValue === 0 ? 'driver' : 'vehicle'} onSearch={loadSessions} loading={loading} />

          {/* Session list enhanced with trip items */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Trips</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{sessions.length} found</span>
            </div>
            <div style={{ maxHeight: 450, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                  <div style={{ width: 24, height: 24, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
                  <i className="las la-route-off" style={{ fontSize: 28, display: 'block', marginBottom: 6 }}></i>
                  No trips found
                </div>
              ) : (
                sessions.map((s: any) => {
                  const sel = selectedRoutes.some((r: any) => r.id === s.id);
                  return (
                    <div key={s.id} style={{
                      padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.1s',
                      background: sel ? 'rgba(0,201,167,0.04)' : 'transparent',
                      borderLeft: sel ? '3px solid var(--accent)' : '3px solid transparent',
                    }}
                      onClick={() => sel ? removeRoute(s.id) : addRoute(s.id)}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg3)'; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: 'rgba(0,201,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className="las la-route" style={{ fontSize: 16, color: 'var(--accent)' }}></i>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                            {s.vehicle?.plateNumber || 'N/A'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                            {s.driver?.firstName} {s.driver?.lastName || 'Unknown'}
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,201,167,0.1)', color: 'var(--accent)' }}>
                          {Math.round(s.totalDistance || 0)} km
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text3)' }}>From:</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{Number(s.startLocation?.latitude ?? 0).toFixed(4)}, {Number(s.startLocation?.longitude ?? 0).toFixed(4)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text3)' }}>To:</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{Number(s.endLocation?.latitude ?? 0).toFixed(4)}, {Number(s.endLocation?.longitude ?? 0).toFixed(4)}</span>
                      </div>

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: 'var(--text3)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <i className="las la-clock"></i>
                          {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <i className="las la-clock-hour"></i>
                          {s.totalDistance ? `${Math.round(s.totalDistance / 40 * 60)} min` : 'N/A'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <i className="las la-map-pin"></i>
                          {Math.round(s.totalDistance || 0)} km
                        </span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                          <button style={{ ...btn, padding: '3px 8px', fontSize: 10 }} title="Replay route"><i className="las la-play-circle" style={{ fontSize: 11 }}></i></button>
                          <button style={{ ...btn, padding: '3px 8px', fontSize: 10 }} title="Export"><i className="las la-download" style={{ fontSize: 11 }}></i></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <SelectedRoutes routes={selectedRoutes} onRemoveRoute={removeRoute} onClearAll={clearRoutes} />
        </div>

        {/* Right Panel - Map */}
        <div style={{ position: 'sticky', top: 24 }}>
          <RouteMap routes={selectedRoutes} center={mapCenter} zoom={mapZoom} />
        </div>
      </div>
    </div>
  );
}
