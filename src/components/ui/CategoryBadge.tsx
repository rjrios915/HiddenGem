import type { ActivityCategory } from '@/types'

interface CategoryBadgeProps {
  category: ActivityCategory | string
  size?: 'xs' | 'sm' | 'md'
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  music:        { bg: '#EDE8F5', text: '#5C3D8A', border: '#C9B8E8', label: 'Music'        },
  art:          { bg: '#FAEAEE', text: '#8A2D45', border: '#E8B0BC', label: 'Art'           },
  cafes:        { bg: '#F5EDE0', text: '#6B3D12', border: '#D4A87A', label: 'Cafés'         },
  outdoors:     { bg: '#DCE8F5', text: '#1A3050', border: '#6A9CC8', label: 'Outdoors'      },
  fitness:      { bg: '#E5EFE0', text: '#2E5220', border: '#7A9E63', label: 'Fitness'       },
  volunteering: { bg: '#DCF0EE', text: '#1A4D48', border: '#6AAFAA', label: 'Volunteering'  },
  nightlife:    { bg: '#EAE5F5', text: '#3A2660', border: '#A895D8', label: 'Nightlife'     },
  food:         { bg: '#FEF0E0', text: '#7A3B0A', border: '#E8A055', label: 'Food'          },
  workshops:    { bg: '#FAECE4', text: '#8A3A1A', border: '#D4855A', label: 'Workshops'     },
  gaming:       { bg: '#E0E8F5', text: '#1A2D5C', border: '#7090C8', label: 'Gaming'        },
  wellness:     { bg: '#E8F5E8', text: '#1E4D22', border: '#78B07C', label: 'Wellness'      },
}

const DEFAULT_STYLE = {
  bg: '#F0ECE4', text: '#5A5A48', border: '#CFC9BC', label: '',
}

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category] ?? { ...DEFAULT_STYLE, label: category }

  const padding = size === 'xs'
    ? '2px 8px'
    : size === 'sm'
    ? '3px 10px'
    : '5px 13px'

  const fontSize = size === 'xs' ? '10px' : size === 'sm' ? '11px' : '12px'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding,
        borderRadius: '999px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize,
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
      }}
    >
      {style.label || category}
    </span>
  )
}
