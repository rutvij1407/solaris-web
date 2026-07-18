import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sol-bg': '#0a0a0a',
        'sol-bg2': '#111111',
        'sol-accent': '#00d4aa',
        'sol-green': '#00ff88',
        'sol-text': '#66ffcc',
        'sol-muted': 'rgba(0,212,170,0.5)',
        'sol-border': 'rgba(0,212,170,0.3)',
        'sol-panel': 'rgba(10,10,10,0.85)',
        'sol-warning': '#ffaa00',
        'sol-alert': '#ff3333',
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'flicker': 'flicker 0.1s ease-in-out infinite alternate',
        'scanline': 'scanline 3s linear infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.97' },
          '100%': { opacity: '1' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
}
export default config
