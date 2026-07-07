import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    profileId,
    title,
    keywords,
    imageUrl,
    originalUrl,
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

  // 원본 URL은 RPC 시그니처에 없어 insert 후 별도 업데이트 (인쇄 파이프라인용)
  if (originalUrl && data) {
    const admin = createAdminClient()
    const { error: updateError } = await admin
      .from('bl_artworks')
      .update({ original_url: originalUrl, has_original: true })
      .eq('id', data)
    if (updateError) console.error('Failed to save original_url:', updateError)
  }

  return NextResponse.json({ id: data, imageUrl })
}
