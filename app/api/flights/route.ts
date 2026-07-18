import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 10

export async function GET() {
  try {
    const res = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 10 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { flights: [], error: `OpenSky returned ${res.status}` },
        { status: 200 }
      )
    }

    const data = await res.json()
    const states: unknown[][] = data.states ?? []

    const flights = states
      .filter((s) => s[8] === false) // only airborne
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
        onGround: (s[8] as boolean) ?? false,
        lastContact: (s[4] as number) ?? Math.floor(Date.now() / 1000),
      }))
      .filter((f) => f.longitude != null && f.latitude != null)

    return NextResponse.json({ flights }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ flights: [], error: message }, { status: 200 })
  }
}
