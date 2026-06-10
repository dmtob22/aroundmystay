// Talks to Google Places (New). The API key lives ONLY in the git-ignored
// .env file as VITE_GOOGLE_MAPS_API_KEY — never in this code.
const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export function hasKey() {
  return Boolean(KEY)
}

async function autocomplete(input, { types, biasCenter } = {}) {
  if (!KEY || !input.trim()) return []
  const body = { input }
  if (types) body.includedPrimaryTypes = types
  if (biasCenter) {
    // Prefer results near the chosen city (30 km circle).
    body.locationBias = { circle: { center: biasCenter, radius: 30000 } }
  }
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.error('Places autocomplete failed:', res.status, await res.text())
    return []
  }
  const data = await res.json()
  return (data.suggestions || [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .map((p) => ({
      placeId: p.placeId,
      main: p.structuredFormat?.mainText?.text || p.text?.text || '',
      secondary: p.structuredFormat?.secondaryText?.text || '',
    }))
}

export function autocompleteCities(input) {
  return autocomplete(input, { types: ['locality'] })
}

export function autocompleteHotels(input, biasCenter) {
  return autocomplete(input, { types: ['lodging'], biasCenter })
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
