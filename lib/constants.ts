import type { CityPreset, DataLayerType, VisualMode, WeatherRadar } from './types'

export const CITY_PRESETS: CityPreset[] = [
  {
    id: 'washington-dc',
    name: 'Washington DC',
    latitude: 38.9072,
    longitude: -77.0369,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'capitol', name: 'US Capitol', latitude: 38.8899, longitude: -77.0091, zoomAltitude: 5000 },
      { id: 'monument', name: 'Washington Monument', latitude: 38.8895, longitude: -77.0353, zoomAltitude: 3000 },
      { id: 'lincoln', name: 'Lincoln Memorial', latitude: 38.8893, longitude: -77.0502, zoomAltitude: 3000 },
      { id: 'pentagon', name: 'Pentagon', latitude: 38.8719, longitude: -77.0563, zoomAltitude: 4000 },
      { id: 'jefferson', name: 'Jefferson Memorial', latitude: 38.8814, longitude: -77.0365, zoomAltitude: 3000 },
    ],
  },
  {
    id: 'austin',
    name: 'Austin',
    latitude: 30.2672,
    longitude: -97.7431,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'tx-capitol', name: 'TX State Capitol', latitude: 30.2747, longitude: -97.7404, zoomAltitude: 3000 },
      { id: 'frost', name: 'Frost Bank Tower', latitude: 30.2659, longitude: -97.7428, zoomAltitude: 2000 },
      { id: 'ut-tower', name: 'UT Tower', latitude: 30.2862, longitude: -97.7394, zoomAltitude: 2000 },
    ],
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'gg-bridge', name: 'Golden Gate Bridge', latitude: 37.8199, longitude: -122.4783, zoomAltitude: 4000 },
      { id: 'alcatraz', name: 'Alcatraz', latitude: 37.8267, longitude: -122.423, zoomAltitude: 3000 },
      { id: 'transamerica', name: 'Transamerica', latitude: 37.7952, longitude: -122.4028, zoomAltitude: 2000 },
    ],
  },
  {
    id: 'new-york',
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'empire', name: 'Empire State', latitude: 40.7484, longitude: -73.9857, zoomAltitude: 2000 },
      { id: 'statue', name: 'Statue of Liberty', latitude: 40.6892, longitude: -74.0445, zoomAltitude: 3000 },
      { id: 'central-park', name: 'Central Park', latitude: 40.7829, longitude: -73.9654, zoomAltitude: 5000 },
    ],
  },
  {
    id: 'london',
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'tower-bridge', name: 'Tower Bridge', latitude: 51.5055, longitude: -0.0754, zoomAltitude: 3000 },
      { id: 'shard', name: 'The Shard', latitude: 51.5045, longitude: -0.0865, zoomAltitude: 2000 },
      { id: 'big-ben', name: 'Big Ben', latitude: 51.5007, longitude: -0.1246, zoomAltitude: 2000 },
      { id: 'st-pauls', name: "St. Paul's", latitude: 51.5138, longitude: -0.0984, zoomAltitude: 2000 },
    ],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'tokyo-tower', name: 'Tokyo Tower', latitude: 35.6586, longitude: 139.7454, zoomAltitude: 2000 },
      { id: 'skytree', name: 'Tokyo Skytree', latitude: 35.7101, longitude: 139.8107, zoomAltitude: 2000 },
      { id: 'imperial', name: 'Imperial Palace', latitude: 35.6852, longitude: 139.7528, zoomAltitude: 3000 },
    ],
  },
  {
    id: 'paris',
    name: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'eiffel', name: 'Eiffel Tower', latitude: 48.8584, longitude: 2.2945, zoomAltitude: 2000 },
      { id: 'arc', name: 'Arc de Triomphe', latitude: 48.8738, longitude: 2.295, zoomAltitude: 2000 },
      { id: 'notre-dame', name: 'Notre-Dame', latitude: 48.853, longitude: 2.3499, zoomAltitude: 2000 },
    ],
  },
  {
    id: 'dubai',
    name: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    defaultAltitude: 50000,
    landmarks: [
      { id: 'burj-khalifa', name: 'Burj Khalifa', latitude: 25.1972, longitude: 55.2744, zoomAltitude: 2000 },
      { id: 'palm', name: 'Palm Jumeirah', latitude: 25.1124, longitude: 55.139, zoomAltitude: 5000 },
      { id: 'burj-arab', name: 'Burj Al Arab', latitude: 25.1412, longitude: 55.1853, zoomAltitude: 2000 },
    ],
  },
]

export const DATA_LAYERS: {
  id: DataLayerType
  label: string
  icon: string
  source: string
}[] = [
  { id: 'flights', label: 'Live Flights', icon: '✈', source: 'OpenSky Network' },
  { id: 'satellites', label: 'Satellites', icon: '🛰', source: 'CelesTrak' },
  { id: 'earthquakes', label: 'Earthquakes (24h)', icon: '〰', source: 'USGS' },
  { id: 'weather', label: 'Weather Radar', icon: '🌧', source: 'RainViewer / NASA' },
  { id: 'daynight', label: 'Day / Night', icon: '🌓', source: 'Solar position' },
]

export const VISUAL_MODES: {
  id: VisualMode
  label: string
  icon: string
}[] = [
  { id: 'normal', label: 'Normal', icon: '👁' },
  { id: 'crt', label: 'CRT', icon: '📺' },
  { id: 'nvg', label: 'NVG', icon: '🌙' },
  { id: 'flir', label: 'FLIR', icon: '🔥' },
  { id: 'anime', label: 'Anime', icon: '🎨' },
  { id: 'noir', label: 'Noir', icon: '◑' },
  { id: 'snow', label: 'Snow', icon: '❄' },
  { id: 'ai', label: 'AI', icon: '🧠' },
]

export const NEXRAD_STATIONS: WeatherRadar[] = [
  { id: 'KLWX', stationId: 'KLWX', name: 'Sterling VA', latitude: 38.9753, longitude: -77.4778, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KDOX', stationId: 'KDOX', name: 'Dover AFB DE', latitude: 38.8257, longitude: -75.44, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KOKX', stationId: 'KOKX', name: 'Brookhaven NY', latitude: 40.8656, longitude: -72.8639, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KFWS', stationId: 'KFWS', name: 'Dallas/Ft Worth TX', latitude: 32.5731, longitude: -97.3031, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KEWX', stationId: 'KEWX', name: 'Austin/San Antonio TX', latitude: 29.7039, longitude: -98.0286, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KLOT', stationId: 'KLOT', name: 'Chicago IL', latitude: 41.6044, longitude: -88.0847, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KMUX', stationId: 'KMUX', name: 'San Francisco CA', latitude: 37.155, longitude: -121.8983, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KVTX', stationId: 'KVTX', name: 'Los Angeles CA', latitude: 34.4117, longitude: -119.1794, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KATX', stationId: 'KATX', name: 'Seattle WA', latitude: 48.1944, longitude: -122.4958, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KAMX', stationId: 'KAMX', name: 'Miami FL', latitude: 25.6111, longitude: -80.4128, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KFFC', stationId: 'KFFC', name: 'Atlanta GA', latitude: 33.3636, longitude: -84.5658, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KPSR', stationId: 'KPSR', name: 'Phoenix AZ', latitude: 33.4372, longitude: -112.1619, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
  { id: 'KDEN', stationId: 'KDEN', name: 'Denver CO', latitude: 39.7867, longitude: -104.5458, type: 'NEXRAD', status: 'ACTIVE', precipitationLevel: 0 },
]

export const APP_CONFIG = {
  appName: 'SOLARIS',
  tagline: 'GEOSPATIAL INTELLIGENCE',
  classificationText: 'TOP SECRET // SI-TK // NOFORN',
  satelliteDesignation: 'KH11-4166 OPS-4117',
  flightRefreshMs: 8000,
  earthquakeRefreshMs: 120000,
  satelliteRefreshMs: 180000,
}
