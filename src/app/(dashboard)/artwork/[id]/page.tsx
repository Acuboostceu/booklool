import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getSessionProfile } from '@/lib/session'
import ArtworkDetailView from './ArtworkDetailView'

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rows } = await supabase.rpc('get_artwork_by_id', { artwork_id: id })
  const artwork = rows?.[0] ?? null

  // RPC가 deleted_at을 반환하지 않는 구버전이어도 안전하게 동작
  if (!artwork || artwork.deleted_at) notFound()

  const session = await getSessionProfile(supabase)

  return <ArtworkDetailView artwork={artwork} canDelete={session?.role === 'parent'} />
}
