import { useEffect, useRef, useState } from 'react'
import {
  hasKey,
  autocompleteCities,
  autocompleteHotels,
  placeLocation,
} from './lib/places'

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
  pin: { fontSize: 48, marginBottom: 8 },
  title: {
    fontSize: 'clamp(30px, 7vw, 44px)',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  around: { color: '#5eead4' },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: '#cbd5e1',
    maxWidth: 420,
    lineHeight: 1.5,
  },
  card: {
    marginTop: 28,
    width: '100%',
    maxWidth: 420,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 24,
    backdropFilter: 'blur(6px)',
    textAlign: 'left',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  fieldWrap: { position: 'relative', marginBottom: 16 },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(15,23,42,0.55)',
    color: '#f1f5f9',
    fontSize: 16,
    outline: 'none',
  },
  inputDisabled: { opacity: 0.45 },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 20,
    boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
  },
  option: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    color: '#e2e8f0',
    fontSize: 15,
    textAlign: 'left',
    cursor: 'pointer',
  },
  optionSecondary: { display: 'block', fontSize: 12.5, color: '#94a3b8' },
  dateRow: { display: 'flex', gap: 10, marginBottom: 16 },
  dateCol: { flex: 1 },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(90deg, #14b8a6, #0d9488)',
    color: 'white',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
  },
  buttonDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  note: {
    marginTop: 14,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  summary: {
    marginTop: 18,
    padding: '14px 16px',
    borderRadius: 12,
    background: 'rgba(20,184,166,0.12)',
    border: '1px solid rgba(94,234,212,0.35)',
    color: '#ccfbf1',
    fontSize: 15,
    lineHeight: 1.55,
  },
}

function useDebounced(value, ms) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

function AutocompleteField({
  label,
  placeholder,
  value,
  onText,
  suggestions,
  onPick,
  disabled,
}) {
  const [open, setOpen] = useState(false)
  const blurTimer = useRef(null)
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>{label}</label>
      <input
        style={{ ...styles.input, ...(disabled ? styles.inputDisabled : {}) }}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onText(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay closing so a click on a suggestion still lands.
          blurTimer.current = setTimeout(() => setOpen(false), 150)
        }}
      />
      {open && suggestions.length > 0 && (
        <div style={styles.dropdown}>
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              style={styles.option}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                clearTimeout(blurTimer.current)
                setOpen(false)
                onPick(s)
              }}
            >
              {s.main}
              {s.secondary && (
                <span style={styles.optionSecondary}>{s.secondary}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function App() {
  const keyReady = hasKey()

  const [cityText, setCityText] = useState('')
  const [city, setCity] = useState(null) // {placeId, main, secondary}
  const [cityCenter, setCityCenter] = useState(null) // {latitude, longitude}
  const [citySugs, setCitySugs] = useState([])

  const [hotelText, setHotelText] = useState('')
  const [hotel, setHotel] = useState(null)
  const [hotelSugs, setHotelSugs] = useState([])

  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [summary, setSummary] = useState(null)

  const cityQuery = useDebounced(cityText, 300)
  const hotelQuery = useDebounced(hotelText, 300)

  useEffect(() => {
    let stale = false
    if (!keyReady || !cityQuery.trim() || (city && cityQuery === city.main)) {
      setCitySugs([])
      return
    }
    autocompleteCities(cityQuery).then((r) => {
      if (!stale) setCitySugs(r)
    })
    return () => {
      stale = true
    }
  }, [cityQuery, city, keyReady])

  useEffect(() => {
    let stale = false
    if (
      !keyReady ||
      !hotelQuery.trim() ||
      (hotel && hotelQuery === hotel.main)
    ) {
      setHotelSugs([])
      return
    }
    autocompleteHotels(hotelQuery, cityCenter).then((r) => {
      if (!stale) setHotelSugs(r)
    })
    return () => {
      stale = true
    }
  }, [hotelQuery, hotel, cityCenter, keyReady])

  const datesValid = checkin && checkout && checkout > checkin
  const ready = Boolean(city && hotel && datesValid)

  function pickCity(s) {
    setCity(s)
    setCityText(s.main)
    setCitySugs([])
    setHotel(null)
    setHotelText('')
    setCityCenter(null)
    setSummary(null)
    placeLocation(s.placeId).then(setCityCenter)
  }

  function pickHotel(s) {
    setHotel(s)
    setHotelText(s.main)
    setHotelSugs([])
    setSummary(null)
  }

  function scan() {
    if (!ready) return
    setSummary(
      `Got it — scanning around ${hotel.main} in ${city.main}, ` +
        `${formatDate(checkin)} to ${formatDate(checkout)}. ` +
        `Phase 2 brings the results: concerts, games, restaurants, and more.`,
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.pin}>📍</div>
      <h1 style={styles.title}>
        <span style={styles.around}>Around</span>MyStay
      </h1>
      <p style={styles.tagline}>
        Everything happening around your hotel during your stay — all on one
        map.
      </p>

      <div style={styles.card}>
        <AutocompleteField
          label="City"
          placeholder="Where are you headed?"
          value={cityText}
          onText={(t) => {
            setCityText(t)
            if (city && t !== city.main) setCity(null)
          }}
          suggestions={citySugs}
          onPick={pickCity}
        />

        <AutocompleteField
          label="Hotel"
          placeholder={city ? 'Where are you staying?' : 'Pick a city first'}
          value={hotelText}
          onText={(t) => {
            setHotelText(t)
            if (hotel && t !== hotel.main) setHotel(null)
          }}
          suggestions={hotelSugs}
          onPick={pickHotel}
          disabled={!city}
        />

        <div style={styles.dateRow}>
          <div style={styles.dateCol}>
            <label style={styles.fieldLabel}>Check-in</label>
            <input
              type="date"
              style={styles.input}
              value={checkin}
              onChange={(e) => {
                setCheckin(e.target.value)
                setSummary(null)
              }}
            />
          </div>
          <div style={styles.dateCol}>
            <label style={styles.fieldLabel}>Check-out</label>
            <input
              type="date"
              style={styles.input}
              value={checkout}
              min={checkin || undefined}
              onChange={(e) => {
                setCheckout(e.target.value)
                setSummary(null)
              }}
            />
          </div>
        </div>

        <button
          style={{ ...styles.button, ...(ready ? {} : styles.buttonDisabled) }}
          disabled={!ready}
          onClick={scan}
        >
          Scan my surroundings
        </button>

        {!keyReady && (
          <div style={styles.note}>
            Autocomplete is asleep until the Google key is connected — the form
            wakes up automatically once it is.
          </div>
        )}

        {summary && <div style={styles.summary}>{summary}</div>}
      </div>
    </div>
  )
}
