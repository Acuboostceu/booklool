import { createClient } from '@/lib/supabase/server'
import BookshelfView from './BookshelfView'

export default async function BookshelfPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 아이 계정인지 확인
  const { data: childProfile } = await supabase
    .from('bl_profiles')
    .select('id, name, color')
    .eq('user_id', user.id)
    .eq('role', 'child')
    .single()

  // 아이 계정이면 본인 책장만
  if (childProfile) {
    const { data: books } = await supabase
      .from('bl_books')
      .select('id, title, cover_url, photo_url, rating, profile_id')
      .eq('profile_id', childProfile.id)
      .order('created_at', { ascending: false })

    const { data: badges } = await supabase
      .from('bl_badges')
      .select('id, badge_type, profile_id')
      .eq('profile_id', childProfile.id)

    const { data: artworks } = await supabase
      .rpc('get_family_artworks', { profile_ids: [childProfile.id] })

    return (
      <BookshelfView
        profiles={[childProfile]}
        books={books || []}
        badges={badges || []}
        artworks={artworks || []}
        partnerIds={[]}
      />
    )
  }

  // 부모 계정
  const { data: parent } = await supabase
    .from('bl_profiles')
    .select('id, name, partner_parent_id, color')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  const { data: partner } = parent?.partner_parent_id
    ? await supabase.from('bl_profiles').select('id, name, color').eq('id', parent.partner_parent_id).single()
    : { data: null }

  const parentIds = [parent?.id, partner?.id].filter(Boolean) as string[]
  const { data: children } = parentIds.length > 0
    ? await supabase
        .from('bl_profiles')
        .select('id, name, grade, grade_system, color')
        .in('parent_id', parentIds)
    : { data: [] }

  const profiles = [...(children || []), parent, partner].filter(Boolean) as { id: string; name: string; color?: string | null }[]
  const allProfileIds = profiles.map(p => p.id)

  const { data: books } = await supabase
    .from('bl_books')
    .select('id, title, cover_url, photo_url, rating, profile_id')
    .in('profile_id', allProfileIds)
    .order('created_at', { ascending: false })

  const { data: badges } = await supabase
    .from('bl_badges')
    .select('id, badge_type, profile_id')
    .in('profile_id', allProfileIds)

  const { data: artworks } = await supabase
    .rpc('get_family_artworks', { profile_ids: allProfileIds })

  return (
    <BookshelfView
      profiles={profiles}
      books={books || []}
      badges={badges || []}
      artworks={artworks || []}
      partnerIds={partner ? [partner.id] : []}
    />
  )
}
