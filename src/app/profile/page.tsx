'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import CategoryBadge from '@/components/ui/CategoryBadge'
import SubmitGemModal from '@/components/gems/SubmitGemModal'
import { Plus, ExternalLink, Trash2, RotateCcw } from 'lucide-react'
import type { ActivityCategory, BudgetRange, IndoorOutdoor, SocialLevel, TimePreference, IntensityLevel, UserPreferences, Activity } from '@/types'

const CATEGORIES: { value: ActivityCategory; label: string; emoji: string }[] = [
  { value: 'music',        label: 'Music',        emoji: '🎵' },
  { value: 'art',          label: 'Art',          emoji: '🎨' },
  { value: 'cafes',        label: 'Cafés',        emoji: '☕' },
  { value: 'outdoors',     label: 'Outdoors',     emoji: '🌿' },
  { value: 'fitness',      label: 'Fitness',      emoji: '💪' },
  { value: 'volunteering', label: 'Volunteering', emoji: '🤝' },
  { value: 'nightlife',    label: 'Nightlife',    emoji: '🌙' },
  { value: 'food',         label: 'Food',         emoji: '🍜' },
  { value: 'workshops',    label: 'Workshops',    emoji: '🔧' },
  { value: 'gaming',       label: 'Gaming',       emoji: '🎮' },
  { value: 'wellness',     label: 'Wellness',     emoji: '🧘' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab,    setActiveTab]    = useState<'preferences' | 'gems' | 'dismissed'>('preferences')
  const [email,        setEmail]        = useState('')
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [myGems,       setMyGems]       = useState<Activity[]>([])
  const [dismissed,    setDismissed]    = useState<{ activity_id: string; activity: Activity }[]>([])
  const [dismissedLoaded, setDismissedLoaded] = useState(false)
  const [submitOpen,   setSubmitOpen]   = useState(false)
  const [categories,   setCategories]   = useState<ActivityCategory[]>([])
  const [budget,       setBudget]       = useState<BudgetRange[]>([])
  const [indoorOutdoor,setIndoorOutdoor]= useState<IndoorOutdoor>('both')
  const [socialLevel,  setSocialLevel]  = useState<SocialLevel>('solo')
  const [intensity,    setIntensity]    = useState<IntensityLevel>('moderate')
  const [times,        setTimes]        = useState<TimePreference[]>([])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      setEmail(user.email ?? '')
      const { data } = await sb.from('profiles').select('preferences').eq('id', user.id).single()
      const prefs: UserPreferences = data?.preferences ?? {}
      setCategories(prefs.categories ?? [])
      setBudget(prefs.budget ?? [])
      setIndoorOutdoor(prefs.indoor_outdoor ?? 'both')
      setSocialLevel(prefs.social_level ?? 'solo')
      setIntensity(prefs.intensity ?? 'moderate')
      setTimes(prefs.time_preference ?? [])

      const { data: gems } = await sb
        .from('activities')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })
      setMyGems((gems ?? []) as Activity[])
      setLoading(false)
    })
  }, [router])

  const handleDeleteGem = async (id: string) => {
    const sb = createClient()
    await sb.from('activities').delete().eq('id', id)
    setMyGems(prev => prev.filter(g => g.id !== id))
  }

  const loadDismissed = async () => {
    if (dismissedLoaded) return
    const res = await fetch('/api/dismiss')
    const data = await res.json()
    setDismissed(data.dismissed ?? [])
    setDismissedLoaded(true)
  }

  const handleUndoDismiss = async (activityId: string) => {
    setDismissed(prev => prev.filter(d => d.activity_id !== activityId))
    await fetch(`/api/dismiss/${activityId}`, { method: 'DELETE' })
  }

  const toggle = <T,>(val: T, list: T[], set: (v: T[]) => void) =>
    set(list.includes(val) ? list.filter(x => x !== val) : [...list, val])

  const handleSave = async () => {
    setSaving(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('profiles').update({
      preferences: { categories, budget, indoor_outdoor: indoorOutdoor, social_level: socialLevel, intensity, time_preference: times },
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/auth')
  }

  const chip = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '10px',
    border: active ? '1px solid #6A9CC8' : '1px solid #E8E8E8',
    background: active ? '#DCE8F5' : '#FFFFFF',
    color: active ? '#1A3050' : '#666666',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    cursor: 'pointer', transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
    boxShadow: active ? '0 1px 4px rgba(26,48,80,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
  })

  const option = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 12px', borderRadius: '9px', textAlign: 'center',
    border: active ? '1px solid #6A9CC8' : '1px solid #E8E8E8',
    background: active ? '#DCE8F5' : '#FFFFFF',
    color: active ? '#1A3050' : '#666666',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    cursor: 'pointer', transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
  })

  const section = (label: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '28px' }}>
      <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', color: '#999', textTransform: 'uppercase', marginBottom: '12px' }}>
        {label}
      </p>
      {children}
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px 100px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 500,
          color: '#0D0D0D', letterSpacing: '-0.02em', marginBottom: '6px',
        }}>
          Your profile
        </h1>
        <p style={{ fontSize: '13px', color: '#666666', marginBottom: '24px' }}>{email}</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {([
            { key: 'preferences', label: 'Preferences' },
            { key: 'gems',        label: `My Gems${myGems.length > 0 ? ` (${myGems.length})` : ''}` },
            { key: 'dismissed',   label: `Dismissed${dismissed.length > 0 ? ` (${dismissed.length})` : ''}` },
          ] as const).map(({ key, label }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key)
                  if (key === 'dismissed') loadDismissed()
                }}
                style={{
                  padding: '8px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: active ? 600 : 400,
                  color: active ? '#FFFFFF' : '#666666',
                  background: active ? '#1A3050' : '#FFFFFF',
                  border: active ? '1px solid #1A3050' : '1px solid #E8E8E8',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                  boxShadow: active ? '0 2px 8px rgba(26,48,80,0.2)' : 'none',
                }}>
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 1px 4px rgba(26,48,80,0.06), 0 4px 16px rgba(26,48,80,0.06)', marginBottom: '16px' }}>

          {activeTab === 'gems' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#666666' }}>
                  {myGems.length === 0 ? 'You haven\'t submitted any gems yet.' : `${myGems.length} gem${myGems.length !== 1 ? 's' : ''} submitted`}
                </p>
                <button
                  onClick={() => setSubmitOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    background: '#1A3050', color: '#FFFFFF', border: 'none',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', boxShadow: '0 2px 8px rgba(26,48,80,0.2)',
                  }}
                  className="hover:bg-[#122340]"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Add a gem
                </button>
              </div>

              {myGems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#999' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '17px', color: '#0D0D0D', marginBottom: '8px' }}>
                    Know a spot worth sharing?
                  </p>
                  <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
                    Submit hidden gems that aren't on mainstream platforms.<br />Your picks help the whole community discover something new.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myGems.map(gem => (
                    <div key={gem.id} style={{
                      display: 'flex', gap: '14px', alignItems: 'flex-start',
                      padding: '14px', borderRadius: '12px', border: '1px solid #F0F0F0',
                      background: '#FAFAFA',
                    }}>
                      {gem.image_url && (
                        <img src={gem.image_url} alt={gem.title} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0D0D' }}>{gem.title}</p>
                          <CategoryBadge category={gem.category} size="xs" />
                        </div>
                        <p style={{ fontSize: '12px', color: '#666666', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                          {gem.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {gem.url && (
                          <a href={gem.url} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666666' }} className="hover:text-[#1A3050]">
                            <ExternalLink size={12} strokeWidth={2} />
                          </a>
                        )}
                        <button onClick={() => handleDeleteGem(gem.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666666', cursor: 'pointer' }} className="hover:text-[#C4734A] hover:border-[#C4734A]">
                          <Trash2 size={12} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'dismissed' && (
            <div>
              <p style={{ fontSize: '13px', color: '#666666', marginBottom: '20px' }}>
                {dismissed.length === 0
                  ? 'No dismissed gems yet.'
                  : `${dismissed.length} gem${dismissed.length !== 1 ? 's' : ''} hidden from your feed`}
              </p>

              {dismissed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '17px', color: '#0D0D0D', marginBottom: '8px' }}>
                    Nothing hidden yet
                  </p>
                  <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.6 }}>
                    Hit × on any feed card to hide it. Dismissed gems are excluded from future recommendations.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dismissed.map(({ activity_id, activity: gem }) => (
                    <div key={activity_id} style={{
                      display: 'flex', gap: '14px', alignItems: 'center',
                      padding: '12px 14px', borderRadius: '12px',
                      border: '1px solid #F0F0F0', background: '#FAFAFA',
                    }}>
                      {gem.image_url ? (
                        <img src={gem.image_url} alt={gem.title} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, opacity: 0.7 }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#EFEFEF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', opacity: 0.5 }}>
                          ✕
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#666666', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {gem.title}
                        </p>
                        <CategoryBadge category={gem.category} size="xs" />
                      </div>
                      <button
                        onClick={() => handleUndoDismiss(activity_id)}
                        title="Restore to feed"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '7px 12px', borderRadius: '8px',
                          background: '#FFFFFF', border: '1px solid #E8E8E8',
                          fontSize: '12px', fontWeight: 600, color: '#1A3050',
                          cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}
                        className="hover:border-[#6A9CC8] hover:bg-[#F0F6FF]"
                      >
                        <RotateCcw size={11} strokeWidth={2.5} />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && section('Interests', (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map(({ value, label, emoji }) => (
                <button key={value} onClick={() => toggle(value, categories, setCategories)} style={chip(categories.includes(value))}>
                  <span>{emoji}</span> {label}
                </button>
              ))}
            </div>
          ))}

          {activeTab === 'preferences' && section('Budget', (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {([['free', 'Free'], ['$', 'Under $15'], ['$$', '$15–$40'], ['$$$', '$40+']] as [BudgetRange, string][]).map(([val, label]) => (
                <button key={val} onClick={() => toggle(val, budget, setBudget)} style={chip(budget.includes(val))}>{label}</button>
              ))}
            </div>
          ))}

          {activeTab === 'preferences' && section('Setting', (
            <div style={{ display: 'flex', gap: '8px' }}>
              {([['indoor', '🏠 Indoor'], ['outdoor', '🌿 Outdoor'], ['both', '✨ Both']] as [IndoorOutdoor, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setIndoorOutdoor(val)} style={option(indoorOutdoor === val)}>{label}</button>
              ))}
            </div>
          ))}

          {activeTab === 'preferences' && section('Social energy', (
            <div style={{ display: 'flex', gap: '8px' }}>
              {([['solo', '🎧 Solo'], ['small_group', '👥 Small group'], ['large_group', '🎉 Large group']] as [SocialLevel, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setSocialLevel(val)} style={option(socialLevel === val)}>{label}</button>
              ))}
            </div>
          ))}

          {activeTab === 'preferences' && section('Intensity', (
            <div style={{ display: 'flex', gap: '8px' }}>
              {([['chill', '🛋️ Chill'], ['moderate', '🚶 Moderate'], ['active', '🏃 Active']] as [IntensityLevel, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setIntensity(val)} style={option(intensity === val)}>{label}</button>
              ))}
            </div>
          ))}

          {activeTab === 'preferences' && section('Time of day', (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {([['morning', '🌅 Morning'], ['afternoon', '☀️ Afternoon'], ['evening', '🌆 Evening'], ['late_night', '🌙 Late night']] as [TimePreference, string][]).map(([val, label]) => (
                <button key={val} onClick={() => toggle(val, times, setTimes)} style={chip(times.includes(val))}>{label}</button>
              ))}
            </div>
          ))}

          {activeTab === 'preferences' && (
            <Button variant="primary" loading={saving} onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
              {saved ? '✓ Saved!' : 'Save changes'}
            </Button>
          )}
        </div>

        <SubmitGemModal
          isOpen={submitOpen}
          onClose={() => setSubmitOpen(false)}
          onSuccess={async () => {
            const sb = createClient()
            const { data: { user } } = await sb.auth.getUser()
            if (!user) return
            const { data } = await sb.from('activities').select('*').eq('submitted_by', user.id).order('created_at', { ascending: false })
            setMyGems((data ?? []) as Activity[])
          }}
        />

        <button
          onClick={handleSignOut}
          style={{
            width: '100%', padding: '12px',
            background: 'none', border: '1px solid #E8E8E8',
            borderRadius: '10px', fontSize: '13px', color: '#666666',
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            transition: 'all 0.15s ease',
          }}
          className="hover:border-[#C4734A] hover:text-[#C4734A]"
        >
          Sign out
        </button>

      </div>
    </div>
  )
}
