export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ActivityCard from '@/components/feed/ActivityCard'
import Link from 'next/link'

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: saved } = await supabase
    .from('saved_activities')
    .select('*, activity:activities(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: logged } = await supabase
    .from('logged_experiences')
    .select('*, activity:activities(*)')
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false })
    .limit(6)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 60px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>Saved</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '32px' }}>Your bookmarked gems</p>

        {/* Saved activities grid */}
        {saved && saved.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '48px' }}>
            {saved.map((s) => s.activity && (
              <ActivityCard
                key={s.id}
                activity={s.activity}
                isSaved={true}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              marginBottom: '48px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.2 }}>
              <svg width="48" height="33" viewBox="0 0 56 38" fill="none" stroke="#1A3050" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
                <path d="M11,1 L45,1 L56,16 L28,38 L0,16 Z" />
                <line x1="0" y1="16" x2="56" y2="16" />
                <line x1="11" y1="1" x2="38" y2="16" />
                <line x1="45" y1="1" x2="18" y2="16" />
                <line x1="18" y1="16" x2="28" y2="38" />
                <line x1="38" y1="16" x2="28" y2="38" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '17px', fontWeight: 500, color: '#1A1A14', marginBottom: '8px' }}>No saved gems yet</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Bookmark activities from your feed to see them here.</p>
            <Link
              href="/feed"
              style={{
                display: 'inline-flex',
                padding: '8px 20px',
                borderRadius: '8px',
                background: '#1A3050',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Browse feed
            </Link>
          </div>
        )}

        {/* Recent logged experiences */}
        {logged && logged.length > 0 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '4px' }}>
              Recent experiences
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Places you've logged</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logged.map((log) => log.activity && (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    alignItems: 'center',
                  }}
                >
                  {/* Category color block */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(26,48,80,0.07)',
                    border: '1px solid rgba(26,48,80,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    ◆
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.activity.title}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {log.visited_at} · {'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}
                    </p>
                  </div>

                  {log.reflection && (
                    <p style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{log.reflection}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
