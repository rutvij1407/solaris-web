'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { APP_CONFIG } from '@/lib/constants'

export default function ClassificationHeader() {
  const { toggleSidebar, isSidebarExpanded } = useStore()
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toISOString().substring(11, 19) + 'Z')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="flex items-center justify-between px-4"
      style={{
        height: 36,
        background: 'rgba(10,10,10,0.97)',
        borderBottom: '1px solid rgba(0,212,170,0.3)',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Left: classification + sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          style={{
            color: '#00d4aa',
            fontSize: 16,
            lineHeight: 1,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            fontFamily: 'Menlo, monospace',
            opacity: 0.8,
          }}
          title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarExpanded ? '◧' : '◨'}
        </button>
        <span
          style={{
            fontFamily: 'Menlo, monospace',
            fontSize: 9,
            fontWeight: 600,
            color: '#ff3333',
            letterSpacing: 1,
          }}
        >
          {APP_CONFIG.classificationText}
        </span>
      </div>

      {/* Center: app name */}
      <div className="flex items-center gap-2">
        <span style={{ color: '#00d4aa', fontSize: 14 }}>⊕</span>
        <span
          style={{
            fontFamily: 'Menlo, monospace',
            fontSize: 13,
            fontWeight: 700,
            color: '#00d4aa',
            letterSpacing: 3,
          }}
        >
          {APP_CONFIG.appName}
        </span>
        <span
          style={{
            fontFamily: 'Menlo, monospace',
            fontSize: 8,
            color: 'rgba(0,212,170,0.6)',
            letterSpacing: 2,
          }}
        >
          {APP_CONFIG.tagline}
        </span>
      </div>

      {/* Right: satellite designation + UTC time */}
      <div className="flex items-center gap-4">
        <span
          style={{
            fontFamily: 'Menlo, monospace',
            fontSize: 9,
            color: 'rgba(0,212,170,0.7)',
            letterSpacing: 1,
          }}
        >
          {APP_CONFIG.satelliteDesignation}
        </span>
        <span
          style={{
            fontFamily: 'Menlo, monospace',
            fontSize: 9,
            color: '#00d4aa',
            letterSpacing: 1,
          }}
        >
          {time}
        </span>
      </div>
    </div>
  )
}
