'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { ActivityCategory, BudgetRange, IndoorOutdoor, SocialLevel, TimePreference, IntensityLevel } from '@/types'

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

const STEPS = ['Interests', 'Budget & Vibe', 'Schedule']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [budget, setBudget] = useState<BudgetRange[]>([])
  const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor>('both')
  const [socialLevel, setSocialLevel] = useState<SocialLevel>('solo')
  const [intensity, setIntensity] = useState<IntensityLevel>('chill')
  const [times, setTimes] = useState<TimePreference[]>([])

  const toggleCategory = (cat: ActivityCategory) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])

  const toggleBudget = (b: BudgetRange) =>
    setBudget((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])

  const toggleTime = (t: TimePreference) =>
    setTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  const handleFinish = async () => {
    setLoading(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/auth'); return }

    await sb
      .from('profiles')
      .update({
        onboarding_complete: true,
        preferences: { categories, budget, indoor_outdoor: indoorOutdoor, social_level: socialLevel, intensity, time_preference: times },
      })
      .eq('id', user.id)

    router.push('/feed')
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: active ? '1px solid #6A9CC8' : '1px solid #E4DFD4',
    background: active ? '#DCE8F5' : '#FFFFFF',
    color: active ? '#1A3050' : '#7A7A68',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
    boxShadow: active ? '0 1px 4px rgba(26,48,80,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
  })

  const optionStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 16px',
    borderRadius: '9px',
    border: active ? '1px solid #6A9CC8' : '1px solid #E4DFD4',
    background: active ? '#DCE8F5' : '#FFFFFF',
    color: active ? '#1A3050' : '#7A7A68',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
  })

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '540px' }} className="animate-fade-up">
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <svg width="28" height="34" viewBox="0 0 44 52" fill="none" stroke="#1A3050" strokeWidth="1.5" strokeLinejoin="round">
              <path d="M6,16 L16,2 L28,2 L38,16 L44,28 L22,52 L0,28 Z" />
              <line x1="0" y1="28" x2="44" y2="28" /><line x1="0" y1="28" x2="22" y2="16" />
              <line x1="44" y1="28" x2="22" y2="16" /><line x1="16" y1="2" x2="22" y2="16" />
              <line x1="28" y1="2" x2="22" y2="16" /><line x1="10" y1="28" x2="22" y2="52" />
              <line x1="34" y1="28" x2="22" y2="52" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '6px', color: '#1A1A14' }}>
            Let's personalize your feed
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '999px',
                background: i <= step ? '#2660A8' : '#E4DFD4',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px 24px',
            marginBottom: '20px',
          }}
        >
          {/* Step 0 — Interests */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>What do you enjoy?</h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Pick anything that sounds like you.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CATEGORIES.map(({ value, label, emoji }) => (
                  <button key={value} onClick={() => toggleCategory(value)} style={chipStyle(categories.includes(value))}>
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Budget & Vibe */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Budget range</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px' }}>Select all that work for you.</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {([['free', 'Free'], ['$', 'Under $15'], ['$$', '$15–$40'], ['$$$', '$40+']] as [BudgetRange, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => toggleBudget(val)} style={chipStyle(budget.includes(val))}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Setting preference</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {([['indoor', '🏠 Indoor'], ['outdoor', '🌿 Outdoor'], ['both', '✨ Both']] as [IndoorOutdoor, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => setIndoorOutdoor(val)} style={optionStyle(indoorOutdoor === val)}>{label}</button>
                  ))}
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Social energy</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {([['solo', '🎧 Solo'], ['small_group', '👥 Small group'], ['large_group', '🎉 Large group']] as [SocialLevel, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => setSocialLevel(val)} style={optionStyle(socialLevel === val)}>{label}</button>
                  ))}
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Intensity level</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {([['chill', '🛋️ Chill'], ['moderate', '🚶 Moderate'], ['active', '🏃 Active']] as [IntensityLevel, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => setIntensity(val)} style={optionStyle(intensity === val)}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Schedule */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>When do you like to go out?</h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Pick all that apply.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {([['morning', '🌅 Morning'], ['afternoon', '☀️ Afternoon'], ['evening', '🌆 Evening'], ['late_night', '🌙 Late night']] as [TimePreference, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => toggleTime(val)} style={chipStyle(times.includes(val))}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>Continue →</Button>
          ) : (
            <Button variant="primary" loading={loading} onClick={handleFinish}>
              Find my hidden gems ◆
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
