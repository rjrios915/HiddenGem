'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import ActivityCard from '@/components/feed/ActivityCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import MoodChips from '@/components/feed/MoodChips'
import type { RecommendationCard, UserPreferences, ActivityCategory } from '@/types'

interface FeedClientProps {
  preferences: UserPreferences
  savedActivityIds: string[]
}

// Module-level cache — survives navigation, reset by search/mood changes
let feedCache: RecommendationCard[] = []

const CATEGORY_OPTIONS: { value: ActivityCategory | 'all'; label: string }[] = [
  { value: 'all',        label: 'All'         },
  { value: 'food',       label: 'Food'        },
  { value: 'cafes',      label: 'Cafés'       },
  { value: 'outdoors',   label: 'Outdoors'    },
  { value: 'art',        label: 'Art'         },
  { value: 'music',      label: 'Music'       },
  { value: 'wellness',   label: 'Wellness'    },
  { value: 'nightlife',  label: 'Nightlife'   },
  { value: 'workshops',  label: 'Workshops'   },
]

export default function FeedClient({ preferences, savedActivityIds }: FeedClientProps) {
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>(feedCache)
  const [loading,          setLoading]         = useState(feedCache.length === 0)
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all')
  const [savedIds,         setSavedIds]        = useState<Set<string>>(new Set(savedActivityIds))
  const [searchQuery,      setSearchQuery]     = useState('')
  const [searchInput,      setSearchInput]     = useState('')
  const [activeMood,       setActiveMood]      = useState<string | null>(null)
  const [filtersOpen,      setFiltersOpen]     = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchRecommendations = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set('q', searchQuery.trim())
      if (activeMood) params.set('mood', activeMood)
      const res = await fetch(`/api/recommendations?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const recs = data.recommendations ?? []
      if (!searchQuery && !activeMood) feedCache = recs
      setRecommendations(recs)
    } catch (err) {
      console.error(err)
    }
  }, [searchQuery, activeMood])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearchQuery(value), 450)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  useEffect(() => {
    setLoading(true)
    fetchRecommendations().finally(() => setLoading(false))
  }, [fetchRecommendations])

  const handleSave = async (activityId: string) => {
    const isSaved = savedIds.has(activityId)
    setSavedIds(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(activityId) : next.add(activityId)
      return next
    })
    await fetch(`/api/save/${activityId}`, { method: isSaved ? 'DELETE' : 'POST' })
  }

  const handleDismiss = (activityId: string) => {
    setRecommendations(prev => prev.filter(a => a.id !== activityId))
    if (!searchQuery && !activeMood) feedCache = feedCache.filter(a => a.id !== activityId)
    fetch(`/api/dismiss/${activityId}`, { method: 'POST' })
  }

  const filtered = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(a => a.category === selectedCategory)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{
          paddingTop: '40px', marginBottom: '28px',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(32px, 4vw, 46px)',
            fontWeight: 500,
            color: '#0D0D0D',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '6px',
          }}>
            Your feed
          </h1>
          <p style={{ fontSize: '13px', color: '#666666', fontFamily: 'var(--font-sans)' }}>
            Hidden gems picked for you
          </p>
        </div>

        {/* ── Filter toggle ── */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setFiltersOpen(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '999px',
              fontSize: '13px', fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              color: filtersOpen || activeMood ? '#1A3050' : '#666666',
              background: filtersOpen || activeMood ? 'rgba(26,48,80,0.07)' : '#F5F5F5',
              border: filtersOpen || activeMood ? '1px solid rgba(26,48,80,0.2)' : '1px solid #E8E8E8',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            <SlidersHorizontal size={13} strokeWidth={2} />
            {activeMood ? 'Vibe active' : 'Filter by vibe'}
            {activeMood && (
              <span
                style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#1A3050', flexShrink: 0,
                }}
              />
            )}
          </button>

          {filtersOpen && (
            <div style={{ marginTop: '12px' }} className="animate-fade-up">
              <MoodChips activeMood={activeMood} onMoodChange={setActiveMood} />
            </div>
          )}
        </div>

        {/* ── Search bar ── */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search
            size={14}
            strokeWidth={2}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }}
          />
          <input
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search hidden gems…"
            style={{
              width: '100%', padding: '11px 40px',
              border: '1.5px solid #E8E8E8', borderRadius: '12px',
              fontSize: '14px', color: '#0D0D0D', fontFamily: 'var(--font-sans)',
              background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = '#1A3050')}
            onBlur={e => (e.target.style.borderColor = '#E8E8E8')}
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#999',
                display: 'flex', alignItems: 'center', padding: '2px',
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* ── Category filter tabs ── */}
        <div
          style={{
            display: 'flex', gap: '6px', overflowX: 'auto',
            paddingBottom: '4px', marginBottom: '32px',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORY_OPTIONS.map(({ value, label }) => {
            const active = selectedCategory === value
            return (
              <button
                key={value}
                onClick={() => setSelectedCategory(value as ActivityCategory | 'all')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  color: active ? '#FFFFFF' : '#666666',
                  background: active ? '#1A3050' : '#FFFFFF',
                  border: active ? '1px solid #1A3050' : '1px solid #E8E8E8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: active ? '0 2px 8px rgba(26,48,80,0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
                className={active ? '' : 'hover:border-[#6A9CC8] hover:text-[#1A3050]'}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: '#FFFFFF',
            border: '1px solid #E8E8E8',
            borderRadius: '16px',
          }}>
            <div style={{ marginBottom: '20px', opacity: 0.2, display: 'flex', justifyContent: 'center' }}>
              <svg width="56" height="38" viewBox="0 0 56 38" fill="none" stroke="#1A3050" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
                <path d="M11,1 L45,1 L56,16 L28,38 L0,16 Z" />
                <line x1="0" y1="16" x2="56" y2="16" />
                <line x1="11" y1="1" x2="38" y2="16" />
                <line x1="45" y1="1" x2="18" y2="16" />
                <line x1="18" y1="16" x2="28" y2="38" />
                <line x1="38" y1="16" x2="28" y2="38" />
              </svg>
            </div>
            <p style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, color: '#0D0D0D', marginBottom: '8px' }}>
              No gems found
            </p>
            <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', color: '#666666', marginBottom: '20px' }}>
              {selectedCategory !== 'all'
                ? 'No results in this category — try All or a different filter.'
                : activeMood
                  ? 'Nothing matching this vibe right now — try a different mood.'
                  : 'Try a different search or browse all categories.'}
            </p>
            {(selectedCategory !== 'all' || activeMood) && (
              <button
                onClick={() => { setSelectedCategory('all'); setActiveMood(null) }}
                style={{
                  padding: '8px 20px', borderRadius: '8px',
                  background: '#1A3050', color: 'white',
                  fontSize: '13px', fontWeight: 500,
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '18px',
          }}>
            {filtered.map((activity, i) => (
              <div key={activity.id} style={{ animationDelay: `${i * 40}ms` }}>
                <ActivityCard
                  activity={activity}
                  explanation={activity.explanation}
                  isSaved={savedIds.has(activity.id)}
                  onSave={handleSave}
                  onDismiss={handleDismiss}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
