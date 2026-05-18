export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GemSvg from '@/components/ui/GemSvg'

const FEATURES = [
  {
    icon: '◈',
    title: 'AI-ranked hidden gems',
    desc: 'Every spot is scored on uniqueness, novelty, and local engagement — not just star ratings.',
  },
  {
    icon: '✦',
    title: 'Personalized for you',
    desc: 'Tell us your vibe once. Your feed, itineraries, and recommendations adapt to you.',
  },
  {
    icon: '⊹',
    title: 'Itinerary generator',
    desc: 'Type "relaxed solo Sunday" and get a full day plan built from real hidden gems near you.',
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', overflow: 'hidden' }}>
      {/* ── Nav strip ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 36px',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <GemSvg size={18} color="#1A3050" strokeWidth={1.6} />
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: '#0D0D0D' }}>
            Hidden<span style={{ color: '#2660A8' }}>Gem</span>
          </span>
        </div>
        <Link
          href="/auth"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px', fontWeight: 600,
            color: '#1A3050', textDecoration: 'none',
            padding: '7px 18px', borderRadius: '8px',
            border: '1px solid #6A9CC8',
            transition: 'all 0.15s ease',
          }}
          className="hover:bg-[#1A3050] hover:text-white hover:border-[#1A3050]"
        >
          Sign in
        </Link>
      </header>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 36px 80px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '48px',
        alignItems: 'center',
      }}>
        {/* Background organic blob */}
        <div style={{
          position: 'absolute',
          top: '-80px', right: '-120px',
          width: '580px', height: '580px',
          background: 'radial-gradient(ellipse at center, rgba(106,156,200,0.1) 0%, rgba(106,156,200,0) 70%)',
          borderRadius: '60% 40% 50% 50% / 40% 60% 40% 60%',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Gem — decorative, floats */}
        <div
          style={{
            position: 'absolute',
            top: '10px', right: '60px',
            opacity: 0.12,
            zIndex: 0,
          }}
          className="animate-float"
        >
          <GemSvg size={200} color="#1A3050" strokeWidth={0.8} />
        </div>

        {/* Left — text */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(26,48,80,0.06)', border: '1px solid rgba(26,48,80,0.18)',
              borderRadius: '999px', padding: '4px 12px',
              fontSize: '12px', fontWeight: 600, color: '#1A3050',
              fontFamily: 'var(--font-sans)', letterSpacing: '0.04em',
              textTransform: 'uppercase', marginBottom: '28px',
            }}
            className="animate-fade-up"
          >
            <GemSvg size={11} color="#2660A8" strokeWidth={1.8} />
            AI-powered local discovery
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(42px, 6vw, 76px)',
              fontWeight: 500,
              color: '#0D0D0D',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: '24px',
              animationDelay: '60ms',
            }}
            className="animate-fade-up"
          >
            Discover places<br />
            <span style={{ color: '#1A3050' }}>worth remembering.</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              color: '#666666',
              lineHeight: 1.7,
              maxWidth: '480px',
              marginBottom: '40px',
              animationDelay: '120ms',
            }}
            className="animate-fade-up"
          >
            Underrated cafés, local events, and neighbourhood spots — curated by AI,
            ranked by how hidden they actually are, and personalised to your taste.
          </p>

          {/* CTAs */}
          <div
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', animationDelay: '180ms' }}
            className="animate-fade-up"
          >
            <Link
              href="/auth"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '13px 28px', borderRadius: '10px',
                background: '#1A3050', color: '#FFFFFF',
                fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-sans)',
                textDecoration: 'none', letterSpacing: '0.01em',
                boxShadow: '0 2px 8px rgba(26,48,80,0.25), 0 6px 24px rgba(26,48,80,0.12)',
                transition: 'all 0.2s ease',
              }}
              className="hover:bg-[#122340] hover:-translate-y-px"
            >
              Start discovering
              <GemSvg size={14} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
            </Link>
            <Link
              href="/auth"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '13px 24px', borderRadius: '10px',
                border: '1px solid #D0D0D0', color: '#666666',
                fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-sans)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              className="hover:border-[#6A9CC8] hover:text-[#1A3050] hover:bg-[rgba(26,48,80,0.05)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #E8E8E8, transparent)', margin: '0 36px' }} />

      {/* ── Features ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 36px 80px' }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#666666',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '36px',
          }}
        >
          What makes it different
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E8E8',
                borderRadius: '16px',
                padding: '28px 26px',
                boxShadow: '0 1px 4px rgba(26,48,80,0.04)',
                animationDelay: `${i * 80}ms`,
              }}
              className="animate-fade-up"
            >
              <div style={{
                width: '40px', height: '40px',
                background: 'rgba(26,48,80,0.06)',
                border: '1px solid rgba(26,48,80,0.15)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
                marginBottom: '16px',
                color: '#1A3050',
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px', fontWeight: 600,
                color: '#0D0D0D',
                marginBottom: '8px',
                letterSpacing: '-0.01em',
              }}>
                {f.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px', color: '#666666',
                lineHeight: 1.6,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
