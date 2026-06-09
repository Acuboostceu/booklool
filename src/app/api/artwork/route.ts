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

  // Check free plan artwork limit (12) — check parent plan if child profile
  const { data: profile } = await supabase
    .from('bl_profiles')
    .select('plan, parent_id, role')
    .eq('id', profileId)
    .single()

  let effectivePlan = profile?.plan ?? 'free'
  if (effectivePlan !== 'family' && profile?.role === 'child' && profile?.parent_id) {
    const { data: parentProfile } = await supabase
      .from('bl_profiles')
      .select('plan')
      .eq('id', profile.parent_id)
      .single()
    if (parentProfile?.plan === 'family') effectivePlan = 'family'
  }

  if (effectivePlan !== 'family') {
    const { count } = await supabase
      .from('bl_artworks')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)

    if ((count ?? 0) >= 12) {
      return NextResponse.json({ error: 'ARTWORK_LIMIT_REACHED' }, { status: 403 })
    }
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
