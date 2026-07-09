import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { child_id, username, password } = await req.json()
  if (!child_id || !username || !password)
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })
  if (password.length < 6)
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 해요' }, { status: 400 })
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!cleanUsername)
    return NextResponse.json({ error: '아이디는 영문+숫자만 사용할 수 있어요' }, { status: 400 })

  // Verify the child belongs to this parent (or partner)
  const { data: parent } = await supabase
    .from('bl_profiles')
    .select('id, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 })

  const { data: child } = await supabase
    .from('bl_profiles')
    .select('id, user_id')
    .eq('id', child_id)
    .in('parent_id', [parent.id, parent.partner_parent_id].filter(Boolean))
    .single()

  if (!child) return NextResponse.json({ error: '자녀 프로필을 찾을 수 없어요' }, { status: 404 })

  const admin = createAdminClient()
  const email = `${cleanUsername}@booklool.app`

  if (child.user_id) {
    // Update existing auth user password
    const { error } = await admin.auth.admin.updateUserById(child.user_id, { password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else {
    // Check username not taken
    const { data: existing } = await admin.auth.admin.listUsers()
    const taken = existing?.users.some(u => u.email === email)
    if (taken) return NextResponse.json({ error: '이미 사용 중인 아이디예요' }, { status: 400 })

    // Create new auth user
    const { data: newUser, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Link to child profile
    await supabase
      .from('bl_profiles')
      .update({ user_id: newUser.user.id, child_username: username.toLowerCase() })
      .eq('id', child_id)
  }

  return NextResponse.json({ ok: true })
}
