import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateItinerary } from '@/lib/openai'
import type { UserPreferences, Activity } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt } = await request.json()
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const preferences: UserPreferences = profile?.preferences ?? {
      categories: [], budget: ['$', '$$'], indoor_outdoor: 'both',
      social_level: 'solo', time_preference: ['afternoon'], intensity: 'moderate',
    }

    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .order('hidden_gem_score', { ascending: false })
      .limit(30)

    const itinerary = await generateItinerary(prompt, (activities ?? []) as Activity[], preferences)
    return NextResponse.json({ itinerary })
  } catch (error) {
    console.error('[itinerary]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
