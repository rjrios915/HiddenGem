import { NextRequest, NextResponse } from 'next/server'
import { embedMissingActivities } from '@/lib/ingestion/ingest'

// Backfills OpenAI embeddings for seeded/imported activities that have embedding = NULL.
// Call once after running seed.sql, or any time new un-embedded activities are added.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await embedMissingActivities()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('[embed route]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
