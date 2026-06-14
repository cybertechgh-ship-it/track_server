const WHATSAPP_URL = 'https://wa.me/233541988383';
const CLOUDINARY_IMG = 'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1778561984/download_c9fduz.jpg';

export const WhatsAppFloat = () => {
  return (
    <>
      <style>{`
        @keyframes wabounce {
          0%, 75%, 100% { transform: translateY(0); }
          8% { transform: translateY(-9px) rotate(-1deg); }
          16% { transform: translateY(0) rotate(0deg); }
          24% { transform: translateY(-5px); }
          32% { transform: translateY(0); }
        }
        @keyframes waglow {
          0%, 100% { box-shadow: 0 6px 20px rgba(37,211,102,0.35); }
          50% { box-shadow: 0 6px 32px rgba(37,211,102,0.55); }
        }
        @keyframes wapulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes wabadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .wa-fab {
          animation: wabounce 10s ease-in-out infinite, waglow 2.5s ease-in-out infinite;
        }
        .wa-fab:hover {
          animation: waglow 1.5s ease-in-out infinite !important;
          transform: scale(1.07) !important;
        }
        .wa-fab:active {
          transform: scale(0.95) !important;
          transition: transform 0.1s !important;
        }
        .wa-pulse {
          animation: wapulse 2s ease-out infinite;
        }
        .wa-badge {
          animation: wabadge 2s ease-in-out infinite;
        }
      `}</style>

      {/* Pulse ring */}
      <div className="wa-pulse" style={{
        position: 'fixed', bottom: 28, right: 28,
        width: 52, height: 52, borderRadius: '50%',
        background: 'rgba(37,211,102,0.25)',
        zIndex: 998, pointerEvents: 'none',
      }} />

      {/* FAB */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-fab"
        style={{
          position: 'fixed', bottom: 28, right: 28,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 22px 10px 10px',
          height: 52,
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          borderRadius: 50, zIndex: 1000,
          cursor: 'pointer', textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        {/* Notification dot */}
        <div className="wa-badge" style={{
          position: 'absolute', top: 6, right: 6,
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', border: '2px solid #25D366',
        }} />

        <img
          src={CLOUDINARY_IMG}
          alt="WhatsApp"
          style={{
            width: 32, height: 32,
            borderRadius: '50%', objectFit: 'cover',
            border: '2px solid rgba(255,255,255,0.85)',
            flexShrink: 0,
          }}
        />

        <span style={{
          color: '#fff', fontSize: 14, fontWeight: 700,
          whiteSpace: 'nowrap', letterSpacing: '0.3px',
          textShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}>
          Message Developer
        </span>
      </a>
    </>
  );
};
