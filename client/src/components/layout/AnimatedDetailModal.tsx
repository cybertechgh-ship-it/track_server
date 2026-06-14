import { useEffect, useState } from 'react';

export interface DetailField {
  label: string;
  value: string | number | null | undefined;
  icon?: string;
  color?: string;
  mono?: boolean;
  badge?: boolean;
  badgeColor?: string;
}

export interface DetailSection {
  title: string;
  icon: string;
  iconColor: string;
  fields: DetailField[];
}

interface AnimatedDetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  sections: DetailSection[];
  accent?: string;
}

export const AnimatedDetailModal = ({
  open, onClose, title, subtitle, icon, iconBg, iconColor, sections, accent = 'var(--accent)',
}: AnimatedDetailModalProps) => {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    } else {
      setAnimate(false);
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes dmOverlayIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes dmOverlayOut { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes dmSlideIn { 0% { opacity: 0; transform: scale(0.92) translateY(16px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes dmSlideOut { 0% { opacity: 1; transform: scale(1) translateY(0); } 100% { opacity: 0; transform: scale(0.92) translateY(16px); } }
        @keyframes dmFieldIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          animation: animate ? 'dmOverlayIn 0.2s ease-out forwards' : 'dmOverlayOut 0.2s ease-in forwards',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 18, width: 520, maxWidth: '92vw', maxHeight: '85vh',
            overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            animation: animate ? 'dmSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards' : 'dmSlideOut 0.2s ease-in forwards',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '22px 24px 18px',
            borderBottom: '1px solid var(--border)',
            background: `linear-gradient(135deg, ${accent}08, transparent)`,
            borderRadius: '18px 18px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className={`ti ti-${icon}`} style={{ fontSize: 24, color: iconColor }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                {subtitle && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{subtitle}</div>}
              </div>
              <button onClick={onClose} style={{
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                color: 'var(--text3)', cursor: 'pointer', fontSize: 16,
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg4)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text3)'; }}
              >
                <i className="las la-times"></i>
              </button>
            </div>
          </div>

          {/* Sections */}
          <div style={{ padding: '16px 24px 20px' }}>
            {sections.map((section, si) => (
              <div key={si} style={{ marginBottom: si < sections.length - 1 ? 18 : 0 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: '1.2px',
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <i className={`ti ti-${section.icon}`} style={{ fontSize: 12, color: section.iconColor }}></i>
                  {section.title}
                </div>
                <div style={{
                  background: 'var(--bg3)', borderRadius: 10,
                  border: '1px solid var(--border)', overflow: 'hidden',
                }}>
                  {section.fields.map((field, fi) => (
                    <div
                      key={fi}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderBottom: fi < section.fields.length - 1 ? '1px solid var(--border)' : 'none',
                        animation: animate ? `dmFieldIn 0.3s ${0.05 * (si * 4 + fi)}s ease-out both` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {field.icon && <i className={`ti ti-${field.icon}`} style={{ fontSize: 13, color: field.color || 'var(--text3)' }}></i>}
                        <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{field.label}</span>
                      </div>
                      {field.badge ? (
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: `${field.badgeColor || accent}18`,
                          color: field.badgeColor || accent,
                        }}>
                          <span style={{
                            display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                            background: field.badgeColor || accent, marginRight: 5, verticalAlign: 'middle',
                          }} />
                          {field.value ?? 'â€”'}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: field.color || 'var(--text)',
                          fontFamily: field.mono ? "'JetBrains Mono', monospace" : 'inherit',
                          textAlign: 'right',
                        }}>
                          {field.value ?? 'â€”'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer accent bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: '0 0 18px 18px' }} />
        </div>
      </div>
    </>
  );
};
