import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: myProfile } = await supabase
    .from('bl_profiles')
    .select('id, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  if (!myProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Use admin client to bypass RLS and update both sides
  const admin = createAdminClient()

  if (myProfile.partner_parent_id) {
    await admin.from('bl_profiles').update({ partner_parent_id: null }).eq('id', myProfile.partner_parent_id)
  }
  await admin.from('bl_profiles').update({ partner_parent_id: null }).eq('id', myProfile.id)

  return NextResponse.json({ ok: true })
}
