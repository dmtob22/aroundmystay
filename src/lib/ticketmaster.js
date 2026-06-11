// Talks to the Ticketmaster Discovery API. The key lives ONLY in the
// git-ignored .env as VITE_TICKETMASTER_KEY — never in this code.
// v1 note: the key ships inside the client bundle. Accepted risk for now
// (no payment method attached, Ticketmaster rate-caps it); move behind a
// Vercel serverless proxy before any serious launch.
const KEY = import.meta.env.VITE_TICKETMASTER_KEY
const PLACEHOLDER = 'PASTE-TICKETMASTER-KEY-HERE'

export function hasTmKey() {
  return Boolean(KEY) && KEY !== PLACEHOLDER
}

// Returns { events, error } — same visible-error pattern as places.js,
// because phones have no console.
export async function findEvents({ latitude, longitude, startDate, endDate }) {
  if (!hasTmKey()) {
    return { events: [], error: 'Ticketmaster key not connected yet.' }
  }
  const params = new URLSearchParams({
    apikey: KEY,
    latlong: latitude + ',' + longitude,
    radius: '20',
    unit: 'miles',
    // Local (venue) time, not UTC — otherwise the previous evening's events
    // leak in from the timezone offset.
    localStartDateTime:
      startDate + 'T00:00:00,' + endDate + 'T23:59:59',
    sort: 'date,asc',
    size: '100',
  })
  let res
  try {
    res = await fetch(
      'https://app.ticketmaster.com/discovery/v2/events.json?' + params,
    )
  } catch (e) {
    return {
      events: [],
      error: 'Network problem reaching Ticketmaster: ' + e.message,
    }
  }
  if (!res.ok) {
    const text = await res.text()
    console.error('Ticketmaster failed:', res.status, text)
    return {
      events: [],
      error: 'Ticketmaster said no (' + res.status + '): ' + text.slice(0, 200),
    }
  }
  const data = await res.json()
  const events = (data._embedded?.events || []).map((e) => {
    const venue = e._embedded?.venues?.[0]
    const img =
      (e.images || [])
        .filter((i) => i.ratio === '16_9' && i.width >= 300)
        .sort((a, b) => a.width - b.width)[0] || (e.images || [])[0]
    return {
      id: e.id,
      name: e.name,
      url: e.url,
      date: e.dates?.start?.localDate || '',
      time: e.dates?.start?.localTime || '',
      venue: venue?.name || '',
      category:
        (e.classifications?.[0]?.segment?.name || '') !== '' &&
        e.classifications[0].segment.name !== 'Undefined'
          ? e.classifications[0].segment.name
          : 'Event',
      priceMin: e.priceRanges?.[0]?.min,
      priceMax: e.priceRanges?.[0]?.max,
      image: img?.url || '',
      lat: venue?.location ? parseFloat(venue.location.latitude) : null,
      lng: venue?.location ? parseFloat(venue.location.longitude) : null,
    }
  })
  return { events, error: null }
}
