import React from 'react'

export default function LoginScreen({ onSignIn, loading, error }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.bolt}>⚡</div>
        <h1 style={styles.title}>Light Bill<br /><span style={styles.accent}>Tracker</span></h1>
        <p style={styles.sub}>Mississippi Power · Never miss a payment</p>

        <div style={styles.features}>
          {['📧 Syncs with your Gmail', '📊 Payment history chart', '✅ Mark bills paid', '🔔 Reminders'].map(f => (
            <div key={f} style={styles.feature}>{f}</div>
          ))}
        </div>

        <button style={styles.btn} onClick={onSignIn} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.note}>Only reads your Gmail — never modifies anything.</p>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'var(--bg)',
    backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,183,48,0.1) 0%, transparent 70%)',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 360,
    textAlign: 'center',
    animation: 'fadeIn 0.4s ease',
  },
  bolt: { fontSize: '3rem', marginBottom: 12 },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    marginBottom: 8,
  },
  accent: { color: 'var(--accent)' },
  sub: { color: 'var(--muted)', fontSize: '0.82rem', fontFamily: 'var(--mono)', marginBottom: 28 },
  features: { marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 },
  feature: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 14px',
    fontSize: '0.84rem',
    textAlign: 'left',
    color: 'var(--text)',
  },
  btn: {
    width: '100%',
    background: '#fff',
    color: '#333',
    border: 'none',
    borderRadius: 10,
    padding: '12px 20px',
    fontSize: '0.92rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'opacity 0.15s',
    marginBottom: 14,
  },
  error: { color: 'var(--red)', fontSize: '0.8rem', marginBottom: 10 },
  note: { color: 'var(--muted)', fontSize: '0.72rem', fontFamily: 'var(--mono)' },
}
