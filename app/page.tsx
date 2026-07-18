'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar/Sidebar'
import ClassificationHeader from '@/components/HUD/ClassificationHeader'
import TacticalHUD from '@/components/HUD/TacticalHUD'
import VisualOverlay from '@/components/Overlays/VisualOverlays'
import { useStore } from '@/lib/store'

// Load Cesium globe client-side only (needs WebGL/DOM)
const CesiumGlobe = dynamic(() => import('@/components/Globe/CesiumGlobe'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 h-full flex items-center justify-center bg-sol-bg">
      <div className="text-center">
        <div className="text-sol-accent font-mono text-sm tracking-widest mb-3">
          INITIALIZING GLOBE RENDERER...
        </div>
        <div className="w-48 h-px bg-sol-border mx-auto overflow-hidden">
          <div
            className="h-full bg-sol-accent"
            style={{ animation: 'loading 1.5s ease-in-out infinite', width: '40%' }}
          />
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    </div>
  ),
})

export default function Page() {
  const { isSidebarExpanded, visualMode } = useStore()

  return (
    <div className="flex flex-col h-screen w-screen bg-sol-bg overflow-hidden">
      {/* Top classification header — always on top */}
      <ClassificationHeader />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        {isSidebarExpanded && (
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: 340,
              borderRight: '1px solid rgba(0,212,170,0.3)',
              background: '#0a0a0a',
            }}
          >
            <Sidebar />
          </div>
        )}

        {/* Globe + HUD container */}
        <div className="relative flex-1 overflow-hidden">
          {/* 3D Globe */}
          <Suspense fallback={null}>
            <CesiumGlobe />
          </Suspense>

          {/* Tactical HUD overlay (non-interactive) */}
          <TacticalHUD />

          {/* Visual mode overlay (CRT, NVG, FLIR, etc.) */}
          <VisualOverlay mode={visualMode} />
        </div>
      </div>
    </div>
  )
}
