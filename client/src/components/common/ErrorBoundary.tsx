import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    this.setState({ hasError: false });
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: 24,
          background: 'var(--bg)',
        }}>
          <div style={{
            padding: 32, textAlign: 'center', maxWidth: 500, width: '100%',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="las la-exclamation-triangle" style={{ fontSize: 28, color: '#ef4444' }}></i>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 16 }}>
              The application encountered an unexpected error.
            </div>

            {this.state.error && (
              <div style={{
                marginBottom: 20, padding: 12,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 8, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                color: '#ef4444', textAlign: 'left', overflow: 'auto', maxHeight: 120,
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: 'var(--accent)', color: '#00221c',
                }}
              >
                <i className="las la-sync" style={{ marginRight: 6 }}></i>
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
                }}
              >
                <i className="las la-sign-out-alt" style={{ marginRight: 6 }}></i>
                Reset & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
