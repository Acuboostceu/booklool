import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionProfile } from '@/lib/session'
import { RECORD_TABLES, verifyFamilyOwnership, type RecordType } from '@/lib/recordAccess'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'parent') {
    return NextResponse.json({ error: 'Children cannot restore records' }, { status: 403 })
  }

  const { type, id } = await req.json() as { type: RecordType; id: string }
  if (!RECORD_TABLES[type] || !id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const admin = createAdminClient()

  const access = await verifyFamilyOwnership(admin, session, type, id)
  if (access === 'not_found') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (access === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await admin.from(RECORD_TABLES[type]).update({ deleted_at: null }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
