import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai'
import { scoreFromActivityData } from '@/lib/scoring'
import type { ActivityCategory, BudgetRange } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, category, description, address, price_level, photo_url, url } = body

  if (!title?.trim() || !category || !description?.trim() || !address?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Geocode address via Mapbox
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const geoRes = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1&country=us`
  )
  const geoData = await geoRes.json()
  const feature = geoData.features?.[0]
  if (!feature) return NextResponse.json({ error: 'Address not found — try being more specific.' }, { status: 400 })

  const [longitude, latitude] = feature.center
  const resolvedAddress = feature.place_name as string

  // Score: community gems start with high uniqueness (very few reviews)
  const hidden_gem_score = scoreFromActivityData({ rating: 4.5, review_count: 3 })

  // Generate embedding
  const embeddingText = `${title}. ${description}. Category: ${category}.`
  const embedding = await generateEmbedding(embeddingText)

  const { data, error } = await supabase
    .from('activities')
    .insert({
      title: title.trim(),
      description: description.trim(),
      category: category as ActivityCategory,
      latitude,
      longitude,
      address: resolvedAddress,
      price_level: (price_level ?? '$') as BudgetRange,
      rating: 4.5,
      review_count: 3,
      source: 'community',
      submitted_by: user.id,
      url: url?.trim() || null,
      image_url: photo_url || null,
      hidden_gem_score,
      embedding,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, activity: data })
}
