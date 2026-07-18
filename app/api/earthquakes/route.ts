import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 300

export async function GET() {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
      { next: { revalidate: 300 } }
    )

    if (!res.ok) {
      return NextResponse.json(
        { earthquakes: [], error: `USGS returned ${res.status}` },
        { status: 200 }
      )
    }

    const data = await res.json()

    const earthquakes = (data.features as any[])
      .map((f: any) => ({
        id: f.id as string,
        magnitude: (f.properties.mag as number) ?? 0,
        place: (f.properties.place as string) ?? 'Unknown location',
        time: f.properties.time as number,
        longitude: f.geometry.coordinates[0] as number,
        latitude: f.geometry.coordinates[1] as number,
        depth: f.geometry.coordinates[2] as number,
        tsunami: f.properties.tsunami === 1,
        significance: (f.properties.sig as number) ?? 0,
      }))
      .filter((e: any) => e.latitude != null && e.longitude != null)

    return NextResponse.json({ earthquakes }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ earthquakes: [], error: message }, { status: 200 })
  }
}
