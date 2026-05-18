'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import type { ActivityCategory, BudgetRange, IndoorOutdoor, SocialLevel, TimePreference, IntensityLevel, UserPreferences } from '@/types'

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
  const [email,        setEmail]        = useState('')
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
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
      setLoading(false)
    })
  }, [router])

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
        <p style={{ fontSize: '13px', color: '#666666', marginBottom: '36px' }}>{email}</p>

        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 1px 4px rgba(26,48,80,0.06), 0 4px 16px rgba(26,48,80,0.06)', marginBottom: '16px' }}>

          {section('Interests', (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map(({ value, label, emoji }) => (
                <button key={value} onClick={() => toggle(value, categories, setCategories)} style={chip(categories.includes(value))}>
                  <span>{emoji}</span> {label}
                </button>
              ))}
            </div>
          ))}

          {section('Budget', (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {([['free', 'Free'], ['$', 'Under $15'], ['$$', '$15–$40'], ['$$$', '$40+']] as [BudgetRange, string][]).map(([val, label]) => (
                <button key={val} onClick={() => toggle(val, budget, setBudget)} style={chip(budget.includes(val))}>{label}</button>
              ))}
            </div>
          ))}

          {section('Setting', (
            <div style={{ display: 'flex', gap: '8px' }}>
              {([['indoor', '🏠 Indoor'], ['outdoor', '🌿 Outdoor'], ['both', '✨ Both']] as [IndoorOutdoor, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setIndoorOutdoor(val)} style={option(indoorOutdoor === val)}>{label}</button>
              ))}
            </div>
          ))}

          {section('Social energy', (
            <div style={{ display: 'flex', gap: '8px' }}>
              {([['solo', '🎧 Solo'], ['small_group', '👥 Small group'], ['large_group', '🎉 Large group']] as [SocialLevel, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setSocialLevel(val)} style={option(socialLevel === val)}>{label}</button>
              ))}
            </div>
          ))}

          {section('Intensity', (
            <div style={{ display: 'flex', gap: '8px' }}>
              {([['chill', '🛋️ Chill'], ['moderate', '🚶 Moderate'], ['active', '🏃 Active']] as [IntensityLevel, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setIntensity(val)} style={option(intensity === val)}>{label}</button>
              ))}
            </div>
          ))}

          {section('Time of day', (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {([['morning', '🌅 Morning'], ['afternoon', '☀️ Afternoon'], ['evening', '🌆 Evening'], ['late_night', '🌙 Late night']] as [TimePreference, string][]).map(([val, label]) => (
                <button key={val} onClick={() => toggle(val, times, setTimes)} style={chip(times.includes(val))}>{label}</button>
              ))}
            </div>
          ))}

          <Button variant="primary" loading={saving} onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
            {saved ? '✓ Saved!' : 'Save changes'}
          </Button>
        </div>

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
