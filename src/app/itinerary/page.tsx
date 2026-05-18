'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import GemScore from '@/components/ui/GemScore'
import CategoryBadge from '@/components/ui/CategoryBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Itinerary } from '@/types'
import { Sparkles, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'

const PROMPT_SUGGESTIONS = [
  'Relaxing solo Saturday',
  'Cheap date night',
  'Creative afternoon',
  'Outdoor weekend adventure',
  'Late-night exploration',
  'Budget-friendly day out',
]

export default function ItineraryPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState('')
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setItinerary(null)

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setItinerary(data.itinerary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 20px 60px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#0D0D0D', marginBottom: '6px' }}>
            Itinerary generator
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Describe your ideal day and AI will build a personalized hidden gem itinerary.
          </p>
        </div>

        {/* Input */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A chill solo Saturday — low-key, budget-friendly, maybe some art or a cozy café…"
            rows={3}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 14px',
              color: 'var(--text)',
              fontSize: '14px',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              marginBottom: '14px',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6A9CC8')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />

          {/* Suggestion chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {PROMPT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  background: '#F5F5F5',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                className="hover:text-[var(--text)] hover:border-[rgba(38,96,168,0.25)]"
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={handleGenerate}
            loading={loading}
            disabled={!prompt.trim()}
            style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
          >
            <Sparkles size={15} />
            Generate itinerary
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <LoadingSpinner message="Building your itinerary..." />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 16px',
            background: '#FAECE4',
            border: '1px solid #D4855A',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#9A3B1E',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {/* Itinerary result */}
        {itinerary && (
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid rgba(38,96,168,0.2)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
            className="animate-fade-up"
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(38,96,168,0.04)',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>
                {itinerary.title}
              </h2>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
                  <Clock size={13} strokeWidth={1.5} />
                  {itinerary.estimated_duration}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
                  <DollarSign size={13} strokeWidth={1.5} />
                  {itinerary.estimated_cost}
                </span>
              </div>
            </div>

            {/* Activities */}
            <div style={{ padding: '8px 0' }}>
              {itinerary.activities.map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: i < itinerary.activities.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <button
                    onClick={() => setExpandedActivity(expandedActivity === i ? null : i)}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      color: 'var(--text)',
                    }}
                  >
                    {/* Time */}
                    <div style={{ flexShrink: 0, width: '48px', textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                        {item.start_time}
                      </span>
                    </div>

                    {/* Timeline dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#2660A8',
                        boxShadow: '0 0 8px rgba(38,96,168,0.3)',
                      }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          {item.activity?.title ?? 'Activity'}
                        </span>
                        {item.activity && <CategoryBadge category={item.activity.category} size="xs" />}
                        {item.activity && <GemScore score={item.activity.hidden_gem_score} size="sm" />}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {item.duration_minutes} min · {item.activity?.price_level ?? '–'}
                      </span>
                    </div>

                    {expandedActivity === i ? <ChevronUp size={14} color="var(--muted)" /> : <ChevronDown size={14} color="var(--muted)" />}
                  </button>

                  {expandedActivity === i && item.notes && (
                    <div style={{ padding: '0 24px 16px 88px' }}>
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        fontStyle: 'italic',
                        borderLeft: '2px solid rgba(38,96,168,0.25)',
                        paddingLeft: '12px',
                      }}>
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reasoning footer */}
            {itinerary.reasoning && (
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
                background: 'rgba(38,96,168,0.04)',
              }}>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  <span style={{ color: '#2660A8', fontWeight: 600 }}>◈ Why this itinerary: </span>
                  {itinerary.reasoning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
