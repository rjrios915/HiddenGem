import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Trigger re-ingestion or just return updated recommendations
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // In a full implementation, this would trigger a background ingestion job.
  // For now, we just return success — the GET /api/recommendations will re-fetch fresh data.
  return NextResponse.json({ success: true, message: 'Feed refreshed' })
}
