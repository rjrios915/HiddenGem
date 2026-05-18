'use client'

import { useState } from 'react'
import { Bookmark, X, MapPin, ExternalLink, ClipboardList } from 'lucide-react'
import type { Activity } from '@/types'
import { formatDistance, priceLevelLabel } from '@/lib/utils'
import GemScore from '@/components/ui/GemScore'
import CategoryBadge from '@/components/ui/CategoryBadge'
import LogExperienceModal from '@/components/ui/LogExperienceModal'

interface ActivityCardProps {
  activity: Activity
  explanation?: string
  isSaved?: boolean
  distanceKm?: number
  onSave?: (id: string) => void
  onDismiss?: (id: string) => void
  onClick?: (activity: Activity) => void
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  music:        'linear-gradient(145deg, #D8CCEE 0%, #B8A8D8 100%)',
  art:          'linear-gradient(145deg, #F0CCDA 0%, #D8A0B4 100%)',
  cafes:        'linear-gradient(145deg, #E8D8B8 0%, #C8A878 100%)',
  outdoors:     'linear-gradient(145deg, #C8E0B0 0%, #8BBE70 100%)',
  fitness:      'linear-gradient(145deg, #C0D8B8 0%, #78A860 100%)',
  volunteering: 'linear-gradient(145deg, #B8DCD8 0%, #70B0A8 100%)',
  nightlife:    'linear-gradient(145deg, #CCC0E8 0%, #9880C8 100%)',
  food:         'linear-gradient(145deg, #F0D8B8 0%, #D0A060 100%)',
  workshops:    'linear-gradient(145deg, #F0D0B8 0%, #D08860 100%)',
  gaming:       'linear-gradient(145deg, #C0C8E8 0%, #7888C8 100%)',
  wellness:     'linear-gradient(145deg, #C0DCC0 0%, #78B080 100%)',
}
const DEFAULT_GRADIENT = 'linear-gradient(145deg, #F0F0F0 0%, #E0E0E0 100%)'

export default function ActivityCard({
  activity,
  explanation,
  isSaved = false,
  distanceKm,
  onSave,
  onDismiss,
  onClick,
}: ActivityCardProps) {
  const [saved,        setSaved]        = useState(isSaved)
  const [dismissed,    setDismissed]    = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)

  if (dismissed) return null

  const gradient = CATEGORY_GRADIENTS[activity.category] ?? DEFAULT_GRADIENT

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(v => !v)
    onSave?.(activity.id)
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissed(true)
    onDismiss?.(activity.id)
  }

  return (
    <article
      onClick={() => onClick?.(activity)}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 4px rgba(26,48,80,0.06), 0 4px 16px rgba(26,48,80,0.06)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="group hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(26,48,80,0.14)] animate-fade-up"
    >
      {/* Image / gradient header */}
      <div
        style={{
          position: 'relative',
          height: '200px',
          background: activity.image_url ? undefined : gradient,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {activity.image_url && (
          <img
            src={activity.image_url}
            alt={activity.title}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            className="group-hover:scale-[1.04]"
          />
        )}

        {/* Soft scrim at bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(255,255,255,0.55) 0%, transparent 45%)',
        }} />

        {/* Category badge — bottom left */}
        <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
          <CategoryBadge category={activity.category} size="xs" />
        </div>

        {/* Gem score — bottom right */}
        <div style={{ position: 'absolute', bottom: '12px', right: '14px' }}>
          <GemScore score={activity.hidden_gem_score} size="sm" />
        </div>

        {/* Action buttons — top right */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
          <button
            onClick={handleDismiss}
            title="Dismiss"
            style={{
              width: '30px', height: '30px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(220,220,220,0.7)',
              backdropFilter: 'blur(8px)',
              color: '#666666',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-[#FAECE4] hover:text-[#9A3B1E] hover:border-[#D4855A]"
          >
            <X size={12} strokeWidth={2.5} />
          </button>

          <button
            onClick={handleSave}
            title={saved ? 'Unsave' : 'Save'}
            style={{
              width: '30px', height: '30px',
              borderRadius: '50%',
              background: saved ? '#1A3050' : 'rgba(255,255,255,0.9)',
              border: saved ? '1px solid #1A3050' : '1px solid rgba(220,220,220,0.7)',
              backdropFilter: 'blur(8px)',
              color: saved ? '#FFFFFF' : '#666666',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            className={saved ? 'hover:bg-[#122340]' : 'hover:bg-[#DCE8F5] hover:text-[#1A3050] hover:border-[#6A9CC8]'}
          >
            <Bookmark size={12} strokeWidth={2.5} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {/* Title */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          color: '#0D0D0D',
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
        }}>
          {activity.title}
        </h3>

        {/* AI explanation — italic Cormorant */}
        {explanation && (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '14px',
            color: '#666666',
            lineHeight: 1.55,
            borderLeft: '2px solid #B8D0E8',
            paddingLeft: '10px',
          }}>
            {explanation}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#666666', fontWeight: 500 }}>
            {priceLevelLabel(activity.price_level)}
          </span>

          {distanceKm !== undefined && (
            <>
              <span style={{ color: '#D0D0D0', fontSize: '10px' }}>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#666666' }}>
                <MapPin size={10} strokeWidth={2} />
                {formatDistance(distanceKm)}
              </span>
            </>
          )}

          {activity.rating > 0 && (
            <>
              <span style={{ color: '#D0D0D0', fontSize: '10px' }}>·</span>
              <span style={{ fontSize: '12px', color: '#666666' }}>
                ★ {activity.rating.toFixed(1)}
                <span style={{ opacity: 0.55, marginLeft: '3px' }}>({activity.review_count})</span>
              </span>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: '6px',
          borderTop: '1px solid #F0F0F0',
        }}>
          <span style={{ fontSize: '11px', color: '#D0D0D0', textTransform: 'capitalize' }}>
            via {activity.source}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={e => { e.stopPropagation(); setLogModalOpen(true) }}
              title="Log visit"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', color: '#666666', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, transition: 'color 0.15s',
              }}
              className="hover:text-[#1A3050]"
            >
              <ClipboardList size={11} strokeWidth={2} />
              Log visit
            </button>

            {activity.url && (
              <a
                href={activity.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', color: '#2660A8', fontWeight: 500,
                  textDecoration: 'none', opacity: 0.75, transition: 'opacity 0.15s',
                }}
                className="hover:opacity-100"
              >
                <ExternalLink size={10} strokeWidth={2} />
                View
              </a>
            )}
          </div>
        </div>
      </div>

      <LogExperienceModal
        activity={activity}
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
      />
    </article>
  )
}
