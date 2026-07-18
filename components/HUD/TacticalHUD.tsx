'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

export default function TacticalHUD() {
  const {
    formattedCoordinates,
    formattedAltitude,
    mgrsCoordinates,
    gsdValue,
    niirsValue,
    isSidebarExpanded,
    flights,
    satellites,
    earthquakes,
    activeLayers,
    isPanopticActive,
    detectionCount,
  } = useStore()

  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().substring(11, 19) + 'Z')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* Corner bracket — top-left */}
      <div className="corner-tl" />
      {/* Corner bracket — top-right */}
      <div className="corner-tr" />
      {/* Corner bracket — bottom-left */}
      <div className="corner-bl" />
      {/* Corner bracket — bottom-right */}
      <div className="corner-br" />

      {/* Center crosshair */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 40,
          height: 40,
        }}
      >
        {/* Horizontal */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: 1,
            background: 'rgba(0,212,170,0.35)',
          }}
        />
        {/* Vertical */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 1,
            height: '100%',
            background: 'rgba(0,212,170,0.35)',
          }}
        />
        {/* Center ring */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            border: '1px solid rgba(0,212,170,0.5)',
          }}
        />
      </div>

      {/* Top-right info panel */}
      <div
        className="absolute sol-panel"
        style={{
          top: 12,
          right: 12,
          padding: '8px 12px',
          minWidth: 140,
        }}
      >
        {/* REC indicator */}
        <div className="flex items-center gap-1 mb-2">
          <div
            className="blink"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#ff3333',
            }}
          />
          <span style={{ fontSize: 9, color: '#ff3333', letterSpacing: 2, fontFamily: 'Menlo, monospace' }}>
            REC
          </span>
        </div>

        {/* Orbital info */}
        <div style={{ fontFamily: 'Menlo, monospace', fontSize: 9 }}>
          <div className="flex justify-between gap-4">
            <span style={{ color: 'rgba(0,212,170,0.5)' }}>ORB:</span>
            <span style={{ color: '#00d4aa' }}>47639</span>
          </div>
          <div className="flex justify-between gap-4">
            <span style={{ color: 'rgba(0,212,170,0.5)' }}>PASS:</span>
            <span style={{ color: '#00d4aa' }}>DESC-179</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,212,170,0.25)', margin: '6px 0' }} />

        {/* GSD + NIIRS */}
        <div style={{ fontFamily: 'Menlo, monospace', fontSize: 9 }}>
          <div className="flex justify-between gap-3">
            <span style={{ color: 'rgba(0,212,170,0.5)' }}>GSD:</span>
            <span style={{ color: '#00d4aa' }}>{gsdValue()}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span style={{ color: 'rgba(0,212,170,0.5)' }}>NIIRS:</span>
            <span style={{ color: '#00d4aa' }}>{niirsValue()}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span style={{ color: 'rgba(0,212,170,0.5)' }}>ALT:</span>
            <span style={{ color: '#00d4aa' }}>{formattedAltitude()}M</span>
          </div>
        </div>

        {/* Active data summary */}
        {activeLayers.length > 0 && (
          <>
            <div style={{ height: 1, background: 'rgba(0,212,170,0.25)', margin: '6px 0' }} />
            <div style={{ fontFamily: 'Menlo, monospace', fontSize: 8 }}>
              {activeLayers.includes('flights') && (
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(0,212,170,0.5)' }}>FLT:</span>
                  <span style={{ color: '#00ff88' }}>{flights.length.toLocaleString()}</span>
                </div>
              )}
              {activeLayers.includes('satellites') && (
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(0,212,170,0.5)' }}>SAT:</span>
                  <span style={{ color: '#00ff88' }}>{satellites.length}</span>
                </div>
              )}
              {activeLayers.includes('earthquakes') && (
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(0,212,170,0.5)' }}>EQ:</span>
                  <span style={{ color: '#ffaa00' }}>{earthquakes.length}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* PANOPTIC active */}
        {isPanopticActive && (
          <>
            <div style={{ height: 1, background: 'rgba(0,212,170,0.25)', margin: '6px 0' }} />
            <div style={{ fontFamily: 'Menlo, monospace', fontSize: 8 }}>
              <div className="flex justify-between">
                <span style={{ color: 'rgba(0,212,170,0.5)' }}>DETECTIONS:</span>
                <span style={{ color: '#00d4aa' }}>{detectionCount}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom-left coordinates panel */}
      <div
        className="absolute sol-panel"
        style={{
          bottom: 12,
          left: 12,
          padding: '6px 10px',
        }}
      >
        <div style={{ fontFamily: 'Menlo, monospace', fontSize: 9, color: '#00d4aa', letterSpacing: 0.5 }}>
          {mgrsCoordinates()}
        </div>
        <div style={{ fontFamily: 'Menlo, monospace', fontSize: 9, color: '#66ffcc', marginTop: 2 }}>
          {formattedCoordinates()}
        </div>
      </div>

      {/* Bottom-right UTC clock */}
      <div
        className="absolute"
        style={{
          bottom: 12,
          right: 12,
          fontFamily: 'Menlo, monospace',
          fontSize: 9,
          color: 'rgba(0,212,170,0.5)',
          letterSpacing: 1,
        }}
      >
        UTC {time}
      </div>

      {/* PANOPTIC detection boxes when active */}
      {isPanopticActive && <DetectionBoxes />}
    </div>
  )
}

// Stable detection box overlay
const DETECTION_POSITIONS = [
  { left: '25%', top: '30%' },
  { left: '63%', top: '55%' },
  { left: '42%', top: '72%' },
]

function DetectionBoxes() {
  return (
    <>
      {DETECTION_POSITIONS.map((pos, i) => (
        <div
          key={i}
          className="absolute detect-pulse"
          style={{
            ...pos,
            width: 90,
            height: 90,
            border: '1.5px solid #00d4aa',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: 3,
              fontFamily: 'Menlo, monospace',
              fontSize: 7,
              color: '#00d4aa',
              letterSpacing: 0.5,
            }}
          >
            TRACKING
          </span>
        </div>
      ))}
    </>
  )
}
