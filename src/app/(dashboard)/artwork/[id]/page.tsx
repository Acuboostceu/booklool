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

  // 같은 프로필의 작품 목록(생성일 내림차순, get_family_artworks와 동일 정렬)에서 이전/다음 id 계산
  const { data: siblings } = await supabase
    .rpc('get_family_artworks', { profile_ids: [artwork.profile_id] })
  const ids = ((siblings || []) as { id: string; deleted_at?: string | null }[])
    .filter(a => !a.deleted_at)
    .map(a => a.id)
  const idx = ids.indexOf(id)
  const prevId = idx > 0 ? ids[idx - 1] : null
  const nextId = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null

  return <ArtworkDetailView artwork={artwork} canDelete={session?.role === 'parent'} prevId={prevId} nextId={nextId} />
}
