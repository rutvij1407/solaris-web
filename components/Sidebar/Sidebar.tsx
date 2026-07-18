'use client'

import { useStore } from '@/lib/store'
import { DATA_LAYERS, VISUAL_MODES, CITY_PRESETS } from '@/lib/constants'
import type { DataLayerType, VisualMode } from '@/lib/types'

export default function Sidebar() {
  const {
    activeLayers,
    toggleLayer,
    visualMode,
    setVisualMode,
    setSidebarExpanded,
    flights, satellites, earthquakes, weatherRadars,
    flightsUpdated, satellitesUpdated, earthquakesUpdated,
    loadingFlights, loadingSatellites, loadingEarthquakes,
    isPanopticActive,
    detectionCount,
    togglePanoptic,
    selectedWeatherLayer,
    setWeatherLayer,
  } = useStore()

  const getCount = (id: DataLayerType): number => {
    switch (id) {
      case 'flights': return flights.length
      case 'satellites': return satellites.length
      case 'earthquakes': return earthquakes.length
      case 'weather': return weatherRadars.length
      default: return 0
    }
  }

  const getLoading = (id: DataLayerType): boolean => {
    switch (id) {
      case 'flights': return loadingFlights
      case 'satellites': return loadingSatellites
      case 'earthquakes': return loadingEarthquakes
      default: return false
    }
  }

  const getLastUpdate = (id: DataLayerType): string => {
    let ts: number | null = null
    if (id === 'flights') ts = flightsUpdated
    else if (id === 'satellites') ts = satellitesUpdated
    else if (id === 'earthquakes') ts = earthquakesUpdated
    if (!ts) return 'never'
    const diff = Math.floor((Date.now() - ts) / 1000)
    return diff < 60 ? `${diff}s ago` : `${Math.floor(diff / 60)}m ago`
  }

  const fmtCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`)

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: '#0a0a0a', color: '#66ffcc', fontFamily: 'Menlo, monospace' }}
    >
      {/* Sidebar header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(0,212,170,0.3)', background: '#111111' }}
      >
        <span style={{ color: '#00d4aa', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
          DATA LAYERS
        </span>
        <button
          onClick={() => setSidebarExpanded(false)}
          style={{ color: '#00d4aa', fontSize: 14, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none' }}
          title="Collapse sidebar"
        >
          ‹
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* Data layer toggles */}
        <div className="py-2">
          {DATA_LAYERS.map((layer) => {
            const active = activeLayers.includes(layer.id)
            const count = getCount(layer.id)
            const loading = getLoading(layer.id)
            const updated = getLastUpdate(layer.id)

            return (
              <div
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors"
                style={{
                  background: active ? 'rgba(0,212,170,0.08)' : 'transparent',
                  borderBottom: '1px solid rgba(0,212,170,0.07)',
                }}
              >
                {/* Icon */}
                <span style={{ fontSize: 14, width: 20, textAlign: 'center', opacity: active ? 1 : 0.4 }}>
                  {layer.icon}
                </span>

                {/* Label + source */}
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 10, color: active ? '#00ff88' : 'rgba(0,212,170,0.5)', letterSpacing: 0.5 }}>
                    {layer.label}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(0,212,170,0.4)', marginTop: 1 }}>
                    {layer.source} · {loading ? 'fetching…' : updated}
                  </div>
                </div>

                {/* Count badge */}
                {count > 0 && (
                  <span style={{ fontSize: 10, color: '#00d4aa', marginRight: 6 }}>
                    {fmtCount(count)}
                  </span>
                )}

                {/* Toggle pill */}
                <span
                  style={{
                    fontSize: 9,
                    padding: '3px 7px',
                    border: `1px solid ${active ? '#00d4aa' : 'rgba(0,212,170,0.3)'}`,
                    borderRadius: 3,
                    color: active ? '#00d4aa' : 'rgba(0,212,170,0.4)',
                    letterSpacing: 1,
                    flexShrink: 0,
                  }}
                >
                  {active ? 'ON' : 'OFF'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Weather sub-picker (visible when weather is active) */}
        {activeLayers.includes('weather') && (
          <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(0,212,170,0.15)' }}>
            <div style={{ fontSize: 8, color: 'rgba(0,212,170,0.5)', letterSpacing: 1, marginBottom: 6 }}>
              WEATHER MODE
            </div>
            <div className="flex gap-2">
              {(['rain', 'clouds', 'temperature'] as const).map((wl) => (
                <button
                  key={wl}
                  onClick={() => setWeatherLayer(wl)}
                  style={{
                    fontSize: 8,
                    padding: '3px 8px',
                    border: `1px solid ${selectedWeatherLayer === wl ? '#00d4aa' : 'rgba(0,212,170,0.3)'}`,
                    borderRadius: 3,
                    background: selectedWeatherLayer === wl ? '#00d4aa' : 'transparent',
                    color: selectedWeatherLayer === wl ? '#0a0a0a' : 'rgba(0,212,170,0.7)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontFamily: 'Menlo, monospace',
                  }}
                >
                  {wl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,212,170,0.2)', margin: '4px 0' }} />

        {/* City presets */}
        <div className="px-4 py-3">
          <div style={{ fontSize: 8, color: 'rgba(0,212,170,0.5)', letterSpacing: 2, marginBottom: 8 }}>
            LOCATIONS
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <CityButtons />
          </div>
          <LandmarkButtons />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,212,170,0.2)', margin: '4px 0' }} />

        {/* Visual mode presets */}
        <div className="px-4 py-3">
          <div style={{ fontSize: 8, color: 'rgba(0,212,170,0.5)', letterSpacing: 2, marginBottom: 8 }}>
            STYLE PRESETS
          </div>
          <div className="flex flex-wrap gap-2">
            {VISUAL_MODES.map((m) => (
              <button
                key={m.id}
                className="mode-btn"
                style={{
                  background: visualMode === m.id ? '#00d4aa' : 'transparent',
                  color: visualMode === m.id ? '#0a0a0a' : '#00d4aa',
                  borderColor: '#00d4aa',
                }}
                onClick={() => setVisualMode(m.id as VisualMode)}
                title={m.label}
              >
                <span style={{ fontSize: 16 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,212,170,0.2)', margin: '4px 0' }} />

        {/* PANOPTIC AI */}
        <div className="px-4 py-3">
          <div style={{ fontSize: 8, color: 'rgba(0,212,170,0.5)', letterSpacing: 2, marginBottom: 8 }}>
            AI DETECTION
          </div>
          <button
            onClick={togglePanoptic}
            className="w-full flex items-center gap-2 px-3 py-2 transition-all"
            style={{
              border: '1px solid #00d4aa',
              borderRadius: 4,
              background: isPanopticActive ? '#00d4aa' : 'transparent',
              color: isPanopticActive ? '#0a0a0a' : '#00d4aa',
              cursor: 'pointer',
              fontFamily: 'Menlo, monospace',
              fontSize: 10,
              letterSpacing: 1,
            }}
          >
            <span style={{ fontSize: 14 }}>👁</span>
            <span className="flex-1 text-left font-bold">PANOPTIC</span>
            <span>{isPanopticActive ? 'ACTIVE' : 'STANDBY'}</span>
          </button>
          {isPanopticActive && (
            <div className="flex gap-4 mt-2 px-1">
              <div>
                <div style={{ fontSize: 7, color: 'rgba(0,212,170,0.5)', letterSpacing: 1 }}>DETECTIONS</div>
                <div style={{ fontSize: 13, color: '#00d4aa', fontWeight: 700 }}>{detectionCount}</div>
              </div>
              <div>
                <div style={{ fontSize: 7, color: 'rgba(0,212,170,0.5)', letterSpacing: 1 }}>LATENCY</div>
                <div style={{ fontSize: 13, color: '#00d4aa', fontWeight: 700 }}>42ms</div>
              </div>
              <div>
                <div style={{ fontSize: 7, color: 'rgba(0,212,170,0.5)', letterSpacing: 1 }}>DENSITY</div>
                <div style={{ fontSize: 13, color: '#00d4aa', fontWeight: 700 }}>3.2/f</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar footer */}
      <div
        className="px-4 py-2"
        style={{ borderTop: '1px solid rgba(0,212,170,0.2)', background: '#0a0a0a' }}
      >
        <div style={{ fontSize: 7, color: 'rgba(0,212,170,0.4)', letterSpacing: 1 }}>
          ALL DATA FROM PUBLIC APIS · NO KEY REQUIRED
        </div>
      </div>
    </div>
  )
}

function CityButtons() {
  const { currentCity, selectCity, selectLandmark } = useStore()

  return (
    <>
      {CITY_PRESETS.map((city: any) => (
        <button
          key={city.id}
          className="city-btn"
          style={{
            background: currentCity.id === city.id ? '#00d4aa' : 'transparent',
            color: currentCity.id === city.id ? '#0a0a0a' : '#00d4aa',
          }}
          onClick={() => {
            selectCity(city)
            selectLandmark({
              id: city.id,
              name: city.name,
              latitude: city.latitude,
              longitude: city.longitude,
              zoomAltitude: city.defaultAltitude,
            })
          }}
        >
          {city.name}
        </button>
      ))}
    </>
  )
}

function LandmarkButtons() {
  const { currentCity, selectLandmark, selectedLandmark } = useStore()
  if (!currentCity?.landmarks?.length) return null

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {currentCity.landmarks.map((lm: any) => (
        <button
          key={lm.id}
          onClick={() => selectLandmark(lm)}
          style={{
            fontSize: 8,
            padding: '2px 7px',
            border: `1px solid ${selectedLandmark?.id === lm.id ? '#00d4aa' : 'rgba(0,212,170,0.25)'}`,
            borderRadius: 3,
            background: selectedLandmark?.id === lm.id ? 'rgba(0,212,170,0.15)' : 'transparent',
            color: selectedLandmark?.id === lm.id ? '#00d4aa' : 'rgba(0,212,170,0.6)',
            cursor: 'pointer',
            fontFamily: 'Menlo, monospace',
            letterSpacing: 0.5,
          }}
        >
          {lm.name}
        </button>
      ))}
    </div>
  )
}
