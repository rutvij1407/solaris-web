import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 10

interface FlightOut {
  id: string
  callsign: string | null
  originCountry: string
  longitude: number
  latitude: number
  altitude: number
  velocity: number
  heading: number
  verticalRate: number
  onGround: boolean
  lastContact: number
}

// Busy airspace around the world. Used when OpenSky blocks the server, which it often does for cloud hosts.
const HUBS: [number, number][] = [
  [40.7, -74], [34, -118], [41.9, -87.6], [32.8, -96.8], [33.6, -84.4], [25.8, -80.3], [47.5, -122.3],
  [51.5, -0.5], [50, 8.6], [25.2, 55.4], [28.6, 77.1], [1.4, 103.9], [35.5, 139.8], [-33.9, 151.2],
  [-23.5, -46.6], [-26.1, 28.2],
]

async function fromOpenSky(): Promise<FlightOut[]> {
  const res = await fetch('https://opensky-network.org/api/states/all', {
    headers: { Accept: 'application/json' },
    next: { revalidate: 10 },
  })
  if (!res.ok) throw new Error(`OpenSky returned ${res.status}`)
  const data = await res.json()
  const states: unknown[][] = data.states ?? []
  return states
    .filter((s) => s[8] === false)
    .map((s) => ({
      id: s[0] as string,
      callsign: (s[1] as string | null)?.trim() || null,
      originCountry: (s[2] as string) ?? 'Unknown',
      longitude: s[5] as number,
      latitude: s[6] as number,
      altitude: (s[7] as number) ?? (s[13] as number) ?? 0,
      velocity: (s[9] as number) ?? 0,
      heading: (s[10] as number) ?? 0,
      verticalRate: (s[11] as number) ?? 0,
      onGround: false,
      lastContact: (s[4] as number) ?? Math.floor(Date.now() / 1000),
    }))
    .filter((f) => f.longitude != null && f.latitude != null)
}

// Open ADS-B data from adsb.lol, no key needed. Units are converted to metres and metres per second.
async function fromAdsbLol(): Promise<FlightOut[]> {
  const results = await Promise.allSettled(
    HUBS.map(async ([lat, lon]) => {
      const r = await fetch(`https://api.adsb.lol/v2/point/${lat}/${lon}/250`, { headers: { Accept: 'application/json' } })
      if (!r.ok) throw new Error(`adsb.lol returned ${r.status}`)
      return (await r.json()).ac as Record<string, unknown>[]
    })
  )
  const seen = new Map<string, FlightOut>()
  const now = Math.floor(Date.now() / 1000)
  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    for (const a of r.value ?? []) {
      const lat = a.lat as number | undefined
      const lon = a.lon as number | undefined
      if (lat == null || lon == null || a.alt_baro === 'ground') continue
      const id = String(a.hex)
      if (seen.has(id)) continue
      seen.set(id, {
        id,
        callsign: typeof a.flight === 'string' ? a.flight.trim() || null : null,
        originCountry: 'Unknown',
        longitude: lon,
        latitude: lat,
        altitude: typeof a.alt_baro === 'number' ? a.alt_baro * 0.3048 : 0,
        velocity: typeof a.gs === 'number' ? a.gs * 0.514444 : 0,
        heading: typeof a.track === 'number' ? a.track : 0,
        verticalRate: typeof a.baro_rate === 'number' ? a.baro_rate * 0.00508 : 0,
        onGround: false,
        lastContact: now,
      })
    }
  }
  if (seen.size === 0) throw new Error('adsb.lol returned no aircraft')
  return [...seen.values()]
}

export async function GET() {
  let flights: FlightOut[] = []
  let source = 'opensky'
  try {
    flights = await fromOpenSky()
  } catch {
    try {
      flights = await fromAdsbLol()
      source = 'adsb.lol'
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ flights: [], error: message }, { status: 200 })
    }
  }
  return NextResponse.json({ flights, source }, {
    headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
  })
}
