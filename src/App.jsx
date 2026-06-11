import { useEffect, useRef, useState } from 'react'
import {
  hasKey,
  autocompleteCities,
  autocompleteHotels,
  placeLocation,
  searchPlaces,
  photoUrl,
} from './lib/places'
import { hasTmKey, findEvents } from './lib/ticketmaster'

// Each tab is one Places nearby-search. Radii differ on purpose: dinner
// should be walkable-ish, a famous trailhead can be a short drive away.
const PLACE_TABS = [
  { key: 'food', label: 'Food', emoji: '🍽️', types: ['restaurant'], radius: 4000 },
  {
    key: 'bars',
    label: 'Bars',
    emoji: '🍸',
    types: ['bar', 'night_club'],
    radius: 4000,
  },
  {
    key: 'outdoors',
    label: 'Outdoors',
    emoji: '🥾',
    types: ['hiking_area', 'national_park', 'park'],
    radius: 40000,
  },
  {
    key: 'attractions',
    label: 'Attractions',
    emoji: '🎡',
    types: ['tourist_attraction', 'museum', 'amusement_park', 'zoo', 'aquarium'],
    radius: 15000,
  },
]

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
  errorNote: {
    marginTop: 14,
    padding: '12px 14px',
    borderRadius: 10,
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(248,113,113,0.4)',
    color: '#fecaca',
    fontSize: 13.5,
    lineHeight: 1.5,
    textAlign: 'left',
    wordBreak: 'break-word',
  },

  // ----- results screen -----
  tabBar: {
    width: '100%',
    maxWidth: 560,
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    padding: '10px 0 4px',
    WebkitOverflowScrolling: 'touch',
  },
  tab: {
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#cbd5e1',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 14,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  tabOn: {
    border: '1px solid rgba(94,234,212,0.7)',
    background: 'rgba(20,184,166,0.2)',
    color: '#ccfbf1',
    fontWeight: 700,
  },
  openNow: { color: '#5eead4', fontWeight: 600 },
  closedNow: { color: '#fca5a5', fontWeight: 600 },
  resultsPage: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 12px 90px',
  },
  resultsHeader: {
    width: '100%',
    maxWidth: 560,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  backBtn: {
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 14,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  resultsTitleWrap: { textAlign: 'left', minWidth: 0 },
  resultsTitle: {
    fontSize: 17,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  resultsSub: { fontSize: 13, color: '#94a3b8' },
  dateHeader: {
    width: '100%',
    maxWidth: 560,
    textAlign: 'left',
    margin: '18px 0 8px',
    fontSize: 14,
    fontWeight: 700,
    color: '#5eead4',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  eventCard: {
    width: '100%',
    maxWidth: 560,
    display: 'flex',
    gap: 12,
    alignItems: 'stretch',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    textAlign: 'left',
  },
  eventCardPicked: {
    border: '1px solid rgba(94,234,212,0.6)',
    background: 'rgba(20,184,166,0.10)',
  },
  eventImg: {
    width: 86,
    height: 86,
    objectFit: 'cover',
    borderRadius: 10,
    flexShrink: 0,
    background: 'rgba(15,23,42,0.6)',
  },
  eventInfo: { flex: 1, minWidth: 0 },
  eventName: { fontSize: 15.5, fontWeight: 700, lineHeight: 1.35 },
  eventMeta: { fontSize: 13, color: '#cbd5e1', marginTop: 3, lineHeight: 1.45 },
  chip: {
    display: 'inline-block',
    fontSize: 11.5,
    fontWeight: 700,
    color: '#5eead4',
    border: '1px solid rgba(94,234,212,0.4)',
    borderRadius: 999,
    padding: '1px 8px',
    marginTop: 6,
  },
  eventActions: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  pickBtn: {
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  pickBtnOn: {
    border: '1px solid rgba(94,234,212,0.7)',
    background: 'rgba(20,184,166,0.25)',
    color: '#ccfbf1',
  },
  ticketLink: {
    fontSize: 13,
    fontWeight: 700,
    color: '#5eead4',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  emptyNote: {
    marginTop: 30,
    maxWidth: 460,
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 1.6,
  },
  footerBar: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '12px 16px',
    background: 'rgba(15,23,42,0.92)',
    borderTop: '1px solid rgba(255,255,255,0.12)',
    textAlign: 'center',
    fontSize: 14,
    color: '#ccfbf1',
    backdropFilter: 'blur(8px)',
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

function formatDateLong(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return h12 + ':' + String(m).padStart(2, '0') + ' ' + ampm
}

function priceLabel(min, max) {
  if (min == null) return ''
  if (max != null && max !== min)
    return '$' + Math.round(min) + '–$' + Math.round(max)
  return '$' + Math.round(min)
}

// Straight-line ("as the crow flies") miles between two points. Real
// walk/drive times come in Phase 5 — this is the free preview.
function milesBetween(a, b) {
  if (!a || !b || a.latitude == null || b.lat == null) return null
  const R = 3958.8
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.latitude)
  const dLng = toRad(b.lng - a.longitude)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function distanceLabel(mi) {
  if (mi == null) return ''
  if (mi < 10) return '≈' + mi.toFixed(1) + ' mi'
  return '≈' + Math.round(mi) + ' mi'
}

function priceDollars(priceLevel) {
  const map = {
    PRICE_LEVEL_INEXPENSIVE: '$',
    PRICE_LEVEL_MODERATE: '$$',
    PRICE_LEVEL_EXPENSIVE: '$$$',
    PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
  }
  return map[priceLevel] || ''
}

export default function App() {
  const keyReady = hasKey()

  const [cityText, setCityText] = useState('')
  const [city, setCity] = useState(null) // {placeId, main, secondary}
  const [cityCenter, setCityCenter] = useState(null) // {latitude, longitude}
  const [citySugs, setCitySugs] = useState([])

  const [hotelText, setHotelText] = useState('')
  const [hotel, setHotel] = useState(null)
  const [hotelCenter, setHotelCenter] = useState(null)
  const [hotelSugs, setHotelSugs] = useState([])

  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [apiError, setApiError] = useState(null)

  const [screen, setScreen] = useState('search') // 'search' | 'results'
  const [scanning, setScanning] = useState(false)
  const [events, setEvents] = useState([])
  const [places, setPlaces] = useState({}) // {tabKey: [place, ...]}
  const [activeTab, setActiveTab] = useState('events')
  const [picked, setPicked] = useState(() => new Set())

  const cityQuery = useDebounced(cityText, 300)
  const hotelQuery = useDebounced(hotelText, 300)

  useEffect(() => {
    let stale = false
    if (!keyReady || !cityQuery.trim() || (city && cityQuery === city.main)) {
      setCitySugs([])
      return
    }
    autocompleteCities(cityQuery).then(({ items, error }) => {
      if (stale) return
      setCitySugs(items)
      setApiError(error)
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
    autocompleteHotels(hotelQuery, cityCenter).then(({ items, error }) => {
      if (stale) return
      setHotelSugs(items)
      setApiError(error)
    })
    return () => {
      stale = true
    }
  }, [hotelQuery, hotel, cityCenter, keyReady])

  const datesValid = checkin && checkout && checkout > checkin
  const ready = Boolean(city && hotel && datesValid && !scanning)

  function pickCity(s) {
    setCity(s)
    setCityText(s.main)
    setCitySugs([])
    setHotel(null)
    setHotelText('')
    setCityCenter(null)
    setHotelCenter(null)
    placeLocation(s.placeId).then(setCityCenter)
  }

  function pickHotel(s) {
    setHotel(s)
    setHotelText(s.main)
    setHotelSugs([])
    setHotelCenter(null)
    placeLocation(s.placeId).then(setHotelCenter)
  }

  async function scan() {
    if (!ready) return
    setScanning(true)
    setApiError(null)
    // Prefer the hotel's exact spot; fall back to city center if its lookup
    // hasn't finished (or failed).
    const center = hotelCenter || cityCenter
    // Everything in parallel: one Ticketmaster query + one Places query per tab.
    const [eventsRes, ...placeResults] = await Promise.all([
      findEvents({
        latitude: center.latitude,
        longitude: center.longitude,
        startDate: checkin,
        endDate: checkout,
      }),
      ...PLACE_TABS.map((t) =>
        searchPlaces({ center, types: t.types, radius: t.radius }),
      ),
    ])
    setScanning(false)
    const firstError =
      eventsRes.error || placeResults.find((r) => r.error)?.error
    if (firstError && !placeResults.some((r) => r.items.length)) {
      // Total failure — stay on the search screen and show why.
      setApiError(firstError)
      return
    }
    // Tag everything with its distance from the hotel before storing.
    const withMiles = (item) => ({ ...item, miles: milesBetween(center, item) })
    setEvents((eventsRes.events || []).map(withMiles))
    const byTab = {}
    PLACE_TABS.forEach((t, i) => {
      byTab[t.key] = placeResults[i].items.map(withMiles)
    })
    setPlaces(byTab)
    setPicked(new Set())
    setActiveTab('events')
    setScreen('results')
  }

  function togglePicked(id) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (screen === 'results') {
    const byDate = []
    for (const e of events) {
      const last = byDate[byDate.length - 1]
      if (last && last.date === e.date) last.items.push(e)
      else byDate.push({ date: e.date, items: [e] })
    }
    return (
      <div style={styles.resultsPage}>
        <div style={styles.resultsHeader}>
          <button style={styles.backBtn} onClick={() => setScreen('search')}>
            ← New search
          </button>
          <div style={styles.resultsTitleWrap}>
            <div style={styles.resultsTitle}>Around {hotel?.main}</div>
            <div style={styles.resultsSub}>
              {city?.main} · {formatDate(checkin)} – {formatDate(checkout)} ·{' '}
              {events.length} events
            </div>
          </div>
        </div>

        <div style={styles.tabBar}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'events' ? styles.tabOn : {}),
            }}
            onClick={() => setActiveTab('events')}
          >
            🎟️ Events ({events.length})
          </button>
          {PLACE_TABS.map((t) => (
            <button
              key={t.key}
              style={{
                ...styles.tab,
                ...(activeTab === t.key ? styles.tabOn : {}),
              }}
              onClick={() => setActiveTab(t.key)}
            >
              {t.emoji} {t.label} ({(places[t.key] || []).length})
            </button>
          ))}
        </div>

        {activeTab === 'events' && events.length === 0 && (
          <div style={styles.emptyNote}>
            No ticketed events found within ~20 miles of your hotel for those
            dates — check the other tabs; restaurants and trails don't take
            nights off.
          </div>
        )}

        {activeTab !== 'events' &&
          (places[activeTab] || []).map((p) => {
            const on = picked.has(p.id)
            return (
              <div
                key={p.id}
                style={{
                  ...styles.eventCard,
                  ...(on ? styles.eventCardPicked : {}),
                }}
              >
                {p.photoName ? (
                  <img
                    src={photoUrl(p.photoName)}
                    alt=""
                    style={styles.eventImg}
                  />
                ) : (
                  <div style={styles.eventImg} />
                )}
                <div style={styles.eventInfo}>
                  <div style={styles.eventName}>{p.name}</div>
                  <div style={styles.eventMeta}>
                    {p.rating != null && (
                      <>
                        ★ {p.rating} ({p.ratingCount.toLocaleString()})
                      </>
                    )}
                    {priceDollars(p.priceLevel)
                      ? ' · ' + priceDollars(p.priceLevel)
                      : ''}
                    {p.openNow != null && (
                      <>
                        {' · '}
                        <span
                          style={p.openNow ? styles.openNow : styles.closedNow}
                        >
                          {p.openNow ? 'Open now' : 'Closed right now'}
                        </span>
                      </>
                    )}
                  </div>
                  <div style={styles.eventMeta}>
                    {distanceLabel(p.miles)
                      ? distanceLabel(p.miles) + ' · '
                      : ''}
                    {p.address}
                  </div>
                </div>
                <div style={styles.eventActions}>
                  <button
                    style={{
                      ...styles.pickBtn,
                      ...(on ? styles.pickBtnOn : {}),
                    }}
                    onClick={() => togglePicked(p.id)}
                  >
                    {on ? '★ Picked' : '☆ Pick'}
                  </button>
                  <a
                    style={styles.ticketLink}
                    href={p.mapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Details ↗
                  </a>
                </div>
              </div>
            )
          })}

        {activeTab === 'events' &&
          byDate.map((g) => (
          <div key={g.date} style={{ width: '100%', maxWidth: 560 }}>
            <div style={styles.dateHeader}>{formatDateLong(g.date)}</div>
            {g.items.map((e) => {
              const on = picked.has(e.id)
              return (
                <div
                  key={e.id}
                  style={{
                    ...styles.eventCard,
                    ...(on ? styles.eventCardPicked : {}),
                  }}
                >
                  {e.image ? (
                    <img src={e.image} alt="" style={styles.eventImg} />
                  ) : (
                    <div style={styles.eventImg} />
                  )}
                  <div style={styles.eventInfo}>
                    <div style={styles.eventName}>{e.name}</div>
                    <div style={styles.eventMeta}>
                      {e.venue}
                      {e.time ? ' · ' + formatTime(e.time) : ''}
                      {priceLabel(e.priceMin, e.priceMax)
                        ? ' · ' + priceLabel(e.priceMin, e.priceMax)
                        : ''}
                      {distanceLabel(e.miles)
                        ? ' · ' + distanceLabel(e.miles)
                        : ''}
                    </div>
                    <span style={styles.chip}>{e.category}</span>
                  </div>
                  <div style={styles.eventActions}>
                    <button
                      style={{
                        ...styles.pickBtn,
                        ...(on ? styles.pickBtnOn : {}),
                      }}
                      onClick={() => togglePicked(e.id)}
                    >
                      {on ? '★ Picked' : '☆ Pick'}
                    </button>
                    <a
                      style={styles.ticketLink}
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get tickets ↗
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {picked.size > 0 && (
          <div style={styles.footerBar}>
            ★ {picked.size} picked — the map view arrives in Phase 4
          </div>
        )}
      </div>
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
              onChange={(e) => setCheckin(e.target.value)}
            />
          </div>
          <div style={styles.dateCol}>
            <label style={styles.fieldLabel}>Check-out</label>
            <input
              type="date"
              style={styles.input}
              value={checkout}
              min={checkin || undefined}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </div>
        </div>

        <button
          style={{ ...styles.button, ...(ready ? {} : styles.buttonDisabled) }}
          disabled={!ready}
          onClick={scan}
        >
          {scanning ? 'Scanning…' : 'Scan my surroundings'}
        </button>

        {!keyReady && (
          <div style={styles.note}>
            Autocomplete is asleep until the Google key is connected — the form
            wakes up automatically once it is.
          </div>
        )}
        {keyReady && !hasTmKey() && (
          <div style={styles.note}>
            Event search wakes up once the Ticketmaster key is connected.
          </div>
        )}

        {apiError && <div style={styles.errorNote}>⚠️ {apiError}</div>}
      </div>
    </div>
  )
}
