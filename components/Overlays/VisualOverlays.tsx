'use client'

import type { VisualMode } from '@/lib/types'

interface Props {
  mode: VisualMode
}

export default function VisualOverlay({ mode }: Props) {
  if (mode === 'normal') return null

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20, overflow: 'hidden' }}
    >
      {mode === 'crt' && <CRTOverlay />}
      {mode === 'nvg' && <NVGOverlay />}
      {mode === 'flir' && <FLIROverlay />}
      {mode === 'noir' && <NoirOverlay />}
      {mode === 'snow' && <SnowOverlay />}
      {mode === 'anime' && <AnimeOverlay />}
      {mode === 'ai' && <AIOverlay />}
    </div>
  )
}

/* ─── CRT ─────────────────────────────────────────────────────── */
function CRTOverlay() {
  return (
    <>
      {/* Green phosphor tint */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,255,60,0.06)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Scanlines */}
      <div
        className="crt-scanlines"
        style={{ position: 'absolute', inset: 0 }}
      />
      {/* Vignette */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      {/* Flicker */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,255,60,0.02)',
          animation: 'flicker 0.08s ease-in-out infinite alternate',
        }}
      />
    </>
  )
}

/* ─── NVG ─────────────────────────────────────────────────────── */
function NVGOverlay() {
  return (
    <>
      {/* Green tint */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,80,20,0.35)',
          mixBlendMode: 'overlay',
        }}
      />
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(50,255,80,0.18)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Grain noise */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: 'nvgNoise 0.05s step-start infinite',
        }}
      />
      {/* Circular scope vignette */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.9) 100%)',
        }}
      />
      {/* Scope ring */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 90vh)',
          height: 'min(90vw, 90vh)',
          borderRadius: '50%',
          border: '2px solid rgba(0,255,80,0.25)',
        }}
      />
    </>
  )
}

/* ─── FLIR ────────────────────────────────────────────────────── */
function FLIROverlay() {
  return (
    <>
      {/* Thermal color gradient */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(20,0,60,0.25), rgba(120,0,120,0.15), rgba(255,120,0,0.1), rgba(255,255,0,0.08))',
          mixBlendMode: 'overlay',
        }}
      />
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,70,0,0.08)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Scan line */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          height: 3,
          background: 'linear-gradient(to bottom, transparent, rgba(255,180,0,0.3), transparent)',
          animation: 'flirScan 4s linear infinite',
        }}
      />
      {/* FLIR grid */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      {/* Temperature scale (bottom-right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2,
          fontFamily: 'Menlo, monospace',
          fontSize: 8,
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        <span>°C</span>
        <div
          style={{
            width: 12,
            height: 80,
            borderRadius: 2,
            background: 'linear-gradient(to bottom, #ffff00, #ff6600, #ff0000, #800080, #0000ff)',
          }}
        />
        <span>40</span>
        <span style={{ marginTop: 52 }}>-20</span>
      </div>
    </>
  )
}

/* ─── NOIR ────────────────────────────────────────────────────── */
function NoirOverlay() {
  return (
    <>
      {/* Desaturation */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(128,128,128,0.45)',
          mixBlendMode: 'saturation',
        }}
      />
      {/* Contrast */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.12)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Film grain */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </>
  )
}

/* ─── SNOW ────────────────────────────────────────────────────── */
function SnowOverlay() {
  return (
    <>
      {/* Blue-cold tint */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(100,150,255,0.15)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* Desaturation */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(180,180,200,0.25)',
          mixBlendMode: 'saturation',
        }}
      />
      {/* Frost highlight */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(180,220,255,0.08)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Frost vignette edges */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(200,230,255,0.22) 100%)',
        }}
      />
    </>
  )
}

/* ─── ANIME ───────────────────────────────────────────────────── */
function AnimeOverlay() {
  return (
    <>
      {/* Warm saturation boost */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,245,230,0.08)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* Center bloom */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, transparent 60%)',
        }}
      />
      {/* Speed lines — top-left corner */}
      <svg
        style={{ position: 'absolute', top: 60, left: 0, width: 120, height: 120, opacity: 0.12 }}
        viewBox="0 0 120 120"
      >
        {Array.from({ length: 18 }, (_, i) => {
          const angle = (i * 10 - 90) * (Math.PI / 180)
          const x2 = 0 + Math.cos(angle) * 120
          const y2 = 0 + Math.sin(angle) * 120
          return <line key={i} x1="0" y1="0" x2={x2} y2={y2} stroke="white" strokeWidth="1" />
        })}
      </svg>
      {/* Speed lines — bottom-right corner */}
      <svg
        style={{ position: 'absolute', bottom: 0, right: 0, width: 120, height: 120, opacity: 0.12 }}
        viewBox="0 0 120 120"
      >
        {Array.from({ length: 18 }, (_, i) => {
          const angle = (i * 10) * (Math.PI / 180)
          const x2 = 120 + Math.cos(angle) * 120
          const y2 = 120 + Math.sin(angle) * 120
          return <line key={i} x1="120" y1="120" x2={x2} y2={y2} stroke="white" strokeWidth="1" />
        })}
      </svg>
    </>
  )
}

/* ─── AI ──────────────────────────────────────────────────────── */
function AIOverlay() {
  return (
    <>
      {/* Cyan tint */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,200,255,0.06)',
        }}
      />
      {/* AI scan line (animated) */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, top: 0,
          height: 3,
          background: 'linear-gradient(to bottom, transparent, rgba(0,212,170,0.45), transparent)',
          animation: 'aiScan 3s linear infinite',
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,170,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,170,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Targeting boxes */}
      <AITargetingBoxes />
    </>
  )
}

const AI_BOX_POSITIONS = [
  { left: '22%', top: '28%' },
  { left: '61%', top: '52%' },
  { left: '39%', top: '70%' },
]

function AITargetingBoxes() {
  return (
    <>
      {AI_BOX_POSITIONS.map((pos, i) => (
        <div
          key={i}
          className="detect-pulse"
          style={{
            position: 'absolute',
            ...pos,
            width: 90,
            height: 90,
            border: '1.5px solid #00d4aa',
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
