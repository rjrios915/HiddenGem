'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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

const CATEGORY_EMOJI: Record<string, string> = {
  music:        '🎵',
  art:          '🎨',
  cafes:        '☕',
  outdoors:     '🌿',
  fitness:      '💪',
  volunteering: '🤝',
  nightlife:    '🌙',
  food:         '🍜',
  workshops:    '🔧',
  gaming:       '🎮',
  wellness:     '🧘',
}

export default function ActivityCard({
  activity,
  explanation,
  isSaved = false,
  distanceKm,
  onSave,
  onDismiss,
  onClick,
}: ActivityCardProps) {
  const [saved,          setSaved]          = useState(isSaved)
  const [dismissed,      setDismissed]      = useState(false)
  const [pendingDismiss, setPendingDismiss] = useState(false)
  const [logModalOpen,   setLogModalOpen]   = useState(false)
  const cardRef    = useRef<HTMLElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  const finalizeDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDismissed(true)
    onDismissRef.current?.(activity.id)
  }, [activity.id])

  // Click outside the card commits the dismissal
  useEffect(() => {
    if (!pendingDismiss) return
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        finalizeDismiss()
      }
    }
    const id = setTimeout(() => document.addEventListener('click', handler), 10)
    return () => { clearTimeout(id); document.removeEventListener('click', handler) }
  }, [pendingDismiss, finalizeDismiss])

  // Auto-commit after 6 seconds
  useEffect(() => {
    if (!pendingDismiss) return
    timerRef.current = setTimeout(finalizeDismiss, 6000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [pendingDismiss, finalizeDismiss])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  if (dismissed) return null

  const gradient = CATEGORY_GRADIENTS[activity.category] ?? DEFAULT_GRADIENT

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(v => !v)
    onSave?.(activity.id)
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPendingDismiss(true)
  }

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (timerRef.current) clearTimeout(timerRef.current)
    setPendingDismiss(false)
  }

  return (
    <article
      ref={cardRef}
      onClick={() => !pendingDismiss && onClick?.(activity)}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick && !pendingDismiss ? 'pointer' : 'default',
        boxShadow: '0 1px 4px rgba(26,48,80,0.06), 0 4px 16px rgba(26,48,80,0.06)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={`animate-fade-up ${pendingDismiss ? '' : 'group hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(26,48,80,0.14)]'}`}
    >
      {/* Pending dismiss overlay */}
      {pendingDismiss && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
          className="animate-fade-up"
        >
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0D0D', marginBottom: '3px' }}>
              Hidden from feed
            </p>
            <p style={{ fontSize: '12px', color: '#999999' }}>
              Click anywhere to confirm · or
            </p>
          </div>
          <button
            onClick={handleUndo}
            style={{
              padding: '9px 18px', borderRadius: '10px',
              background: '#1A3050', color: '#FFFFFF',
              border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              flexShrink: 0,
            }}
          >
            Undo
          </button>
        </div>
      )}
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
        {activity.image_url ? (
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
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '52px', opacity: 0.45, userSelect: 'none' }}>
              {CATEGORY_EMOJI[activity.category] ?? '✨'}
            </span>
          </div>
        )}

        {/* Soft scrim at bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(255,255,255,0.55) 0%, transparent 45%)',
        }} />

        {/* Category badge + community tag — bottom left */}
        <div style={{ position: 'absolute', bottom: '12px', left: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CategoryBadge category={activity.category} size="xs" />
          {activity.source === 'community' && (
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
              padding: '3px 8px', borderRadius: '999px',
              background: '#FFF8E6', border: '1px solid #F5CC6A', color: '#7A5C1A',
            }}>
              ✦ Community
            </span>
          )}
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
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          marginTop: 'auto', paddingTop: '8px', gap: '8px',
          borderTop: '1px solid #F0F0F0',
        }}>
          <button
            onClick={e => { e.stopPropagation(); setLogModalOpen(true) }}
            title="Log visit"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: '#1A3050', fontWeight: 600,
              background: 'rgba(26,48,80,0.07)',
              border: '1px solid rgba(26,48,80,0.12)',
              borderRadius: '999px', cursor: 'pointer',
              padding: '5px 11px', transition: 'all 0.15s',
              fontFamily: 'var(--font-sans)',
            }}
            className="hover:bg-[rgba(26,48,80,0.13)]"
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
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', color: '#2660A8', fontWeight: 500,
                background: 'rgba(38,96,168,0.06)',
                border: '1px solid rgba(38,96,168,0.15)',
                borderRadius: '999px', padding: '5px 11px',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              className="hover:bg-[rgba(38,96,168,0.11)]"
            >
              <ExternalLink size={10} strokeWidth={2} />
              View
            </a>
          )}
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
