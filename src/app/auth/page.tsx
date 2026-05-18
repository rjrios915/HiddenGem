'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      if (password !== confirm) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      const { error } = await createClient().auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Check your email to confirm your account.')
      }
    } else {
      const { error } = await createClient().auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/feed')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(106,156,200,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '36px 32px',
        }}
        className="animate-fade-up"
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <svg width="36" height="24" viewBox="0 0 56 38" fill="none" stroke="#1A3050" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
              <path d="M11,1 L45,1 L56,16 L28,38 L0,16 Z" />
              <line x1="0" y1="16" x2="56" y2="16" />
              <line x1="11" y1="1" x2="38" y2="16" />
              <line x1="45" y1="1" x2="18" y2="16" />
              <line x1="18" y1="16" x2="28" y2="38" />
              <line x1="38" y1="16" x2="28" y2="38" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#0D0D0D' }}>
            Hidden<span style={{ color: '#2660A8' }}>Gem</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>
            {mode === 'signin' ? 'Welcome back.' : 'Start discovering.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '9px',
            padding: '3px',
            marginBottom: '24px',
          }}
        >
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); setConfirm('') }}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: mode === m ? 500 : 400,
                color: mode === m ? 'var(--text)' : 'var(--muted)',
                background: mode === m ? 'var(--card)' : 'transparent',
                border: mode === m ? '1px solid var(--border)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6A9CC8')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E8E8')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6A9CC8')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E8E8')}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  border: `1px solid ${confirm && confirm !== password ? '#D4855A' : '#E8E8E8'}`,
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = confirm && confirm !== password ? '#D4855A' : '#6A9CC8')}
                onBlur={(e) => (e.target.style.borderColor = confirm && confirm !== password ? '#D4855A' : '#E8E8E8')}
              />
              {confirm && confirm !== password && (
                <p style={{ fontSize: '11px', color: '#9A3B1E', marginTop: '5px' }}>
                  Passwords don't match
                </p>
              )}
            </div>
          )}

          {error && (
            <p style={{ fontSize: '13px', color: '#9A3B1E', padding: '8px 12px', background: '#FAECE4', borderRadius: '7px', border: '1px solid #D4855A' }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ fontSize: '13px', color: '#1A3050', padding: '8px 12px', background: '#DCE8F5', borderRadius: '7px', border: '1px solid #6A9CC8' }}>
              {success}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '4px' }}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </div>
    </main>
  )
}
