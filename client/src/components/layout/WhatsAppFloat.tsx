import { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '233541988383';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const CLOUDINARY_IMG = 'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1778561984/download_c9fduz.jpg';

export const WhatsAppFloat = () => {
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!expanded && !showModal) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [expanded, showModal]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fabBounce {
          0%, 70%, 100% { transform: translateY(0) scale(1); }
          10% { transform: translateY(-6px) scale(1.03); }
          20% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-3px) scale(1.01); }
          40%, 60% { transform: translateY(0) scale(1); }
        }
        @keyframes fabGlow {
          0%, 100% { box-shadow: 0 4px 15px rgba(37,211,102,0.35); }
          50% { box-shadow: 0 4px 28px rgba(37,211,102,0.6); }
        }
        @keyframes fabPulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes tooltipSlideIn {
          0% { opacity: 0; transform: translateX(10px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes tooltipSlideOut {
          0% { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(10px) scale(0.95); }
        }
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes modalOverlayIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes iconSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .whatsapp-fab-main {
          animation: fabBounce 10s ease-in-out infinite, fabGlow 2s ease-in-out infinite;
        }
        .whatsapp-fab-main:hover {
          animation: fabGlow 1.5s ease-in-out infinite !important;
          transform: scale(1.06) !important;
        }
        .whatsapp-fab-main:active {
          transform: scale(0.96) !important;
        }
        .whatsapp-pulse-ring {
          animation: fabPulseRing 2s ease-out infinite;
        }
        .whatsapp-tooltip {
          animation: tooltipSlideIn 0.3s ease-out forwards;
        }
        .whatsapp-tooltip.hiding {
          animation: tooltipSlideOut 0.3s ease-in forwards;
        }
        .whatsapp-modal-overlay {
          animation: modalOverlayIn 0.2s ease-out forwards;
        }
        .whatsapp-modal-content {
          animation: modalFadeIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Pulse ring behind FAB */}
      <div
        className="whatsapp-pulse-ring"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(37,211,102,0.2)',
          zIndex: 998,
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip bubble */}
      {showTooltip && !showModal && (
        <div
          className={`whatsapp-tooltip ${!showTooltip ? 'hiding' : ''}`}
          style={{
            position: 'fixed',
            bottom: 50,
            right: 96,
            background: '#fff',
            color: '#1a1a2e',
            padding: '10px 16px',
            borderRadius: 12,
            borderRadius: '12px 12px 4px 12px',
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            border: '1px solid rgba(37,211,102,0.2)',
          }}
          onClick={() => { setShowTooltip(false); setShowModal(true); }}
        >
          <span style={{ color: '#25D366', fontWeight: 700 }}>Need help?</span> Chat with us!
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: 16,
            width: 12,
            height: 12,
            background: '#fff',
            transform: 'rotate(45deg)',
            borderRight: '1px solid rgba(37,211,102,0.2)',
            borderBottom: '1px solid rgba(37,211,102,0.2)',
          }} />
        </div>
      )}

      {/* FAB Button */}
      <div
        className="whatsapp-fab-main"
        onClick={() => { setShowTooltip(false); setShowModal(true); }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: expanded ? '10px 20px 10px 12px' : '0',
          width: expanded ? 'auto' : 56,
          height: 56,
          background: expanded
            ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
            : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          borderRadius: expanded ? 50 : '50%',
          boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
          zIndex: 1001,
          cursor: 'pointer',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), padding 0.3s cubic-bezier(0.4,0,0.2,1), border-radius 0.3s',
          overflow: 'hidden',
          position: 'fixed',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <img
          src={CLOUDINARY_IMG}
          alt="WhatsApp"
          style={{
            width: expanded ? 36 : 32,
            height: expanded ? 36 : 32,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(255,255,255,0.9)',
            flexShrink: 0,
            transition: 'width 0.3s, height 0.3s',
          }}
        />
        {expanded && (
          <span style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            letterSpacing: '0.3px',
            textShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }}>
            Message Developer
          </span>
        )}
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="whatsapp-modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="whatsapp-modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg2)',
              borderRadius: 20,
              padding: 0,
              width: 380,
              maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              padding: '28px 24px 24px',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                border: 'none',
                transition: 'background 0.15s',
              }}
                onClick={() => setShowModal(false)}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✕
              </div>
              <img
                src={CLOUDINARY_IMG}
                alt="Developer"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.5)',
                  marginBottom: 12,
                }}
              />
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                CYBER Tech
              </div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
                Developer & Technical Support
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 10,
                padding: '4px 12px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                fontSize: 11,
                color: '#fff',
                fontWeight: 600,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'fabPulseRing 1.5s ease-in-out infinite' }} />
                Online
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{
                fontSize: 14,
                color: 'var(--text2)',
                lineHeight: 1.6,
                marginBottom: 20,
                textAlign: 'center',
              }}>
                Have a question, bug report, or feature request? Reach out directly on WhatsApp for quick support.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '14px 20px',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: '#fff',
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.3)'; }}
                >
                  <svg viewBox="0 0 32 32" width="20" height="20" fill="#fff">
                    <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.374L1.054 31.25l6.116-1.98A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.35 22.606c-.39 1.1-1.932 2.014-3.164 2.27-.84.174-1.936.312-5.626-1.21-4.724-1.95-7.758-6.75-7.992-7.066-.226-.316-1.9-2.532-1.9-4.83s1.2-3.426 1.628-3.89c.39-.426.926-.57 1.234-.57.31 0 .618.002.888.016.284.014.666-.106 1.038.79.39.932 1.334 3.25 1.45 3.484.116.234.194.506.038.822-.156.316-.234.514-.464.792-.23.278-.484.622-.69.834-.23.234-.47.486-.202.95.268.464 1.192 1.97 2.556 3.192 1.754 1.57 3.232 2.058 3.696 2.284.464.226.736.19 1.008-.116.272-.306 1.16-1.35 1.47-1.826.31-.476.624-.394 1.054-.236.434.156 2.75 1.296 3.222 1.532.474.236.788.354.906.55.116.196.116 1.136-.274 2.236z"/>
                  </svg>
                  Open WhatsApp Chat
                </a>

                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 20px',
                    background: 'var(--bg3)',
                    color: 'var(--text2)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
                >
                  Maybe Later
                </button>
              </div>

              <div style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--text3)',
              }}>
                +233 541 988 383
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
