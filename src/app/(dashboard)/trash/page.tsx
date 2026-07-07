import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/session'
import { getFamilyProfileIds } from '@/lib/recordAccess'
import TrashView from './TrashView'

export default async function TrashPage() {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)
  if (!session) redirect('/login')
  if (session.role !== 'parent') redirect('/bookshelf')

  const admin = createAdminClient()
  const profileIds = await getFamilyProfileIds(admin, session)

  const [{ data: books }, { data: artworks }, { data: profiles }] = await Promise.all([
    admin
      .from('bl_books')
      .select('id, title, cover_url, photo_url, profile_id, deleted_at')
      .in('profile_id', profileIds)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false }),
    admin
      .from('bl_artworks')
      .select('id, title, image_url, profile_id, deleted_at')
      .in('profile_id', profileIds)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false }),
    admin.from('bl_profiles').select('id, name').in('id', profileIds),
  ])

  const nameById = Object.fromEntries((profiles || []).map(p => [p.id, p.name]))

  return (
    <TrashView
      books={(books || []).map(b => ({ ...b, profileName: nameById[b.profile_id] || '' }))}
      artworks={(artworks || []).map(a => ({ ...a, profileName: nameById[a.profile_id] || '' }))}
    />
  )
}
