import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionProfile } from '@/lib/session'

export const RECORD_TABLES = { book: 'bl_books', artwork: 'bl_artworks' } as const
export type RecordType = keyof typeof RECORD_TABLES

// 부모 세션의 가족(본인/파트너/자녀) 프로필 id 목록
export async function getFamilyProfileIds(admin: SupabaseClient, session: SessionProfile): Promise<string[]> {
  const parentIds = [session.profileId, session.partnerParentId].filter(Boolean) as string[]
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
