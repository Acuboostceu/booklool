import { createClient } from '@/lib/supabase/server'
import BookshelfView from './BookshelfView'

export default async function BookshelfPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: parent } = await supabase
    .from('bl_profiles')
    .select('id, name, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  const { data: partner } = parent?.partner_parent_id
    ? await supabase.from('bl_profiles').select('id, name').eq('id', parent.partner_parent_id).single()
    : { data: null }

  const parentIds = [parent?.id, partner?.id].filter(Boolean) as string[]
  const { data: children } = parentIds.length > 0
    ? await supabase
        .from('bl_profiles')
        .select('id, name, grade, grade_system, color')
        .in('parent_id', parentIds)
    : { data: [] }

  const profiles = [parent, partner, ...(children || [])].filter(Boolean) as { id: string; name: string; color?: string | null }[]
  const allProfileIds = profiles.map(p => p.id)

  const { data: books } = await supabase
    .from('bl_books')
    .select('id, title, cover_url, rating, profile_id')
    .in('profile_id', allProfileIds)
    .order('created_at', { ascending: false })

  const { data: badges } = await supabase
    .from('bl_badges')
    .select('id, badge_type, profile_id')
    .in('profile_id', allProfileIds)

  return (
    <BookshelfView
      profiles={profiles}
      books={books || []}
      badges={badges || []}
    />
  )
}
