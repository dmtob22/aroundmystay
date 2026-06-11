// Walking/driving times via Google Routes API (same key as Places).
// Rideshare prices are OUR estimate — Uber/Lyft closed their public pricing
// APIs years ago, so we approximate from national average rates and label it.
const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

async function computeRoute(origin, dest, mode) {
  const res = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: { latLng: { latitude: dest.lat, longitude: dest.lng } },
        },
        travelMode: mode,
      }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    console.error('Routes failed:', res.status, text)
    let msg = ''
    try {
      msg = JSON.parse(text).error?.message || ''
    } catch {
      msg = text
    }
    throw new Error('(' + res.status + ') ' + msg.slice(0, 160))
  }
  const data = await res.json()
  const r = data.routes?.[0]
  if (!r) return null
  return {
    minutes: Math.max(1, Math.round(parseInt(r.duration) / 60)),
    miles: r.distanceMeters / 1609.34,
  }
}

export async function travelTimes(origin, dest) {
  if (!KEY || !origin || dest.lat == null) {
    return { walk: null, drive: null, error: null }
  }
  try {
    const [walk, drive] = await Promise.all([
      computeRoute(origin, dest, 'WALK'),
      computeRoute(origin, dest, 'DRIVE'),
    ])
    return { walk, drive, error: null }
  } catch (e) {
    return { walk: null, drive: null, error: e.message }
  }
}

// Rough Uber/Lyft fare from drive time + distance (national-average rates:
// pickup/booking fees + per-mile + per-minute, with a typical surge spread).
export function rideEstimate(drive) {
  if (!drive) return null
  const base = 4 + 1.15 * drive.miles + 0.35 * drive.minutes
  return {
    low: Math.max(8, Math.round(base * 0.85)),
    high: Math.max(11, Math.round(base * 1.3)),
  }
}
