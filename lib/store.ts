import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Flight,
  Earthquake,
  Satellite,
  WeatherRadar,
  VisualMode,
  DataLayerType,
  WeatherLayerType,
  CityPreset,
  Landmark,
  CameraState,
} from './types'
import { CITY_PRESETS } from './constants'

interface SolarisState {
  // UI state
  isSidebarExpanded: boolean
  visualMode: VisualMode
  selectedWeatherLayer: WeatherLayerType
  is2DMode: boolean

  // City / landmark
  currentCity: CityPreset
  selectedLandmark: Landmark | null

  // Active data layers
  activeLayers: DataLayerType[]

  // Live data
  flights: Flight[]
  satellites: Satellite[]
  earthquakes: Earthquake[]
  weatherRadars: WeatherRadar[]

  // Loading states
  loadingFlights: boolean
  loadingSatellites: boolean
  loadingEarthquakes: boolean
  loadingWeather: boolean

  // Error states
  flightsError: string | null
  satellitesError: string | null
  earthquakesError: string | null

  // Last update timestamps
  flightsUpdated: number | null
  satellitesUpdated: number | null
  earthquakesUpdated: number | null

  // Camera state (synced from globe)
  camera: CameraState

  // PANOPTIC AI
  isPanopticActive: boolean
  detectionCount: number

  // Actions — UI
  setSidebarExpanded: (v: boolean) => void
  toggleSidebar: () => void
  setVisualMode: (mode: VisualMode) => void
  setWeatherLayer: (layer: WeatherLayerType) => void
  set2DMode: (v: boolean) => void

  // Actions — city / landmark
  selectCity: (city: CityPreset) => void
  selectLandmark: (landmark: Landmark) => void

  // Actions — layers
  toggleLayer: (layer: DataLayerType) => void
  isLayerActive: (layer: DataLayerType) => boolean

  // Actions — data
  setFlights: (flights: Flight[], error?: string | null) => void
  setSatellites: (satellites: Satellite[], error?: string | null) => void
  setEarthquakes: (earthquakes: Earthquake[], error?: string | null) => void
  setWeatherRadars: (radars: WeatherRadar[]) => void
  setLoadingFlights: (v: boolean) => void
  setLoadingSatellites: (v: boolean) => void
  setLoadingEarthquakes: (v: boolean) => void

  // Actions — camera
  setCamera: (state: Partial<CameraState>) => void

  // Actions — PANOPTIC
  togglePanoptic: () => void

  // Computed helpers
  formattedAltitude: () => string
  formattedCoordinates: () => string
  mgrsCoordinates: () => string
  gsdValue: () => string
  niirsValue: () => string
  utcTime: () => string
}

export const useStore = create<SolarisState>()(
  persist(
    (set, get) => ({
      // --- Initial state ---
      isSidebarExpanded: true,
      visualMode: 'normal',
      selectedWeatherLayer: 'rain',
      is2DMode: false,

      currentCity: CITY_PRESETS[0],
      selectedLandmark: null,

      activeLayers: [],

      flights: [],
      satellites: [],
      earthquakes: [],
      weatherRadars: [],

      loadingFlights: false,
      loadingSatellites: false,
      loadingEarthquakes: false,
      loadingWeather: false,

      flightsError: null,
      satellitesError: null,
      earthquakesError: null,

      flightsUpdated: null,
      satellitesUpdated: null,
      earthquakesUpdated: null,

      camera: {
        latitude: 38.9072,
        longitude: -77.0369,
        altitude: 10_000_000,
        heading: 0,
      },

      isPanopticActive: false,
      detectionCount: 0,

      // --- UI Actions ---
      setSidebarExpanded: (v) => set({ isSidebarExpanded: v }),
      toggleSidebar: () => set((s) => ({ isSidebarExpanded: !s.isSidebarExpanded })),
      setVisualMode: (mode) => set({ visualMode: mode }),
      setWeatherLayer: (layer) => set({ selectedWeatherLayer: layer }),
      set2DMode: (v) => set({ is2DMode: v }),

      // --- City / landmark ---
      selectCity: (city) => set({ currentCity: city, selectedLandmark: null }),
      selectLandmark: (landmark) => set({ selectedLandmark: landmark }),

      // --- Layers ---
      toggleLayer: (layer) =>
        set((s) => {
          const active = s.activeLayers.includes(layer)
          return {
            activeLayers: active
              ? s.activeLayers.filter((l) => l !== layer)
              : [...s.activeLayers, layer],
            // Clear data when disabling
            ...(active && layer === 'flights' ? { flights: [] } : {}),
            ...(active && layer === 'satellites' ? { satellites: [] } : {}),
            ...(active && layer === 'earthquakes' ? { earthquakes: [] } : {}),
            ...(active && layer === 'weather' ? { weatherRadars: [] } : {}),
          }
        }),
      isLayerActive: (layer) => get().activeLayers.includes(layer),

      // --- Data setters ---
      setFlights: (flights, error = null) =>
        set({ flights, flightsError: error, flightsUpdated: Date.now(), loadingFlights: false }),
      setSatellites: (satellites, error = null) =>
        set({ satellites, satellitesError: error, satellitesUpdated: Date.now(), loadingSatellites: false }),
      setEarthquakes: (earthquakes, error = null) =>
        set({ earthquakes, earthquakesError: error, earthquakesUpdated: Date.now(), loadingEarthquakes: false }),
      setWeatherRadars: (radars) => set({ weatherRadars: radars, loadingWeather: false }),
      setLoadingFlights: (v) => set({ loadingFlights: v }),
      setLoadingSatellites: (v) => set({ loadingSatellites: v }),
      setLoadingEarthquakes: (v) => set({ loadingEarthquakes: v }),

      // --- Camera ---
      setCamera: (state) => set((s) => ({ camera: { ...s.camera, ...state } })),

      // --- PANOPTIC ---
      togglePanoptic: () =>
        set((s) => ({
          isPanopticActive: !s.isPanopticActive,
          detectionCount: s.isPanopticActive ? 0 : Math.floor(Math.random() * 8) + 1,
        })),

      // --- Computed helpers ---
      formattedAltitude: () => {
        const alt = get().camera.altitude
        if (alt >= 1_000_000) return `${(alt / 1_000_000).toFixed(1)}M`
        if (alt >= 1_000) return `${(alt / 1_000).toFixed(1)}K`
        return `${Math.round(alt)}`
      },
      formattedCoordinates: () => {
        const { latitude, longitude } = get().camera
        const latDir = latitude >= 0 ? 'N' : 'S'
        const lonDir = longitude >= 0 ? 'E' : 'W'
        return `${Math.abs(latitude).toFixed(4)}°${latDir} ${Math.abs(longitude).toFixed(4)}°${lonDir}`
      },
      mgrsCoordinates: () => {
        const { latitude, longitude } = get().camera
        const bands = 'CDEFGHJKLMNPQRSTUVWX'
        const idx = Math.min(Math.max(Math.floor((latitude + 80) / 8), 0), bands.length - 1)
        const band = bands[idx]
        const zone = Math.floor((longitude + 180) / 6) + 1
        const e = Math.floor((Math.abs(longitude) % 6) * 100000 / 6)
        const n = Math.floor((Math.abs(latitude) % 8) * 100000 / 8)
        return `MGRS: ${String(zone).padStart(2, '0')}${band} ${String(e).padStart(5, '0')} ${String(n).padStart(5, '0')}`
      },
      gsdValue: () => {
        const gsd = get().camera.altitude * 0.00001
        return gsd >= 1 ? `${gsd.toFixed(2)}M` : `${(gsd * 100).toFixed(2)}cm`
      },
      niirsValue: () => {
        const alt = get().camera.altitude
        const rating = Math.max(0, Math.min(9, 9 - Math.log10(alt / 1000)))
        return rating.toFixed(1)
      },
      utcTime: () => {
        return new Date().toISOString().substring(11, 19) + 'Z'
      },
    }),
    {
      name: 'solaris-state',
      partialize: (state) => ({
        visualMode: state.visualMode,
        isSidebarExpanded: state.isSidebarExpanded,
        activeLayers: state.activeLayers.filter((l) => ['flights','satellites','earthquakes','weather','daynight'].includes(l)),
        currentCity: state.currentCity,
        selectedWeatherLayer: state.selectedWeatherLayer,
      }),
    }
  )
)
