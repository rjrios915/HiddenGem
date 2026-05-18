import { NextRequest, NextResponse } from 'next/server'
import { ingestActivities, type IngestSource } from '@/lib/ingestion/ingest'

// Protected admin endpoint — call manually or via cron
// Body: { location?: string, source?: 'yelp' | 'google' | 'eventbrite' | 'all' }
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { location = 'San Francisco, CA', source = 'all' } = await request.json().catch(() => ({}))

  try {
    const result = await ingestActivities(location, source as IngestSource)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('[ingest route]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
