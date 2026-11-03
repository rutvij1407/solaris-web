'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/lib/store'
import type { Flight, Earthquake, Satellite } from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

function makePlaneImageData(): { width: number; height: number; data: Uint8Array } {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.save()
  ctx.translate(16, 16)
  ctx.fillStyle = '#00d4aa'

  // Fuselage
  ctx.beginPath()
  ctx.ellipse(0, 0, 2.2, 11, 0, 0, Math.PI * 2)
  ctx.fill()

  // Nose tip
  ctx.beginPath()
  ctx.moveTo(0, -13)
  ctx.lineTo(-1.5, -10)
  ctx.lineTo(1.5, -10)
  ctx.closePath()
  ctx.fill()

  // Main wings (swept)
  ctx.beginPath()
  ctx.moveTo(-1.5, -1)
  ctx.lineTo(-13, 6)
  ctx.lineTo(-9, 8)
  ctx.lineTo(-1.5, 4)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(1.5, -1)
  ctx.lineTo(13, 6)
  ctx.lineTo(9, 8)
  ctx.lineTo(1.5, 4)
  ctx.closePath()
  ctx.fill()

  // Horizontal stabilizer
  ctx.beginPath()
  ctx.moveTo(-1, 8)
  ctx.lineTo(-6, 12)
  ctx.lineTo(-4, 13)
  ctx.lineTo(-1, 10)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(1, 8)
  ctx.lineTo(6, 12)
  ctx.lineTo(4, 13)
  ctx.lineTo(1, 10)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
  const imgData = ctx.getImageData(0, 0, size, size)
  return { width: size, height: size, data: new Uint8Array(imgData.data) }
}

// --- Solar / terminator helpers ---
function getSubsolarPoint(): { lat: number; lon: number } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0))
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  const utcH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600
  const decl = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81))
  return { lat: decl, lon: (12 - utcH) * 15 }
}

function buildTerminator(): [number, number][] {
  const { lat, lon } = getSubsolarPoint()
  const φ = (lat * Math.PI) / 180
  const λ = (lon * Math.PI) / 180
  const pts: [number, number][] = []
  for (let az = 0; az <= 360; az++) {
    const a = (az * Math.PI) / 180
    const sinLat = Math.cos(φ) * Math.cos(a)
    const latR = Math.asin(Math.max(-1, Math.min(1, sinLat)))
    const dLon = Math.atan2(Math.sin(a) * Math.cos(φ), -Math.sin(φ) * sinLat)
    let lonD = ((λ + dLon) * 180) / Math.PI
    while (lonD > 180) lonD -= 360
    while (lonD < -180) lonD += 360
    pts.push([lonD, (latR * 180) / Math.PI])
  }
  return pts
}

function getNightFillGeoJSON() {
  const ring = buildTerminator()
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [[...ring].reverse()] },
    properties: {},
  }
}

function getTerminatorLineGeoJSON() {
  const pts = buildTerminator()
  const segs: [number, number][][] = []
  let cur: [number, number][] = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i][0] - pts[i - 1][0]) > 180) {
      if (cur.length > 1) segs.push(cur)
      cur = [pts[i]]
    } else { cur.push(pts[i]) }
  }
  if (cur.length > 1) segs.push(cur)
  return {
    type: 'Feature' as const,
    geometry: { type: 'MultiLineString' as const, coordinates: segs },
    properties: {},
  }
}

// --- Satellite orbit track helpers ---
function generateOrbitTrack(line2: string): [number, number][][] {
  const incl = parseFloat(line2.substring(8, 16).trim()) * (Math.PI / 180)
  const raan = parseFloat(line2.substring(17, 25).trim()) * (Math.PI / 180)
  if (isNaN(incl) || isNaN(raan)) return []

  const all: [number, number][] = []
  for (let i = 0; i <= 360; i += 4) {
    const θ = (i * Math.PI) / 180
    const cosθ = Math.cos(θ), sinθ = Math.sin(θ)
    const yi = sinθ * Math.cos(incl)
    const zi = sinθ * Math.sin(incl)
    const xr = cosθ * Math.cos(raan) - yi * Math.sin(raan)
    const yr = cosθ * Math.sin(raan) + yi * Math.cos(raan)
    const lat = (Math.asin(Math.max(-1, Math.min(1, zi))) * 180) / Math.PI
    const lon = (Math.atan2(yr, xr) * 180) / Math.PI
    all.push([lon, lat])
  }

  const segs: [number, number][][] = []
  let cur: [number, number][] = [all[0]]
  for (let i = 1; i < all.length; i++) {
    if (Math.abs(all[i][0] - all[i - 1][0]) > 180) {
      if (cur.length > 1) segs.push(cur)
      cur = [all[i]]
    } else { cur.push(all[i]) }
  }
  if (cur.length > 1) segs.push(cur)
  return segs
}

function altToZoom(altMeters: number): number {
  return Math.max(2, Math.min(20, Math.log2(40000000 / Math.max(altMeters, 500))))
}

interface GeocodingFeature {
  id: string
  place_name: string
  center: [number, number]
}

export default function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const fetchIntervalsRef = useRef<ReturnType<typeof setInterval>[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingFeature[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    activeLayers,
    flights, satellites, earthquakes,
    selectedLandmark,
    selectedWeatherLayer,
    setCamera,
    setFlights, setSatellites, setEarthquakes,
    setLoadingFlights, setLoadingSatellites, setLoadingEarthquakes,
    is2DMode,
  } = useStore()

  const fetchFlights = useCallback(async () => {
    setLoadingFlights(true)
    try {
      const res = await fetch('/api/flights')
      const data = await res.json()
      setFlights(data.flights ?? [], data.error ?? null)
    } catch (e: any) {
      setFlights([], e.message)
    }
  }, [setFlights, setLoadingFlights])

  const fetchEarthquakes = useCallback(async () => {
    setLoadingEarthquakes(true)
    try {
      const res = await fetch('/api/earthquakes')
      const data = await res.json()
      setEarthquakes(data.earthquakes ?? [], data.error ?? null)
    } catch (e: any) {
      setEarthquakes([], e.message)
    }
  }, [setEarthquakes, setLoadingEarthquakes])

  const fetchSatellites = useCallback(async () => {
    setLoadingSatellites(true)
    try {
      const res = await fetch('/api/satellites')
      const data = await res.json()
      setSatellites(data.satellites ?? [], data.error ?? null)
    } catch (e: any) {
      setSatellites([], e.message)
    }
  }, [setSatellites, setLoadingSatellites])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!query.trim()) { setSearchResults([]); setShowResults(false); return }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Place search uses OpenStreetMap Nominatim, which needs no API key.
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
        )
        const raw: { place_id: number; display_name: string; lon: string; lat: string }[] = await res.json()
        const data = {
          features: raw.map((r) => ({
            id: String(r.place_id),
            place_name: r.display_name,
            center: [parseFloat(r.lon), parseFloat(r.lat)] as [number, number],
          })),
        }
        setSearchResults(data.features ?? [])
        setShowResults(true)
      } catch { setSearchResults([]) }
    }, 300)
  }, [])

  const flyToResult = useCallback((feature: GeocodingFeature) => {
    const map = mapRef.current
    if (!map) return
    map.flyTo({ center: feature.center, zoom: 12, duration: 2000, essential: true })
    setSearchQuery(feature.place_name)
    setShowResults(false)
    setSearchResults([])
  }, [])

  // Initialize Mapbox
  useEffect(() => {
    if (!containerRef.current) return

    // No tokens needed: Esri World Imagery tiles on a MapLibre globe.
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        projection: { type: 'globe' },
        sources: {
          imagery: {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            maxzoom: 19,
            attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
          },
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#050510' } },
          { id: 'imagery', type: 'raster', source: 'imagery' },
        ],
      } as any,
      center: [-77.0369, 38.9072],
      zoom: 3,
      maxZoom: 18,
      attributionControl: { compact: true },
    })

    mapRef.current = map

    map.on('load', () => {
      // Space atmosphere
      try {
        ;(map as any).setSky?.({
          'sky-color': '#050510',
          'horizon-color': '#0a0a2a',
          'fog-color': '#0a0a0a',
          'sky-horizon-blend': 0.5,
          'horizon-fog-blend': 0.5,
          'fog-ground-blend': 0.2,
          'atmosphere-blend': 0.8,
        })
      } catch { /* sky is optional */ }

      // Plane icon
      const plane = makePlaneImageData()
      map.addImage('plane', plane)

      // GeoJSON sources
      map.addSource('flights-src', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addSource('earthquakes-src', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addSource('satellites-src', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

      // Flights layer
      map.addLayer({
        id: 'flights-layer',
        type: 'symbol',
        source: 'flights-src',
        layout: {
          'icon-image': 'plane',
          'icon-size': 0.7,
          'icon-rotate': ['get', 'heading'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'visibility': 'none',
        },
      })

      // Earthquake circles
      map.addLayer({
        id: 'earthquakes-layer',
        type: 'circle',
        source: 'earthquakes-src',
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'magnitude'], 2, 6, 5, 14, 7, 22, 9, 30],
          'circle-color': [
            'case',
            ['>=', ['get', 'magnitude'], 7], '#ff0000',
            ['>=', ['get', 'magnitude'], 5], '#ff6600',
            ['>=', ['get', 'magnitude'], 3], '#ffaa00',
            '#00ff88',
          ],
          'circle-opacity': 0.55,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': [
            'case',
            ['>=', ['get', 'magnitude'], 7], '#ff0000',
            ['>=', ['get', 'magnitude'], 5], '#ff6600',
            ['>=', ['get', 'magnitude'], 3], '#ffaa00',
            '#00ff88',
          ],
          'circle-stroke-opacity': 0.9,
        },
      })

      // Satellite dots
      map.addLayer({
        id: 'satellites-layer',
        type: 'circle',
        source: 'satellites-src',
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius': 3,
          'circle-color': '#00d4aa',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#00d4aa',
          'circle-stroke-opacity': 0.3,
        },
      })

      // Satellite orbit tracks
      map.addSource('orbits-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: 'orbits-layer',
        type: 'line',
        source: 'orbits-src',
        layout: { 'visibility': 'none' },
        paint: {
          'line-color': '#00d4aa',
          'line-opacity': 0.18,
          'line-width': 0.8,
        },
      })

      // Day/Night fill
      map.addSource('night-fill-src', {
        type: 'geojson',
        data: getNightFillGeoJSON(),
      })
      map.addLayer({
        id: 'night-fill-layer',
        type: 'fill',
        source: 'night-fill-src',
        layout: { 'visibility': 'none' },
        paint: {
          'fill-color': '#000820',
          'fill-opacity': 0.45,
        },
      })

      // Terminator line
      map.addSource('terminator-src', {
        type: 'geojson',
        data: getTerminatorLineGeoJSON(),
      })
      map.addLayer({
        id: 'terminator-layer',
        type: 'line',
        source: 'terminator-src',
        layout: { 'visibility': 'none' },
        paint: {
          'line-color': '#ffcc00',
          'line-opacity': 0.7,
          'line-width': 1.5,
          'line-dasharray': [4, 3],
        },
      })

      setMapLoaded(true)
    })

    map.on('move', () => {
      const c = map.getCenter()
      setCamera({
        latitude: c.lat,
        longitude: c.lng,
        altitude: Math.pow(2, 20 - map.getZoom()) * 100,
        heading: map.getBearing(),
      })
    })

    return () => {
      fetchIntervalsRef.current.forEach(clearInterval)
      fetchIntervalsRef.current = []
      setMapLoaded(false)
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2D / 3D toggle
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    ;(map as any).setProjection({ type: is2DMode ? 'mercator' : 'globe' })
  }, [is2DMode, mapLoaded])

  // Data fetching intervals
  useEffect(() => {
    fetchIntervalsRef.current.forEach(clearInterval)
    fetchIntervalsRef.current = []

    if (activeLayers.includes('flights')) {
      fetchFlights()
      fetchIntervalsRef.current.push(setInterval(fetchFlights, APP_CONFIG.flightRefreshMs))
    }
    if (activeLayers.includes('earthquakes')) {
      fetchEarthquakes()
      fetchIntervalsRef.current.push(setInterval(fetchEarthquakes, APP_CONFIG.earthquakeRefreshMs))
    }
    if (activeLayers.includes('satellites')) {
      fetchSatellites()
      fetchIntervalsRef.current.push(setInterval(fetchSatellites, APP_CONFIG.satelliteRefreshMs))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayers])

  // Render flights
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const visible = activeLayers.includes('flights')
    map.setLayoutProperty('flights-layer', 'visibility', visible ? 'visible' : 'none')
    if (!visible) return
    ;(map.getSource('flights-src') as maplibregl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: flights
        .filter((f: Flight) => f.longitude != null && f.latitude != null)
        .map((f: Flight) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [f.longitude, f.latitude] },
          properties: { id: f.id, heading: f.heading ?? 0 },
        })),
    })
  }, [flights, activeLayers, mapLoaded])

  // Render earthquakes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const visible = activeLayers.includes('earthquakes')
    map.setLayoutProperty('earthquakes-layer', 'visibility', visible ? 'visible' : 'none')
    if (!visible) return
    ;(map.getSource('earthquakes-src') as maplibregl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: earthquakes
        .filter((eq: Earthquake) => eq.longitude != null && eq.latitude != null)
        .map((eq: Earthquake) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [eq.longitude, eq.latitude] },
          properties: { id: eq.id, magnitude: eq.magnitude },
        })),
    })
  }, [earthquakes, activeLayers, mapLoaded])

  // Render satellites
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const visible = activeLayers.includes('satellites')
    map.setLayoutProperty('satellites-layer', 'visibility', visible ? 'visible' : 'none')
    if (!visible) return
    ;(map.getSource('satellites-src') as maplibregl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: satellites
        .filter((s: Satellite) => s.longitude != null && s.latitude != null)
        .map((s: Satellite) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
          properties: { id: s.id, name: s.name },
        })),
    })
  }, [satellites, activeLayers, mapLoaded])

  // Satellite orbit tracks
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const visible = activeLayers.includes('satellites')
    map.setLayoutProperty('orbits-layer', 'visibility', visible ? 'visible' : 'none')
    if (!visible || satellites.length === 0) return

    const features: any[] = []
    satellites.forEach((s: Satellite) => {
      if (!s.line2) return
      const segs = generateOrbitTrack(s.line2)
      segs.forEach((coords) => {
        features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} })
      })
    })
    ;(map.getSource('orbits-src') as maplibregl.GeoJSONSource)?.setData({
      type: 'FeatureCollection', features,
    })
  }, [satellites, activeLayers, mapLoaded])

  // Day / Night terminator
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const visible = activeLayers.includes('daynight')
    map.setLayoutProperty('night-fill-layer', 'visibility', visible ? 'visible' : 'none')
    map.setLayoutProperty('terminator-layer', 'visibility', visible ? 'visible' : 'none')
    if (!visible) return

    const updateTerminator = () => {
      ;(map.getSource('night-fill-src') as maplibregl.GeoJSONSource)?.setData(getNightFillGeoJSON())
      ;(map.getSource('terminator-src') as maplibregl.GeoJSONSource)?.setData(getTerminatorLineGeoJSON())
    }
    updateTerminator()
    const id = setInterval(updateTerminator, 60000)
    return () => clearInterval(id)
  }, [activeLayers, mapLoaded])

  // Weather layer
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    if (map.getLayer('weather-layer')) map.removeLayer('weather-layer')
    if (map.getSource('weather-src')) map.removeSource('weather-src')
    if (!activeLayers.includes('weather')) return

    const addWeather = async () => {
      try {
        let tileUrl = ''
        if (selectedWeatherLayer === 'rain') {
          const d = await fetch('https://api.rainviewer.com/public/weather-maps.json').then((r) => r.json())
          const t = d.radar.past[d.radar.past.length - 1].time
          tileUrl = `https://tilecache.rainviewer.com/v2/radar/${t}/256/{z}/{x}/{y}/4/1_1.png`
        } else if (selectedWeatherLayer === 'clouds') {
          tileUrl = `https://tilecache.rainviewer.com/v2/coverage/0/256/{z}/{x}/{y}/4/1_1.png`
        } else {
          const d = await fetch('https://api.rainviewer.com/public/weather-maps.json').then((r) => r.json())
          const frames = d.satellite?.infrared
          if (!frames?.length) return
          tileUrl = `https://tilecache.rainviewer.com/v2/satellite/infrared/${frames[frames.length - 1].time}/256/{z}/{x}/{y}/4/1_1.png`
        }
        map.addSource('weather-src', { type: 'raster', tiles: [tileUrl], tileSize: 256 })
        map.addLayer({ id: 'weather-layer', type: 'raster', source: 'weather-src', paint: { 'raster-opacity': 0.75 } })
      } catch { /* silent */ }
    }
    addWeather()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayers, selectedWeatherLayer, mapLoaded])

  // Fly to landmark
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedLandmark) return
    map.flyTo({
      center: [selectedLandmark.longitude, selectedLandmark.latitude],
      zoom: altToZoom(selectedLandmark.zoomAltitude),
      duration: 2500,
      essential: true,
    })
  }, [selectedLandmark])

  return (
    <div className="relative w-full h-full" style={{ background: '#0a0a0a' }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Search bar */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          width: 320,
          fontFamily: 'Menlo, monospace',
        }}
      >
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: '#00d4aa', fontSize: 13, pointerEvents: 'none',
          }}>⌕</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            placeholder="Search address, city, country..."
            style={{
              width: '100%',
              background: 'rgba(10,10,10,0.92)',
              border: '1px solid rgba(0,212,170,0.5)',
              borderRadius: 4,
              color: '#00d4aa',
              fontSize: 11,
              padding: '8px 10px 8px 28px',
              outline: 'none',
              letterSpacing: '0.5px',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false) }}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(0,212,170,0.5)', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 14, lineHeight: 1,
              }}
            >×</button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div style={{
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(0,212,170,0.3)',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            overflow: 'hidden',
          }}>
            {searchResults.map((feature) => (
              <button
                key={feature.id}
                onMouseDown={() => flyToResult(feature)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(0,212,170,0.1)',
                  color: '#00d4aa',
                  fontSize: 10,
                  cursor: 'pointer',
                  fontFamily: 'Menlo, monospace',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,212,170,0.1)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent' }}
              >
                {feature.place_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
