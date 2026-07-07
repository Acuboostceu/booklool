import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionProfile } from '@/lib/session'

const TABLES = { book: 'bl_books', artwork: 'bl_artworks' } as const
const RETENTION_DAYS = 30

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 아이 세션은 삭제 불가 — UI 숨김과 별개로 API 레벨에서 차단
  if (session.role !== 'parent') {
    return NextResponse.json({ error: 'Children cannot delete records' }, { status: 403 })
  }

  const { type, id } = await req.json() as { type: 'book' | 'artwork'; id: string }
  const table = TABLES[type]
  if (!table || !id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const admin = createAdminClient()

  // 소유권 검증: 레코드의 프로필이 이 부모의 가족(본인/파트너/자녀)에 속해야 함
  const { data: record } = await admin.from(table).select('id, profile_id').eq('id', id).single()
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const familyParentIds = [session.profileId, session.partnerParentId].filter(Boolean) as string[]
  const { data: owner } = await admin
    .from('bl_profiles')
    .select('id, parent_id')
    .eq('id', record.profile_id)
    .single()
  const inFamily = !!owner && (
    familyParentIds.includes(owner.id) ||
    (owner.parent_id !== null && familyParentIds.includes(owner.parent_id))
  )
  if (!inFamily) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Soft delete
  const { error } = await admin.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Lazy purge: 30일 지난 soft-deleted 레코드는 이 시점에 실제 삭제
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  for (const t of Object.values(TABLES)) {
    const { error: purgeError } = await admin.from(t).delete().lt('deleted_at', cutoff)
    if (purgeError) console.error(`Purge failed for ${t}:`, purgeError)
  }

  return NextResponse.json({ ok: true })
}
