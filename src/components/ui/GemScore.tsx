'use client'

import GemSvg from './GemSvg'

interface GemScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function GemScore({ score, size = 'md', showLabel = false }: GemScoreProps) {
  const isHigh   = score >= 8
  const isMid    = score >= 6 && score < 8
  // <6 = terracotta

  const color  = isHigh ? '#1A3050' : isMid ? '#7A5C1A' : '#9A3B1E'
  const bg     = isHigh ? '#C0D9EE' : isMid ? '#F5E9CC' : '#F2DDD3'
  const border = isHigh ? '#6A9CC8' : isMid ? '#D4A84B' : '#D4855A'

  const sizes = {
    sm: { icon: 11, text: '11px', gap: '4px', px: '7px', py: '3px' },
    md: { icon: 13, text: '12px', gap: '5px', px: '9px', py: '4px' },
    lg: { icon: 16, text: '14px', gap: '6px', px: '11px', py: '5px' },
  }
  const s = sizes[size]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        paddingInline: s.px,
        paddingBlock: s.py,
        borderRadius: '999px',
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: s.text,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <GemSvg size={s.icon} color={color} strokeWidth={1.8} />
      {showLabel && (
        <span style={{ fontWeight: 400, opacity: 0.65, marginRight: '1px' }}>gem</span>
      )}
      <span>{score.toFixed(1)}</span>
    </span>
  )
}
