'use client'

const MOODS: { label: string; emoji: string; query: string }[] = [
  { label: 'Adventurous', emoji: '⚡', query: 'outdoor adventure exploration spontaneous thrilling hidden places' },
  { label: 'Chill',       emoji: '☕', query: 'relaxed calm cozy quiet peaceful low-key cafe atmosphere' },
  { label: 'Social',      emoji: '🎉', query: 'group fun lively people vibrant social scene nightlife food' },
  { label: 'Creative',    emoji: '🎨', query: 'art crafts workshops hands-on creative expression culture' },
  { label: 'Active',      emoji: '💪', query: 'physical fitness movement sport energy outdoor workout' },
]

interface Props {
  activeMood: string | null
  onMoodChange: (query: string | null) => void
}

export default function MoodChips({ activeMood, onMoodChange }: Props) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>
        Current vibe
      </p>
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
        {MOODS.map(({ label, emoji, query }) => {
          const active = activeMood === query
          return (
            <button
              key={label}
              onClick={() => onMoodChange(active ? null : query)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 14px', borderRadius: '999px',
                fontSize: '13px', fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-sans)',
                color: active ? '#FFFFFF' : '#444444',
                background: active ? '#1A3050' : '#F5F5F5',
                border: active ? '1px solid #1A3050' : '1px solid #E8E8E8',
                cursor: 'pointer', transition: 'all 0.15s ease',
                boxShadow: active ? '0 2px 8px rgba(26,48,80,0.2)' : 'none',
              }}
              className={active ? '' : 'hover:border-[#6A9CC8] hover:text-[#1A3050]'}
            >
              <span style={{ fontSize: '14px' }}>{emoji}</span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
