'use client'

import GemSvg from './GemSvg'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({
  message = 'Finding hidden gems...',
  size = 'md',
}: LoadingSpinnerProps) {
  const dim  = size === 'sm' ? 28 : size === 'md' ? 42 : 56
  const ring = dim + 16

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', padding: '32px' }}>
      {/* Spinning ring + pulsing gem */}
      <div style={{ position: 'relative', width: ring, height: ring }}>
        {/* Rotating outer ring */}
        <svg
          width={ring}
          height={ring}
          viewBox={`0 0 ${ring} ${ring}`}
          fill="none"
          style={{ position: 'absolute', inset: 0, animation: 'spin-slow 2.4s linear infinite' }}
        >
          <circle
            cx={ring / 2} cy={ring / 2} r={ring / 2 - 2}
            stroke="#E8E8E8" strokeWidth="2"
          />
          <path
            d={`M${ring / 2},2 A${ring / 2 - 2} ${ring / 2 - 2} 0 0 1 ${ring - 2},${ring / 2}`}
            stroke="#2660A8" strokeWidth="2.5" strokeLinecap="round"
          />
        </svg>

        {/* Centered gem */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse-slow 2.5s ease-in-out infinite',
        }}>
          <GemSvg size={dim} color="#1A3050" strokeWidth={1.2} />
        </div>
      </div>

      {/* Label */}
      {message && (
        <p style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px',
          color: '#7A7A68',
          letterSpacing: '0.01em',
        }}>
          {message}
        </p>
      )}
    </div>
  )
}
