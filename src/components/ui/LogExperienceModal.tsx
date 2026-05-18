'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import type { Activity } from '@/types'

interface Props {
  activity: Activity
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LogExperienceModal({ activity, isOpen, onClose, onSuccess }: Props) {
  const [rating,     setRating]     = useState(0)
  const [hover,      setHover]      = useState(0)
  const [reflection, setReflection] = useState('')
  const [visitedAt,  setVisitedAt]  = useState(new Date().toISOString().split('T')[0])
  const [loading,    setLoading]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!rating) { setError('Please add a rating.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/log-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_id: activity.id, rating, reflection, visited_at: visitedAt }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save')
      }
      setDone(true)
      setTimeout(() => { onSuccess?.(); onClose() }, 1400)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,10,14,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
        className="animate-fade-up"
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#6A9CC8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Log visit
            </p>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#0D0D0D', lineHeight: 1.3, fontFamily: 'var(--font-sans)' }}>
              {activity.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#F5F5F5', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#666666', flexShrink: 0, marginLeft: '12px',
            }}
            className="hover:bg-[#EBEBEB]"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>✓</div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '18px', color: '#0D0D0D' }}>
                Experience logged!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Star rating */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '10px' }}>
                  How was it?
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px', transition: 'transform 0.1s ease',
                        transform: hover >= n || rating >= n ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      <Star
                        size={28}
                        strokeWidth={1.5}
                        fill={(hover || rating) >= n ? '#F5A623' : 'none'}
                        stroke={(hover || rating) >= n ? '#F5A623' : '#D0D0D0'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '8px' }}>
                  When did you go?
                </label>
                <input
                  type="date"
                  value={visitedAt}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setVisitedAt(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1px solid #E8E8E8', borderRadius: '10px',
                    fontSize: '14px', color: '#0D0D0D', fontFamily: 'var(--font-sans)',
                    background: '#FAFAFA', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Reflection */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '8px' }}>
                  Notes <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="What made it special?"
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1px solid #E8E8E8', borderRadius: '10px',
                    fontSize: '14px', color: '#0D0D0D', fontFamily: 'var(--font-sans)',
                    background: '#FAFAFA', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', lineHeight: 1.5,
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '13px', color: '#C4734A', margin: 0 }}>{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#6A9CC8' : '#1A3050',
                  color: '#FFFFFF', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                  boxShadow: '0 2px 8px rgba(26,48,80,0.25)',
                }}
                className={loading ? '' : 'hover:bg-[#122340]'}
              >
                {loading ? 'Saving…' : 'Save experience'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
