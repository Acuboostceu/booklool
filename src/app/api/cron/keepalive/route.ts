import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Supabase Free 티어는 7일간 DB 활동이 없으면 프로젝트를 자동 일시정지한다.
// Vercel Cron(vercel.json)이 이 엔드포인트를 매일 호출해 가벼운 쿼리로 활동을 발생시킨다.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('bl_profiles').select('id').limit(1)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
}
