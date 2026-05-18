import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateItinerary, generateEmbedding } from '@/lib/openai'
import type { UserPreferences } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await request.json()
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const preferences: UserPreferences = profile?.preferences ?? {}

  // Get relevant activities via vector search
  let activities: import('@/types').Activity[] = []
  try {
    const embedding = await generateEmbedding(prompt)
    const { data } = await supabase.rpc('match_activities', {
      query_embedding: embedding,
      match_count: 15,
      filter_category: null,
    })
    activities = (data ?? []) as import('@/types').Activity[]
  } catch {
    // Fallback to top-scored activities
    const { data } = await supabase
      .from('activities')
      .select('*')
      .order('hidden_gem_score', { ascending: false })
      .limit(15)
    activities = (data ?? []) as import('@/types').Activity[]
  }

  if (activities.length === 0) {
    return NextResponse.json({ error: 'No activities found' }, { status: 404 })
  }

  const itinerary = await generateItinerary(prompt, activities, preferences)

  // Save to DB
  await supabase.from('itineraries').insert({
    user_id: user.id,
    title: itinerary.title,
    prompt,
    itinerary_data: itinerary,
  })

  return NextResponse.json({ itinerary })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('itineraries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ itineraries: data ?? [] })
}
