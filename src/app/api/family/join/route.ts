import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { family_code } = await req.json()
  if (!family_code) return NextResponse.json({ error: 'family_code required' }, { status: 400 })

  // Find the parent who owns this family_code (regular client — RLS policy allows SELECT for authenticated)
  const { data: targetParent, error: targetErr } = await supabase
    .from('bl_profiles')
    .select('id, user_id')
    .eq('family_code', family_code.toUpperCase().trim())
    .eq('role', 'parent')
    .single()

  if (!targetParent) return NextResponse.json({ error: '코드를 찾을 수 없어요', detail: targetErr?.message }, { status: 404 })
  if (targetParent.user_id === user.id) return NextResponse.json({ error: '본인 코드는 사용할 수 없어요' }, { status: 400 })

  // Get current user's parent profile
  const { data: myProfile, error: myErr } = await supabase
    .from('bl_profiles')
    .select('id, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  if (!myProfile) return NextResponse.json({ error: '부모 프로필이 없어요', detail: myErr?.message }, { status: 404 })
  if (myProfile.partner_parent_id) return NextResponse.json({ error: '이미 가족이 연결되어 있어요' }, { status: 400 })

  // Link both directions via SECURITY DEFINER function (bypasses RLS)
  const { error: linkErr } = await supabase.rpc('link_partners', {
    my_profile_id: myProfile.id,
    target_profile_id: targetParent.id,
  })
  if (linkErr) {
    console.error('[family/join] link_partners failed:', linkErr)
    return NextResponse.json({ error: '연결 실패', detail: linkErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
