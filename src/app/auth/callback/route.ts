import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create parent profile if first login
      const { data: existing } = await supabase
        .from('bl_profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      if (!existing) {
        await supabase.from('bl_profiles').insert({
          user_id: data.user.id,
          role: 'parent',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '부모',
        })
      }

      return NextResponse.redirect(`${origin}/bookshelf`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
