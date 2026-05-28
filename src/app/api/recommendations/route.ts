import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, generateActivityExplanation } from '@/lib/openai'
import type { UserPreferences } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const preferences: UserPreferences = profile?.preferences ?? {}
    const category = request.nextUrl.searchParams.get('category')
    const searchQuery = request.nextUrl.searchParams.get('q')
    const mood = request.nextUrl.searchParams.get('mood')

    const { data: dismissedRows } = await supabase
      .from('dismissed_activities')
      .select('activity_id, activity:activities(category)')
      .eq('user_id', user.id)

    const dismissedIds = new Set((dismissedRows ?? []).map((r) => r.activity_id))

    // Count dismissals per category — categories with 2+ dismissals become negative signals
    const categoryCounts: Record<string, number> = {}
    for (const row of dismissedRows ?? []) {
      const cat = (row.activity as { category?: string } | null)?.category
      if (cat) categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1
    }
    const avoidCategories = Object.entries(categoryCounts)
      .filter(([, n]) => n >= 2)
      .map(([cat]) => cat)

    // Priority: mood > search query > preferences + negative signals
    // Negative signals only apply to preference-based queries (not explicit mood/search intent)
    const baseText = mood?.trim() || searchQuery?.trim()
    const preferenceText = [
      preferences.categories?.join(', '),
      `budget: ${preferences.budget?.join('/')}`,
      preferences.indoor_outdoor,
      preferences.social_level,
      preferences.intensity,
    ].filter(Boolean).join('. ')
    const negativeText = avoidCategories.length > 0
      ? ` Avoid: ${avoidCategories.join(', ')}.`
      : ''

    const embeddingText = baseText || (preferenceText + negativeText)

    let activities: import('@/types').Activity[]

    if (embeddingText.length > 3) {
      try {
        const embedding = await generateEmbedding(embeddingText)
        const { data } = await supabase.rpc('match_activities', {
          query_embedding: embedding,
          match_count: 20,
          filter_category: category || null,
        })
        activities = ((data ?? []) as import('@/types').Activity[]).filter(a => !dismissedIds.has(a.id))
      } catch {
        activities = []
      }
    } else {
      activities = []
    }

    // Fallback to score-based query if vector search returned nothing
    if (activities.length === 0) {
      let query = supabase
        .from('activities')
        .select('*')
        .order('hidden_gem_score', { ascending: false })
        .limit(20)

      if (category) query = query.eq('category', category)

      const { data } = await query
      activities = ((data ?? []) as import('@/types').Activity[]).filter(a => !dismissedIds.has(a.id))
    }

    // Generate explanations for top 6 (to manage API costs)
    const withExplanations = await Promise.all(
      activities.slice(0, 6).map(async (activity) => {
        let explanation = 'A hidden gem worth exploring in your area.'
        try {
          if (preferences.categories?.length) {
            explanation = await generateActivityExplanation(activity, preferences)
          }
        } catch {}
        return { ...activity, explanation }
      })
    )

    // Remaining activities get generic explanation
    const rest = activities.slice(6).map((a) => ({
      ...a,
      explanation: `A ${a.category} hidden gem with a score of ${a.hidden_gem_score}/10.`,
    }))

    return NextResponse.json({ recommendations: [...withExplanations, ...rest] })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
