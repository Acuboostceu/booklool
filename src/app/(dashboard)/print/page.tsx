import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PrintView from './PrintView'

export default async function PrintPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parent } = await supabase
    .from('bl_profiles').select('id, name, color, partner_parent_id').eq('user_id', user.id).eq('role', 'parent').single()

  const partnerData = parent?.partner_parent_id
    ? await supabase.from('bl_profiles').select('id, name, color').eq('id', parent.partner_parent_id).single()
    : null

  const parentIds = [parent?.id, parent?.partner_parent_id].filter(Boolean) as string[]
  const { data: children } = parentIds.length > 0
    ? await supabase.from('bl_profiles').select('id, name, color').in('parent_id', parentIds)
    : { data: [] }

  const allProfiles = [
    ...(parent ? [{ ...parent, role: 'parent' as const }] : []),
    ...(partnerData?.data ? [{ ...partnerData.data, role: 'parent' as const }] : []),
    ...(children || []).map(c => ({ ...c, role: 'child' as const })),
  ]

  return <PrintView profiles={allProfiles} userEmail={user.email || ''} />
}
