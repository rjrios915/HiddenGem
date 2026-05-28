import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { filename, contentType } = await request.json()
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { data, error } = await supabase.storage
    .from('gem-photos')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = supabase.storage.from('gem-photos').getPublicUrl(path).data.publicUrl

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
}
