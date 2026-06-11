import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    background: 'rgba(15,23,42,0.97)',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    zIndex: 1000,
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
  titleWrap: { textAlign: 'left', minWidth: 0 },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f1f5f9',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sub: { fontSize: 12.5, color: '#94a3b8' },
  map: { flex: 1, minHeight: 0 },
}

function pinIcon(emoji, isHome) {
  const size = isHome ? 44 : 34
  return L.divIcon({
    className: '',
    html:
      '<div style="display:flex;align-items:center;justify-content:center;' +
      'width:' + size + 'px;height:' + size + 'px;border-radius:50% 50% 50% 4px;' +
      'transform:rotate(0deg);font-size:' + (isHome ? 22 : 17) + 'px;' +
      'background:' + (isHome ? '#0d9488' : '#0f172a') + ';' +
      'border:2px solid ' + (isHome ? '#5eead4' : 'rgba(255,255,255,0.55)') + ';' +
      'box-shadow:0 3px 10px rgba(0,0,0,0.45)">' + emoji + '</div>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

function popupNode(item) {
  const root = document.createElement('div')
  root.style.cssText = 'min-width:180px;font-size:14px;line-height:1.45'
  const name = document.createElement('div')
  name.style.cssText = 'font-weight:700;margin-bottom:2px'
  name.textContent = item.name
  root.appendChild(name)
  if (item.meta) {
    const meta = document.createElement('div')
    meta.style.cssText = 'color:#475569;font-size:13px'
    meta.textContent = item.meta
    root.appendChild(meta)
  }
  if (item.link) {
    const a = document.createElement('a')
    a.href = item.link
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.textContent = item.linkLabel || 'Open ↗'
    a.style.cssText =
      'display:inline-block;margin-top:6px;font-weight:700;color:#0d9488'
    root.appendChild(a)
  }
  return root
}

// items: [{id, name, lat, lng, emoji, meta, link, linkLabel}]
export default function MapView({ center, homeName, items, onBack }) {
  const mapEl = useRef(null)

  useEffect(() => {
    const map = L.map(mapEl.current, { zoomControl: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const home = L.marker([center.latitude, center.longitude], {
      icon: pinIcon('🏠', true),
      zIndexOffset: 1000,
    }).addTo(map)
    home.bindPopup(
      popupNode({ name: homeName, meta: 'Your home base for this trip' }),
    )

    const bounds = [[center.latitude, center.longitude]]
    for (const item of items) {
      if (item.lat == null || item.lng == null) continue
      const m = L.marker([item.lat, item.lng], {
        icon: pinIcon(item.emoji, false),
      }).addTo(map)
      m.bindPopup(popupNode(item))
      bounds.push([item.lat, item.lng])
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
    } else {
      map.setView([center.latitude, center.longitude], 14)
    }

    return () => map.remove()
  }, [center, homeName, items])

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          ← Results
        </button>
        <div style={styles.titleWrap}>
          <div style={styles.title}>🗺️ Around {homeName}</div>
          <div style={styles.sub}>
            {items.length === 0
              ? 'Star ☆ picks on the results list to add pins here'
              : items.length +
                ' pick' +
                (items.length === 1 ? '' : 's') +
                ' · tap a pin for details'}
          </div>
        </div>
      </div>
      <div ref={mapEl} style={styles.map} />
    </div>
  )
}
