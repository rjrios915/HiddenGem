interface GemSvgProps {
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export default function GemSvg({ size = 24, color = 'currentColor', strokeWidth = 1.5, className }: GemSvgProps) {
  // viewBox 56×38: classic brilliant-cut diamond, wider than tall
  const h = Math.round(size * 38 / 56)
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 56 38"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {/* Outer diamond: flat table top, crown flares out to girdle, pavilion to culet */}
      <path d="M11,1 L45,1 L56,16 L28,38 L0,16 Z" />

      {/* Girdle — horizontal line at widest point */}
      <line x1="0" y1="16" x2="56" y2="16" />

      {/* Crown — two diagonals that cross, creating 4 facet regions */}
      <line x1="11" y1="1" x2="38" y2="16" />
      <line x1="45" y1="1" x2="18" y2="16" />

      {/* Pavilion — two lines from inner girdle points to culet */}
      <line x1="18" y1="16" x2="28" y2="38" />
      <line x1="38" y1="16" x2="28" y2="38" />
    </svg>
  )
}
