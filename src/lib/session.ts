import type { SupabaseClient } from '@supabase/supabase-js'

export type SessionProfile = {
  userId: string
  profileId: string
  role: 'parent' | 'child'
  partnerParentId: string | null
}

// 현재 로그인 세션의 프로필(부모/아이)을 반환. 미로그인 시 null.
export async function getSessionProfile(supabase: SupabaseClient): Promise<SessionProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('bl_profiles')
    .select('id, role, partner_parent_id')
    .eq('user_id', user.id)
    .single()
  if (!profile) return null

  return {
    userId: user.id,
    profileId: profile.id,
    role: profile.role,
    partnerParentId: profile.partner_parent_id ?? null,
  }
}
