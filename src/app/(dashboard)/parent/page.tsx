import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ParentPageView from './ParentPageView'

export default async function ParentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parent } = await supabase
    .from('bl_profiles')
    .select('id, name, family_code, partner_parent_id, plan, stripe_customer_id, color')
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
        .select('id, name, user_id, child_username, color')
        .in('parent_id', parentIds)
    : { data: [] }

  const childIds = (children || []).map(c => c.id)

  const { data: recentBooks } = childIds.length > 0
    ? await supabase
        .from('bl_books')
        .select('id, title, rating, profile_id, created_at')
        .in('profile_id', childIds)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const { data: badges } = childIds.length > 0
    ? await supabase.from('bl_badges').select('id, type, profile_id').in('profile_id', childIds)
    : { data: [] }

  return (
    <ParentPageView
      parentId={parent?.id || ''}
      parentName={parent?.name || ''}
      familyCode={parent?.family_code || ''}
      partnerName={partner?.name || null}
      children={children || []}
      recentBooks={recentBooks || []}
      badges={badges || []}
      isAdmin={!!parent?.stripe_customer_id}
      parentColor={parent?.color || null}
    />
  )
}
