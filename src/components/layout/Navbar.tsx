'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Compass, Bookmark, Map, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import GemSvg from '@/components/ui/GemSvg'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/feed',      label: 'Feed',      Icon: Compass  },
  { href: '/saved',     label: 'Saved',     Icon: Bookmark },
  { href: '/itinerary', label: 'Itinerary', Icon: Sparkles },
  { href: '/map',       label: 'Map',       Icon: Map      },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user,     setUser]     = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/auth')
  }

  const avatarInitial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          height: '58px',
          display: 'flex',
          alignItems: 'center',
          paddingInline: '28px',
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
          borderBottom: `1px solid ${scrolled ? '#E8E8E8' : 'transparent'}`,
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Logo */}
        <Link
          href={user ? '/feed' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <GemSvg size={18} color="#1A3050" strokeWidth={1.6} />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '15px',
            letterSpacing: '-0.02em',
            color: '#0D0D0D',
          }}>
            Hidden<span style={{ color: '#2660A8' }}>Gem</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex" style={{ flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#1A3050' : '#666666',
                    textDecoration: 'none',
                    background: active ? 'rgba(26,48,80,0.07)' : 'transparent',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  className="hover:text-[#1A3050] hover:bg-[rgba(26,48,80,0.05)]"
                >
                  <Icon size={13} strokeWidth={active ? 2.2 : 1.5} />
                  {label}
                  {active && (
                    <span style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: '#2660A8',
                    }} />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {user ? (
            <button
              onClick={handleSignOut}
              title={`Sign out (${user.email})`}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1A3050',
                border: '2px solid #6A9CC8',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-[#122340] hover:scale-105"
            >
              {avatarInitial}
            </button>
          ) : (
            <Link
              href="/auth"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                color: '#1A3050',
                textDecoration: 'none',
                padding: '6px 16px',
                borderRadius: '8px',
                border: '1px solid #6A9CC8',
                background: 'transparent',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-[#1A3050] hover:text-white hover:border-[#1A3050]"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666666',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '58px',
            left: 0, right: 0,
            zIndex: 49,
            background: 'rgba(255,255,255,0.97)',
            borderBottom: '1px solid #E8E8E8',
            backdropFilter: 'blur(16px)',
            padding: '10px 16px 18px',
          }}
          className="animate-fade-up md:hidden"
        >
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#1A3050' : '#666666',
                  background: active ? 'rgba(26,48,80,0.07)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '2px',
                }}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            )
          })}
        </div>
      )}

      <div style={{ height: '58px' }} />
    </>
  )
}
