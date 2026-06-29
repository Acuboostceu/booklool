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

  const { data, error } = await supabase.rpc('insert_artwork', {
    p_profile_id: profileId,
    p_title: title,
    p_keywords: keywords || null,
    p_image_url: imageUrl,
    p_caption_curator: captionCurator || null,
    p_caption_parent: captionParent || null,
    p_caption_child: captionChild || null,
    p_selected_caption: selectedCaption || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data, imageUrl })
}
