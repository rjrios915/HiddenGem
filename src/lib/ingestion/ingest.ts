import { generateEmbedding } from '@/lib/openai'
import { fetchYelpActivities } from './yelp'
import { fetchGooglePlacesActivities } from './google-places'
import { fetchEventbriteActivities } from './eventbrite'
import type { Activity } from '@/types'

export type IngestSource = 'yelp' | 'google' | 'eventbrite' | 'all'

async function getServiceClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function ingestActivities(location: string, source: IngestSource = 'all') {
  const supabase = await getServiceClient()

  const raw: Omit<Activity, 'id' | 'embedding' | 'created_at'>[] = []

  if (source === 'yelp' || source === 'all') {
    try {
      const items = await fetchYelpActivities(location, 'activities', 50)
      console.log(`[ingest] Yelp: ${items.length}`)
      raw.push(...items)
    } catch (err) {
      console.error('[ingest] Yelp failed:', String(err))
    }
  }

  if (source === 'google' || source === 'all') {
    try {
      const items = await fetchGooglePlacesActivities(location, 40)
      console.log(`[ingest] Google Places: ${items.length}`)
      raw.push(...items)
    } catch (err) {
      console.error('[ingest] Google Places failed:', String(err))
    }
  }

  if (source === 'eventbrite' || source === 'all') {
    try {
      const items = await fetchEventbriteActivities(location, 30)
      console.log(`[ingest] Eventbrite: ${items.length}`)
      raw.push(...items)
    } catch (err) {
      console.error('[ingest] Eventbrite failed:', String(err))
    }
  }

  if (raw.length === 0) return { inserted: 0, skipped: 0, failed: 0, total: 0 }

  // Deduplicate against existing URLs in DB
  const { data: existing } = await supabase.from('activities').select('url')
  const existingUrls = new Set((existing ?? []).map((a: { url: string }) => a.url))

  const toProcess = raw.filter((a) => !existingUrls.has(a.url))
  const skipped = raw.length - toProcess.length
  console.log(`[ingest] New: ${toProcess.length}, Skipped duplicates: ${skipped}`)

  let inserted = 0
  let failed = 0

  for (const activity of toProcess) {
    try {
      const embeddingText = `${activity.title}. ${activity.description}. Category: ${activity.category}.`
      const embedding = await generateEmbedding(embeddingText)

      const { error } = await supabase
        .from('activities')
        .insert({ ...activity, embedding })

      if (error) {
        console.error(`[ingest] Insert failed "${activity.title}":`, error.message)
        failed++
      } else {
        inserted++
        existingUrls.add(activity.url)
      }

      // Rate-limit buffer for OpenAI + Supabase
      await new Promise((r) => setTimeout(r, 150))
    } catch (err) {
      console.error(`[ingest] Error "${activity.title}":`, String(err))
      failed++
    }
  }

  console.log(`[ingest] Done — inserted: ${inserted}, failed: ${failed}`)
  return { inserted, skipped, failed, total: raw.length }
}

/** Generates and stores embeddings for any activity that currently has embedding = NULL. */
export async function embedMissingActivities() {
  const supabase = await getServiceClient()

  const { data: activities, error } = await supabase
    .from('activities')
    .select('id, title, description, category')
    .is('embedding', null)

  if (error) throw new Error(error.message)
  if (!activities?.length) return { processed: 0, failed: 0 }

  console.log(`[embed] ${activities.length} activities need embeddings`)

  let processed = 0
  let failed = 0

  for (const activity of activities) {
    try {
      const embeddingText = `${activity.title}. ${activity.description}. Category: ${activity.category}.`
      const embedding = await generateEmbedding(embeddingText)

      const { error: updateError } = await supabase
        .from('activities')
        .update({ embedding })
        .eq('id', activity.id)

      if (updateError) {
        console.error(`[embed] Update failed "${activity.title}":`, updateError.message)
        failed++
      } else {
        processed++
      }

      await new Promise((r) => setTimeout(r, 100))
    } catch (err) {
      console.error(`[embed] Error "${activity.title}":`, String(err))
      failed++
    }
  }

  console.log(`[embed] Done — processed: ${processed}, failed: ${failed}`)
  return { processed, failed }
}
