import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    profileId,
    title,
    keywords,
    imageUrl,
    captionCurator,
    captionParent,
    captionChild,
    selectedCaption,
  } = await req.json()

  if (!profileId || !title || !imageUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase.from('bl_artworks').insert({
    profile_id: profileId,
    title,
    keywords: keywords || null,
    image_url: imageUrl,
    caption_curator: captionCurator || null,
    caption_parent: captionParent || null,
    caption_child: captionChild || null,
    selected_caption: selectedCaption || null,
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id, imageUrl })
}
