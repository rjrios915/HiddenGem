export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SavedClient from './SavedClient'

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

  const savedList = (saved ?? [])
    .filter((s) => s.activity)
    .map((s) => ({ id: s.id, activity: s.activity! }))

  const loggedList = (logged ?? [])
    .filter((l) => l.activity)
    .map((l) => ({
      id: l.id,
      activity: l.activity!,
      visited_at: l.visited_at,
      rating: l.rating,
      reflection: l.reflection,
    }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 60px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          marginBottom: '4px',
          color: '#0D0D0D',
        }}>
          Saved
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '32px' }}>Your bookmarked gems</p>

        <SavedClient initialSaved={savedList} logged={loggedList} />
      </div>
    </div>
  )
}
