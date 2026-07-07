import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionProfile } from '@/lib/session'

export const RECORD_TABLES = { book: 'bl_books', artwork: 'bl_artworks' } as const
export type RecordType = keyof typeof RECORD_TABLES

// 세션의 가족 프로필 id 목록 (부모/아이 세션 모두 지원)
export async function getFamilyProfileIds(admin: SupabaseClient, session: SessionProfile): Promise<string[]> {
  let parentIds: string[]
  if (session.role === 'parent') {
    parentIds = [session.profileId, session.partnerParentId].filter(Boolean) as string[]
  } else {
    // 아이 세션: 자신의 부모(와 그 파트너)를 가족 기준점으로
    if (!session.parentId) return [session.profileId]
    const { data: parent } = await admin
      .from('bl_profiles')
      .select('id, partner_parent_id')
      .eq('id', session.parentId)
      .single()
    parentIds = [session.parentId, parent?.partner_parent_id].filter(Boolean) as string[]
  }
  const { data: children } = await admin
    .from('bl_profiles')
    .select('id')
    .in('parent_id', parentIds)
  return [...parentIds, ...(children || []).map(c => c.id)]
}

// 레코드가 이 부모의 가족 소유인지 검증
export async function verifyFamilyOwnership(
  admin: SupabaseClient,
  session: SessionProfile,
  type: RecordType,
  id: string,
): Promise<'ok' | 'not_found' | 'forbidden'> {
  const { data: record } = await admin.from(RECORD_TABLES[type]).select('id, profile_id').eq('id', id).single()
  if (!record) return 'not_found'

  const familyIds = await getFamilyProfileIds(admin, session)
  return familyIds.includes(record.profile_id) ? 'ok' : 'forbidden'
}
