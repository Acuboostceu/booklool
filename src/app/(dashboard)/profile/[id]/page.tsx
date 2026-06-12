import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfileView from './ProfileView'

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('bl_profiles')
    .select('id, name, color')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: books } = await supabase
    .from('bl_books')
    .select('id, title, cover_url, photo_url, rating, profile_id, created_at')
    .eq('profile_id', id)
    .order('created_at', { ascending: false })

  const { data: artworks } = await supabase
    .rpc('get_family_artworks', { profile_ids: [id] })

  // check if this is a partner profile (read-only)
  const { data: me } = await supabase
    .from('bl_profiles')
    .select('id, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  const isPartner = me?.partner_parent_id === id

  return (
    <ProfileView
      profile={profile}
      books={books || []}
      artworks={artworks || []}
      isPartner={isPartner}
      initialTab={tab}
    />
  )
}
