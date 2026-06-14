import { useState, useEffect } from 'react';
import { webhookService, type Webhook } from '../services/webhookService';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
);

const DEMO_WEBHOOKS: Webhook[] = [
  { id: 1, name: 'Slack Alerts', url: 'https://hooks.slack.com/services/T00/B00/xxxxx', events: ['alert.triggered', 'geofence.entry'], secret: 'sk_live_slack_abc123', isActive: true, lastTriggeredAt: '2026-06-12T10:30:00Z', failureCount: 0, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z' },
  { id: 2, name: 'Zapier Accounting Sync', url: 'https://hooks.zapier.com/hooks/catch/123/abc/', events: ['session.end', 'revenue.updated'], secret: null, isActive: true, lastTriggeredAt: '2026-06-11T14:00:00Z', failureCount: 2, createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-06-09T00:00:00Z' },
  { id: 3, name: 'Custom Analytics Webhook', url: 'https://analytics.example.com/webhooks/fleet', events: ['location.update', 'session.start', 'session.end'], secret: 'sk_live_custom_xyz789', isActive: false, lastTriggeredAt: null, failureCount: 5, createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-05-28T00:00:00Z' },
  { id: 4, name: 'Microsoft Teams Notifications', url: 'https://outlook.office.com/webhook/abc123/IncomingWebhook/def456', events: ['alert.triggered', 'driver.violation'], secret: null, isActive: true, lastTriggeredAt: '2026-06-13T08:15:00Z', failureCount: 0, createdAt: '2026-04-05T00:00:00Z', updatedAt: '2026-06-13T00:00:00Z' },
  { id: 5, name: 'PagerDuty Incident Forwarder', url: 'https://events.pagerduty.com/v2/enqueue/R0XXXXXX', events: ['maintenance.due', 'alert.triggered'], secret: 'sk_live_pager_xyz456', isActive: true, lastTriggeredAt: '2026-06-10T22:45:00Z', failureCount: 1, createdAt: '2026-01-28T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z' },
  { id: 6, name: 'Google Sheets Data Logger', url: 'https://script.google.com/macros/s/AKfycbx/dev/exec', events: ['session.end', 'geofence.exit', 'revenue.updated'], secret: null, isActive: true, lastTriggeredAt: '2026-06-14T06:00:00Z', failureCount: 0, createdAt: '2026-05-12T00:00:00Z', updatedAt: '2026-06-14T00:00:00Z' },
  { id: 7, name: 'AWS Lambda Fleet Processor', url: 'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/fleet-processor/invoke-async', events: ['location.update', 'geofence.entry', 'geofence.exit'], secret: 'sk_live_aws_lambda_abc789', isActive: false, lastTriggeredAt: '2026-05-20T19:30:00Z', failureCount: 12, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-05-20T00:00:00Z' },
];

const TZ = (d: string) => {
  if (!d) return 'Never';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const trunc = (s: string, n: number) => s.length > n ? s.slice(0, n) + '...' : s;

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', url: '', eventsStr: '', isActive: true });
  const [testing, setTesting] = useState<Record<number, 'idle' | 'loading' | 'success' | 'failure'>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await webhookService.getAll();
        setWebhooks(data.length > 0 ? data : DEMO_WEBHOOKS);
      } catch {
        setWebhooks(DEMO_WEBHOOKS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = webhooks.length;
  const activeCount = webhooks.filter(w => w.isActive).length;
  const failedCount = webhooks.reduce((s, w) => s + w.failureCount, 0);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', url: '', eventsStr: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (w: Webhook) => {
    setEditId(w.id);
    setForm({ name: w.name, url: w.url, eventsStr: w.events.join(', '), isActive: w.isActive });
    setShowModal(true);
  };

  const handleSave = () => {
    const events = form.eventsStr.split(',').map(e => e.trim()).filter(Boolean);
    const payload = { name: form.name, url: form.url, events, isActive: form.isActive };
    if (editId !== null) {
      setWebhooks(prev => prev.map(w => w.id === editId ? { ...w, ...payload } : w));
    } else {
      const newW: Webhook = {
        id: Date.now(), ...payload, secret: Math.random().toString(36).substring(2, 15),
        lastTriggeredAt: null, failureCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      setWebhooks(prev => [...prev, newW]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this webhook?')) return;
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const handleTest = async (id: number) => {
    setTesting(prev => ({ ...prev, [id]: 'loading' }));
    try {
      await webhookService.test(id);
      setTesting(prev => ({ ...prev, [id]: 'success' }));
      setTimeout(() => setTesting(prev => { const n = { ...prev }; delete n[id]; return n; }), 3000);
    } catch {
      setTesting(prev => ({ ...prev, [id]: 'failure' }));
      setTimeout(() => setTesting(prev => { const n = { ...prev }; delete n[id]; return n; }), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Webhook Integrations</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Configure outgoing webhooks for Slack, Zapier, and custom endpoints</div>
        </div>
        <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> New Webhook</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Webhooks', value: total, color: '#3b82f6', icon: 'ti-webhook' },
          { label: 'Active', value: activeCount, color: '#22c55e', icon: 'ti-circle-check' },
          { label: 'Total Failures', value: failedCount, color: '#ef4444', icon: 'ti-alert-triangle' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Name</th>
                <th style={hdrStyle}>URL</th>
                <th style={hdrStyle}>Events</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Last Triggered</th>
                <th style={hdrStyle}>Failures</th>
                <th style={{ ...hdrStyle, textAlign: 'center', width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map(w => {
                const status = testing[w.id];
                return (
                  <tr key={w.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={cellStyle}><span style={{ fontWeight: 600 }}>{w.name}</span></td>
                    <td style={{ ...cellStyle, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{trunc(w.url, 50)}</td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {w.events.map(e => <span key={e} style={{ padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: 'rgba(0,201,167,0.08)', color: 'var(--accent)' }}>{e}</span>)}
                      </div>
                    </td>
                    <td style={cellStyle}>{badge(w.isActive ? 'Active' : 'Inactive', w.isActive ? '#22c55e' : '#5c6f8a')}</td>
                    <td style={cellStyle}>{TZ(w.lastTriggeredAt)}</td>
                    <td style={cellStyle}><span style={{ color: w.failureCount > 0 ? '#ef4444' : 'var(--text2)', fontWeight: 600 }}>{w.failureCount}</span></td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        <button style={{ ...btn, padding: '4px 8px' }} onClick={() => openEdit(w)} title="Edit"><i className="las la-edit" style={{ fontSize: 13 }}></i></button>
                        <button style={{ ...btn, padding: '4px 8px' }} onClick={() => handleTest(w.id)} title="Test" disabled={status === 'loading'}>
                          {status === 'loading' ? <i className="las la-spinner" style={{ fontSize: 13, animation: 'spin 0.8s linear infinite' }}></i> :
                           status === 'success' ? <i className="las la-check" style={{ fontSize: 13, color: '#22c55e' }}></i> :
                           status === 'failure' ? <i className="las la-times" style={{ fontSize: 13, color: '#ef4444' }}></i> :
                           <i className="las la-paper-plane" style={{ fontSize: 13 }}></i>}
                        </button>
                        <button style={{ ...btn, padding: '4px 8px', color: 'var(--danger)' }} onClick={() => handleDelete(w.id)} title="Delete"><i className="las la-trash-alt" style={{ fontSize: 13 }}></i></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {webhooks.length === 0 && !loading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, fontSize: 13, color: 'var(--text3)' }}>No webhooks configured. Create your first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 460, maxWidth: '90vw' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{editId !== null ? 'Edit Webhook' : 'New Webhook'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                <i className="las la-times"></i>
              </button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Slack Alerts" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>URL</label>
                  <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://hooks.example.com/..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Events (comma separated)</label>
                  <input value={form.eventsStr} onChange={e => setForm({ ...form, eventsStr: e.target.value })} placeholder="alert.triggered, geofence.entry" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ accentColor: 'var(--accent)', width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="isActive" style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>Active</label>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={btn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={btnPrimary} onClick={handleSave} disabled={!form.name || !form.url}>
                <i className={`ti ${editId !== null ? 'ti-device-floppy' : 'ti-plus'}`} style={{ fontSize: 14 }}></i>
                {editId !== null ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
