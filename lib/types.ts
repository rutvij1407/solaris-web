export interface Flight {
  id: string
  callsign: string | null
  originCountry: string
  longitude: number
  latitude: number
  altitude: number      // meters
  velocity: number      // m/s
  heading: number       // degrees
  verticalRate: number  // m/s
  onGround: boolean
  lastContact: number   // unix timestamp
}

export interface Earthquake {
  id: string
  magnitude: number
  place: string
  time: number          // unix timestamp ms
  longitude: number
  latitude: number
  depth: number         // km
  tsunami: boolean
  significance: number
}

export interface Satellite {
  id: string
  name: string
  longitude: number
  latitude: number
  altitude: number      // km
  line1: string
  line2: string
}

export interface WeatherRadar {
  id: string
  stationId: string
  name: string
  latitude: number
  longitude: number
  type: string
  status: 'ACTIVE' | 'MAINT' | 'OFFLINE'
  precipitationLevel: 0 | 1 | 2 | 3 | 4
}

export interface CCTVCamera {
  id: string
  name: string
  latitude: number
  longitude: number
  city: string
  streamUrl?: string
}

export type VisualMode =
  | 'normal'
  | 'crt'
  | 'nvg'
  | 'flir'
  | 'anime'
  | 'noir'
  | 'snow'
  | 'ai'

export type DataLayerType =
  | 'flights'
  | 'satellites'
  | 'earthquakes'
  | 'weather'
  | 'daynight'

export type WeatherLayerType = 'rain' | 'clouds' | 'temperature'

export interface CityPreset {
  id: string
  name: string
  latitude: number
  longitude: number
  defaultAltitude: number
  landmarks: Landmark[]
}

export interface Landmark {
  id: string
  name: string
  latitude: number
  longitude: number
  zoomAltitude: number
}

export interface CameraState {
  latitude: number
  longitude: number
  altitude: number
  heading: number
}
