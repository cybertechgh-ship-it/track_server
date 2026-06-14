import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CYTRACK_LOGO } from '../constants/logo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess) {
      const t = setTimeout(() => navigate('/'), 1800);
      return () => clearTimeout(t);
    }
  }, [loginSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      setLoginSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      fontFamily: "'Inter', sans-serif",
      color: '#eef2f8',
      minHeight: 'min(100vh, 100dvh)',
      position: 'relative' as const,
      overflowX: 'hidden' as const,
      WebkitFontSmoothing: 'antialiased' as const,
    },
    bg: {
      position: 'fixed' as const, inset: 0, zIndex: 0,
      backgroundImage: 'url(https://res.cloudinary.com/dwsl2ktt2/image/upload/v1781346830/back_d7gkkc.png)',
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
    },
    bgOverlay: {
      position: 'absolute' as const, inset: 0,
      background: 'linear-gradient(180deg, rgba(6,10,18,.55) 0%, rgba(6,10,18,.65) 45%, rgba(5,8,15,.88) 100%), radial-gradient(ellipse at 50% 40%, rgba(57,230,210,.06), transparent 60%)',
    },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 48px' } as const,
    brand: { display: 'flex', alignItems: 'center', gap: 12 } as const,
    brandMark: { width: 38, height: 38, flexShrink: 0, objectFit: 'contain' as const },
    brandText: { display: 'flex', flexDirection: 'column' as const, lineHeight: 1.1 },
    brandName: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.35rem', letterSpacing: '.5px', textShadow: '0 2px 12px rgba(0,0,0,.5)' },
    brandTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: '.68rem', letterSpacing: '.18em', color: '#c4cce0', textTransform: 'uppercase' as const, marginTop: 2 },
    statusPill: {
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: "'JetBrains Mono', monospace", fontSize: '.74rem',
      color: '#c4cce0', letterSpacing: '.06em',
      border: '1px solid rgba(255,255,255,.12)',
      background: 'rgba(10,15,25,.46)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '8px 16px', borderRadius: 100,
    },
    main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 0 },
    card: {
      width: '100%', maxWidth: 420, maxHeight: '100%', overflowY: 'auto' as const,
      background: 'rgba(10,15,25,.46)',
      border: '1px solid rgba(255,255,255,.12)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      borderRadius: 18,
      padding: 42,
      boxShadow: '0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)',
    },
    eyebrow: {
      fontFamily: "'JetBrains Mono', monospace", fontSize: '.7rem',
      letterSpacing: '.22em', textTransform: 'uppercase' as const,
      color: '#39e6d2', marginBottom: 14,
      display: 'flex', alignItems: 'center', gap: 10,
    },
    eyebrowLine: { display: 'block', width: 24, height: 1, background: '#39e6d2', opacity: .6 },
    h2: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 },
    sub: { color: '#c4cce0', fontSize: '.9rem', marginBottom: 30 },
    errorBox: {
      marginBottom: 20, padding: '12px 16px',
      background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
      borderRadius: 10, fontSize: '.85rem', color: '#fca5a5',
    },
    field: { marginBottom: 18 },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 500, color: '#c4cce0', marginBottom: 8 },
    inputWrap: { position: 'relative' as const, display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute' as const, left: 14, width: 18, height: 18, color: '#8a96ad', pointerEvents: 'none' as const },
    input: {
      width: '100%', background: 'rgba(255,255,255,.06)',
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 10, padding: '13px 14px 13px 44px',
      fontFamily: "'Inter', sans-serif", fontSize: '.92rem',
      color: '#eef2f8', outline: 'none',
      transition: 'border-color .15s ease, background .15s ease',
    },
    inputPwd: {
      width: '100%', background: 'rgba(255,255,255,.06)',
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 10, padding: '13px 44px 13px 44px',
      fontFamily: "'Inter', sans-serif", fontSize: '.92rem',
      color: '#eef2f8', outline: 'none',
      transition: 'border-color .15s ease, background .15s ease',
    },
    toggleBtn: {
      position: 'absolute' as const, right: 12, background: 'none', border: 'none',
      cursor: 'pointer', color: '#8a96ad', width: 30, height: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 6,
    },
    rowBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 26px', fontSize: '.82rem' } as const,
    remember: { display: 'flex', alignItems: 'center', gap: 9, color: '#c4cce0', cursor: 'pointer', userSelect: 'none' as const },
    checkbox: {
      appearance: 'none' as const, width: 16, height: 16,
      border: '1px solid rgba(255,255,255,.24)', borderRadius: 4,
      background: 'rgba(255,255,255,.06)', cursor: 'pointer',
      position: 'relative' as const, flexShrink: 0,
    } as React.CSSProperties,
    forgotLink: { color: '#39e6d2', textDecoration: 'none', fontWeight: 500 },
    btnPrimary: {
      width: '100%', padding: 14, border: 'none', borderRadius: 10,
      background: 'linear-gradient(135deg, #39e6d2, #1fb3a3)',
      color: '#04231f', fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600, fontSize: '.95rem',
      cursor: 'pointer', boxShadow: '0 10px 28px rgba(57,230,210,.22)',
    },
    divider: {
      display: 'flex', alignItems: 'center', gap: 14,
      margin: '24px 0',
      color: '#8a96ad', fontSize: '.72rem', letterSpacing: '.12em',
      textTransform: 'uppercase' as const, fontFamily: "'JetBrains Mono', monospace",
    },
    dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,.12)' },
    btnSecondary: {
      width: '100%', padding: 13,
      border: '1px solid rgba(255,255,255,.12)', borderRadius: 10,
      background: 'rgba(255,255,255,.04)', color: '#eef2f8',
      fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '.88rem',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    cardFooter: { textAlign: 'center' as const, marginTop: 24, fontSize: '.83rem', color: '#c4cce0' },
    trust: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
      marginTop: 28, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,.12)',
      color: '#8a96ad', fontFamily: "'JetBrains Mono', monospace",
      fontSize: '.66rem', letterSpacing: '.1em', textTransform: 'uppercase' as const,
    },
    trustItem: { display: 'flex', alignItems: 'center', gap: 6 } as const,
    trustIcon: { width: 13, height: 13 },
    footer: {
      textAlign: 'center' as const, padding: '0 24px 28px',
      fontFamily: "'JetBrains Mono', monospace", fontSize: '.72rem',
      color: '#c4cce0', letterSpacing: '.06em',
      textShadow: '0 2px 8px rgba(0,0,0,.5)',
    },
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes dot-pulse{0%{box-shadow:0 0 0 0 rgba(57,230,210,.55)}70%{box-shadow:0 0 0 8px rgba(57,230,210,0)}100%{box-shadow:0 0 0 0 rgba(57,230,210,0)}}
        @keyframes fadeSlideIn{0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:scale(1)}}
        @keyframes popIn{0%{transform:scale(0)}100%{transform:scale(1)}}
        @keyframes drawCheck{to{stroke-dashoffset:0}}
        @keyframes fadeSlideUp{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
        *{margin:0;padding:0;box-sizing:border-box}
        @media (max-width:760px){
          .lg-header{padding:20px 24px!important}
          .lg-main{padding:16px!important}
          .lg-card{padding:32px 28px!important;max-width:440px!important}
        }
        @media (max-width:560px){
          .lg-header{padding:18px 16px!important;gap:10px!important}
          .lg-brand{gap:9px!important}
          .lg-brand-mark{width:32px!important;height:32px!important}
          .lg-brand-name{font-size:1.1rem!important}
          .lg-brand-tag{font-size:.58rem!important;letter-spacing:.14em!important}
          .lg-pill{font-size:.62rem!important;padding:7px 12px!important;gap:7px!important}
          .lg-main{padding:12px!important;align-items:center!important}
          .lg-card{padding:26px 20px!important;border-radius:16px!important}
          .lg-eyebrow{font-size:.64rem!important;margin-bottom:12px!important}
          .lg-eyebrow-line{width:18px!important}
          .lg-h2{font-size:1.4rem!important}
          .lg-sub{font-size:.85rem!important;margin-bottom:24px!important}
          .lg-field{margin-bottom:14px!important}
          .lg-input{padding:12px 12px 12px 40px!important;font-size:.9rem!important}
          .lg-input-icon{left:12px!important;width:17px!important;height:17px!important}
          .lg-row{margin:4px 0 20px!important;font-size:.78rem!important}
          .lg-btn-primary{padding:13px!important;font-size:.9rem!important}
          .lg-btn-secondary{padding:12px!important;font-size:.85rem!important}
          .lg-divider{margin:20px 0!important}
          .lg-trust{flex-direction:column!important;align-items:flex-start!important;gap:10px!important;margin-top:22px!important;padding-top:18px!important}
          .lg-footer{padding:0 16px 18px!important;font-size:.64rem!important}
        }
        @media (max-width:380px){
          .lg-header{flex-direction:column!important;align-items:flex-start!important;gap:12px!important}
          .lg-pill{align-self:flex-start!important}
          .lg-card{padding:22px 16px!important}
          .lg-h2{font-size:1.3rem!important}
        }
        @media (max-height:680px) and (min-width:561px){
          .lg-header{padding:20px 32px!important}
          .lg-card{padding:28px 36px!important}
          .lg-eyebrow{margin-bottom:10px!important}
          .lg-sub{margin-bottom:20px!important}
          .lg-field{margin-bottom:12px!important}
          .lg-row{margin:4px 0 18px!important}
          .lg-divider{margin:18px 0!important}
          .lg-trust{margin-top:18px!important;padding-top:16px!important}
          .lg-footer{padding-bottom:16px!important}
        }
        @media (prefers-reduced-motion: reduce){
          *{animation:none!important;transition:none!important}
        }
      `}</style>

      <div style={s.bg}>
        <div style={s.bgOverlay} />
      </div>

      {loginSuccess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,10,18,.85)', backdropFilter: 'blur(8px)', animation: 'fadeSlideIn .35s ease-out' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #39e6d2, #0f8a7f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(57,230,210,.4)', animation: 'popIn .5s cubic-bezier(.175,.885,.32,1.275)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06120e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 60, strokeDashoffset: 60, animation: 'drawCheck .4s .35s ease forwards' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#eef2f8', textShadow: '0 2px 16px rgba(57,230,210,.3)', animation: 'fadeSlideUp .4s .5s ease both' }}>
              Welcome back
            </div>
            <div style={{ fontSize: 14, color: '#8fa3b8', animation: 'fadeSlideUp .4s .65s ease both' }}>
              Redirecting to dashboard…
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, minHeight: 'min(100vh, 100dvh)', display: 'flex', flexDirection: 'column' }}>
        <header className="lg-header" style={s.header}>
          <div className="lg-brand" style={s.brand}>
            <div style={s.brandText}>
              <span className="lg-brand-name" style={s.brandName}>{CYTRACK_LOGO.brandName}</span>
              <span className="lg-brand-tag" style={s.brandTag}>{CYTRACK_LOGO.tagline}</span>
            </div>
          </div>
          <div className="lg-pill" style={s.statusPill}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#39e6d2', animation: 'dot-pulse 2.4s ease-out infinite', display: 'inline-block' }} />
            All systems operational
          </div>
        </header>

        <main className="lg-main" style={s.main}>
          <div className="lg-card" style={s.card}>
            <div className="lg-eyebrow" style={s.eyebrow}>
              <span className="lg-eyebrow-line" style={s.eyebrowLine} />
              Fleet Intelligence Platform
            </div>

            <h2 className="lg-h2" style={s.h2}>Welcome back</h2>
            {error && (
              <div style={s.errorBox}>{error}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="lg-field" style={s.field}>
                <label style={s.label}>Work email</label>
                <div style={s.inputWrap}>
                  <svg className="lg-input-icon" style={s.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6.5 12 13l9-6.5"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
                  <input
                    className="lg-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@yourcompany.com"
                    autoComplete="username"
                    required
                    style={s.input}
                    onFocus={(e) => { e.target.style.borderColor = '#39e6d2'; e.target.style.background = 'rgba(57,230,210,.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.background = 'rgba(255,255,255,.06)' }}
                  />
                </div>
              </div>

              <div className="lg-field" style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <svg className="lg-input-icon" style={s.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input
                    className="lg-input"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                    style={s.inputPwd}
                    onFocus={(e) => { e.target.style.borderColor = '#39e6d2'; e.target.style.background = 'rgba(57,230,210,.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.background = 'rgba(255,255,255,.06)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={s.toggleBtn}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#39e6d2'; e.currentTarget.style.background = 'rgba(57,230,210,.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#8a96ad'; e.currentTarget.style.background = 'transparent' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <div className="lg-row" style={s.rowBetween}>
                <label style={s.remember}>
                  <input
                    type="checkbox"
                    style={s.checkbox}
                    onChange={(e) => {
                      if (e.target.checked) { e.target.style.background = '#39e6d2'; e.target.style.borderColor = '#39e6d2' }
                      else { e.target.style.background = 'rgba(255,255,255,.06)'; e.target.style.borderColor = 'rgba(255,255,255,.12)' }
                    }}
                  />
                  Remember this device
                </label>
                <a href="#" style={s.forgotLink} onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="lg-btn-primary"
                style={{ ...s.btnPrimary, opacity: loading ? .75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.boxShadow = '0 12px 34px rgba(57,230,210,.32)' } }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(57,230,210,.22)' }}
              >
                {loading ? 'Authenticating\u2026' : 'Sign in to console'}
              </button>
            </form>


       



            <div className="lg-trust" style={s.trust}>
              <span style={s.trustItem}>
                <svg style={s.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                256-bit encryption
              </span>
              <span style={s.trustItem}>
                <svg style={s.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6Z"/></svg>
                SOC 2 Type II
              </span>
            </div>
          </div>
        </main>

        <footer className="lg-footer" style={s.footer}>
          &copy; 2026 CyTrack &middot; Fleet Operations Console &middot; v4.2.1
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
