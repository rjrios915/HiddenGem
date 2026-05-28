'use client'

import { useState } from 'react'
import ActivityCard from '@/components/feed/ActivityCard'
import Link from 'next/link'
import type { Activity } from '@/types'

interface SavedRow {
  id: string
  activity: Activity
}

interface LoggedRow {
  id: string
  activity: Activity
  visited_at: string
  rating: number
  reflection?: string | null
}

interface Props {
  initialSaved: SavedRow[]
  logged: LoggedRow[]
}

export default function SavedClient({ initialSaved, logged }: Props) {
  const [savedList, setSavedList] = useState(initialSaved)

  const handleUnsave = async (activityId: string) => {
    setSavedList(prev => prev.filter(s => s.activity.id !== activityId))
    await fetch(`/api/save/${activityId}`, { method: 'DELETE' })
  }

  return (
    <>
      {savedList.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {savedList.map((s) => (
            <ActivityCard
              key={s.id}
              activity={s.activity}
              isSaved={true}
              onSave={handleUnsave}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.2 }}>
            <svg width="48" height="33" viewBox="0 0 56 38" fill="none" stroke="#1A3050" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
              <path d="M11,1 L45,1 L56,16 L28,38 L0,16 Z" />
              <line x1="0" y1="16" x2="56" y2="16" />
              <line x1="11" y1="1" x2="38" y2="16" />
              <line x1="45" y1="1" x2="18" y2="16" />
              <line x1="18" y1="16" x2="28" y2="38" />
              <line x1="38" y1="16" x2="28" y2="38" />
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '17px', fontWeight: 500, color: '#1A1A14', marginBottom: '8px' }}>
            No saved gems yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
            Bookmark activities from your feed to see them here.
          </p>
          <Link
            href="/feed"
            style={{
              display: 'inline-flex',
              padding: '8px 20px',
              borderRadius: '8px',
              background: '#1A3050',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Browse feed
          </Link>
        </div>
      )}

      {logged.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '4px' }}>
            Recent experiences
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Places you've logged</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logged.map((log) => log.activity && (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(26,48,80,0.07)',
                  border: '1px solid rgba(26,48,80,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}>
                  ◆
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.activity.title}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {log.visited_at} · {'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}
                  </p>
                </div>

                {log.reflection && (
                  <p style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{log.reflection}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
