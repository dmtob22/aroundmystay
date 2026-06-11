// Talks to Google Places (New). The API key lives ONLY in the git-ignored
// .env file as VITE_GOOGLE_MAPS_API_KEY — never in this code.
const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export function hasKey() {
  return Boolean(KEY)
}

// Returns { items, error } — error is a short human-readable string so the
// UI can show what went wrong (phones have no visible console).
async function autocomplete(input, { types, biasCenter } = {}) {
  if (!KEY || !input.trim()) return { items: [], error: null }
  const body = { input }
  if (types) body.includedPrimaryTypes = types
  if (biasCenter) {
    // Prefer results near the chosen city (30 km circle).
    body.locationBias = { circle: { center: biasCenter, radius: 30000 } }
  }
  let res
  try {
    res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': KEY,
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('Places autocomplete network failure:', e)
    return { items: [], error: 'Network problem reaching Google: ' + e.message }
  }
  if (!res.ok) {
    const text = await res.text()
    console.error('Places autocomplete failed:', res.status, text)
    let msg = ''
    try {
      msg = JSON.parse(text).error?.message || ''
    } catch {
      msg = text
    }
    return {
      items: [],
      error: 'Google said no (' + res.status + '): ' + msg.slice(0, 200),
    }
  }
  const data = await res.json()
  return {
    items: (data.suggestions || [])
      .map((s) => s.placePrediction)
      .filter(Boolean)
      .map((p) => ({
        placeId: p.placeId,
        main: p.structuredFormat?.mainText?.text || p.text?.text || '',
        secondary: p.structuredFormat?.secondaryText?.text || '',
      })),
    error: null,
  }
}

export function autocompleteCities(input) {
  return autocomplete(input, { types: ['locality'] })
}

// No type filter: matches hotels by name AND street addresses (Airbnbs,
// rentals, a friend's house), biased toward the chosen city.
export function autocompleteStays(input, biasCenter) {
  return autocomplete(input, { biasCenter })
}

// Nearby search for a category of places. Returns { items, error }.
const PLACE_FIELDS = [
  'places.id',
  'places.displayName',
  'places.types',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.location',
  'places.photos',
  'places.currentOpeningHours.openNow',
  'places.googleMapsUri',
  'places.shortFormattedAddress',
].join(',')

export async function searchPlaces({ center, types, radius = 5000, max = 15 }) {
  if (!KEY) return { items: [], error: null }
  let res
  try {
    res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': PLACE_FIELDS,
      },
      body: JSON.stringify({
        includedTypes: types,
        maxResultCount: max,
        rankPreference: 'POPULARITY',
        locationRestriction: { circle: { center, radius } },
      }),
    })
  } catch (e) {
    return { items: [], error: 'Network problem reaching Google: ' + e.message }
  }
  if (!res.ok) {
    const text = await res.text()
    console.error('Places searchNearby failed:', res.status, text)
    let msg = ''
    try {
      msg = JSON.parse(text).error?.message || ''
    } catch {
      msg = text
    }
    return {
      items: [],
      error: 'Google said no (' + res.status + '): ' + msg.slice(0, 200),
    }
  }
  const data = await res.json()
  return {
    items: (data.places || []).map((p) => ({
      id: p.id,
      name: p.displayName?.text || '',
      rating: p.rating ?? null,
      ratingCount: p.userRatingCount ?? 0,
      priceLevel: p.priceLevel || null,
      openNow: p.currentOpeningHours?.openNow ?? null,
      address: p.shortFormattedAddress || '',
      mapsUri: p.googleMapsUri || '',
      photoName: p.photos?.[0]?.name || null,
      lat: p.location?.latitude ?? null,
      lng: p.location?.longitude ?? null,
    })),
    error: null,
  }
}

export function photoUrl(photoName, maxWidth = 300) {
  if (!photoName || !KEY) return ''
  return (
    'https://places.googleapis.com/v1/' +
    photoName +
    '/media?key=' +
    KEY +
    '&maxWidthPx=' +
    maxWidth
  )
}

export async function placeLocation(placeId) {
  if (!KEY) return null
  const res = await fetch(
    'https://places.googleapis.com/v1/places/' + placeId + '?fields=location',
    { headers: { 'X-Goog-Api-Key': KEY } },
  )
  if (!res.ok) {
    console.error('Place details failed:', res.status, await res.text())
    return null
  }
  const data = await res.json()
  return data.location || null
}
