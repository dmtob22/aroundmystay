const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    textAlign: 'center',
  },
  pin: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 'clamp(32px, 8vw, 48px)',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  around: { color: '#5eead4' },
  tagline: {
    marginTop: 10,
    fontSize: 18,
    color: '#cbd5e1',
    maxWidth: 420,
    lineHeight: 1.5,
  },
  card: {
    marginTop: 36,
    width: '100%',
    maxWidth: 420,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 24,
    backdropFilter: 'blur(6px)',
  },
  fieldLabel: {
    display: 'block',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  fieldBox: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(15,23,42,0.55)',
    color: '#64748b',
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(90deg, #14b8a6, #0d9488)',
    color: 'white',
    fontSize: 17,
    fontWeight: 700,
    opacity: 0.55,
    cursor: 'not-allowed',
  },
  comingSoon: {
    marginTop: 14,
    fontSize: 13,
    color: '#94a3b8',
  },
}

export default function App() {
  return (
    <div style={styles.page}>
      <div style={styles.pin}>📍</div>
      <h1 style={styles.title}>
        <span style={styles.around}>Around</span>MyStay
      </h1>
      <p style={styles.tagline}>
        Everything happening around your hotel during your stay — concerts,
        games, restaurants, bars, and tours, all on one map.
      </p>

      <div style={styles.card}>
        <label style={styles.fieldLabel}>City</label>
        <div style={styles.fieldBox}>Where are you headed?</div>

        <label style={styles.fieldLabel}>Hotel</label>
        <div style={styles.fieldBox}>Where are you staying?</div>

        <label style={styles.fieldLabel}>Dates</label>
        <div style={styles.fieldBox}>Check-in → Check-out</div>

        <button style={styles.button} disabled>
          Scan my surroundings
        </button>
        <div style={styles.comingSoon}>
          Phase 1 in progress — search comes alive next.
        </div>
      </div>
    </div>
  )
}
