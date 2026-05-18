'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import CategoryBadge from '@/components/ui/CategoryBadge'
import GemScore from '@/components/ui/GemScore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Activity } from '@/types'
import { X, ExternalLink } from 'lucide-react'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

export default function MapPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Activity | null>(null)

  useEffect(() => {
    fetch('/api/activities?limit=50')
      .then((r) => r.json())
      .then((d) => setActivities(d.activities ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <LoadingSpinner message="Loading map..." />
          </div>
        ) : (
          <div style={{ height: 'calc(100vh - 56px)', position: 'relative' }}>
            <MapView
              activities={activities}
              onSelectActivity={(a) => setSelected(a)}
            />

            {/* Activity detail panel */}
            {selected && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                  maxWidth: '420px',
                  background: 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #E8E8E8',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  zIndex: 10,
                }}
                className="animate-fade-up"
              >
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: '#F5F5F5',
                    border: '1px solid #E8E8E8',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#666666',
                  }}
                >
                  <X size={12} />
                </button>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <CategoryBadge category={selected.category} size="xs" />
                  <GemScore score={selected.hidden_gem_score} size="sm" />
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0D0D0D', marginBottom: '6px', paddingRight: '28px' }}>
                  {selected.title}
                </h3>

                {selected.address && (
                  <p style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>
                    {selected.address}
                  </p>
                )}

                {selected.description && (
                  <p style={{ fontSize: '13px', color: '#666666', lineHeight: 1.55, marginBottom: '12px' }}>
                    {selected.description.slice(0, 120)}{selected.description.length > 120 ? '…' : ''}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#666666' }}>
                    {selected.price_level} · ★ {selected.rating?.toFixed(1)}
                  </span>
                  {selected.url && (
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        color: '#2660A8',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      <ExternalLink size={11} />
                      View details
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
