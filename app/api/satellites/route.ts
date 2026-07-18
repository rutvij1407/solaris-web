import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 21600 // 6 hours

// Simplified SGP4-style position estimator (matches Swift app logic)
function estimatePosition(line2: string): { lat: number; lon: number; alt: number } {
  try {
    if (line2.length < 63) return { lat: 0, lon: 0, alt: 550 }

    const meanMotion = parseFloat(line2.substring(52, 63).trim()) || 15.0
    const inclination = parseFloat(line2.substring(8, 16).trim()) || 51.6
    const raan = parseFloat(line2.substring(17, 25).trim()) || 0

    // Altitude from Kepler's third law
    const earthRadius = 6371.0
    const n = (meanMotion * 2 * Math.PI) / 86400
    const mu = 398600.4418
    const semiMajorAxis = Math.pow(mu / (n * n), 1.0 / 3.0)
    const alt = Math.max(200, semiMajorAxis - earthRadius)

    // Simplified ground track
    const now = Date.now() / 1000
    const secondsSinceEpoch = now % 86400
    const orbitalPeriod = 86400 / meanMotion
    const phase = ((secondsSinceEpoch / orbitalPeriod) * 2 * Math.PI) % (2 * Math.PI)

    const incRad = (inclination * Math.PI) / 180
    const raanRad = (raan * Math.PI) / 180

    const lat = (Math.asin(Math.sin(incRad) * Math.sin(phase)) * 180) / Math.PI
    let lon =
      ((raanRad + Math.atan2(Math.cos(incRad) * Math.sin(phase), Math.cos(phase))) * 180) / Math.PI

    while (lon > 180) lon -= 360
    while (lon < -180) lon += 360

    return { lat, lon, alt }
  } catch {
    return { lat: 0, lon: 0, alt: 550 }
  }
}

function parseTLE(data: string) {
  const lines = data
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const satellites: {
    id: string
    name: string
    line1: string
    line2: string
    latitude: number
    longitude: number
    altitude: number
  }[] = []

  let i = 0
  while (i < lines.length - 2) {
    const name = lines[i]
    const line1 = lines[i + 1]
    const line2 = lines[i + 2]

    if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
      const noradId = line2.substring(2, 7).trim()
      const pos = estimatePosition(line2)

      satellites.push({
        id: noradId,
        name: name.trim(),
        line1,
        line2,
        latitude: pos.lat,
        longitude: pos.lon,
        altitude: pos.alt,
      })
      i += 3
    } else {
      i += 1
    }
  }

  return satellites
}

export async function GET() {
  // Use small groups only — starlink is 2MB+ and can't be edge-cached
  // stations = ISS/Tiangong, visual = brightest ~100 sats, gps-ops = GPS fleet
  const groups = ['stations', 'visual', 'gps-ops']

  const results = await Promise.allSettled(
    groups.map((group) =>
      fetch(
        `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=TLE`,
        { next: { revalidate: 21600 } }
      ).then((r) => (r.ok ? r.text() : Promise.reject(`HTTP ${r.status}`)))
    )
  )

  const allSatellites: ReturnType<typeof parseTLE> = []

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const parsed = parseTLE(result.value)
      allSatellites.push(...parsed)
    }
  })

  // De-duplicate by NORAD ID
  const seen = new Set<string>()
  const unique = allSatellites.filter((s) => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })

  return NextResponse.json({ satellites: unique }, {
    headers: {
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
    },
  })
}
