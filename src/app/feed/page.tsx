export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedClient from './FeedClient'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_complete) redirect('/onboarding')

  const { data: savedIds } = await supabase
    .from('saved_activities')
    .select('activity_id')
    .eq('user_id', user.id)

  return (
    <FeedClient
      preferences={profile.preferences}
      savedActivityIds={(savedIds ?? []).map((s) => s.activity_id)}
    />
  )
}
