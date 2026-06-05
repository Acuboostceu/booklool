import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function BookshelfPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get parent profile
  const { data: parent } = await supabase
    .from('bl_profiles')
    .select('id, name, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  // Get partner profile if connected
  const { data: partner } = parent?.partner_parent_id
    ? await supabase.from('bl_profiles').select('id, name').eq('id', parent.partner_parent_id).single()
    : { data: null }

  // Get child profiles (from both parents if partner connected)
  const parentIds = [parent?.id, partner?.id].filter(Boolean) as string[]
  const { data: children } = parentIds.length > 0
    ? await supabase
        .from('bl_profiles')
        .select('id, name, grade, grade_system')
        .in('parent_id', parentIds)
    : { data: [] }

  const profiles = [parent, partner, ...(children || [])].filter(Boolean)

  // Get books for all profiles
  const allProfileIds = profiles.map(p => p!.id)
  const { data: books } = await supabase
    .from('bl_books')
    .select('*')
    .in('profile_id', allProfileIds)
    .order('created_at', { ascending: false })

  // Get badges
  const { data: badges } = await supabase
    .from('bl_badges')
    .select('*')
    .in('profile_id', allProfileIds)

  const booksByProfile: Record<string, typeof books> = {}
  profiles.forEach(p => {
    booksByProfile[p!.id] = books?.filter(b => b.profile_id === p!.id) || []
  })

  const badgesByProfile: Record<string, typeof badges> = {}
  profiles.forEach(p => {
    badgesByProfile[p!.id] = badges?.filter(b => b.profile_id === p!.id) || []
  })

  const badgeEmoji: Record<string, string> = {
    first_book: '🌱', books_5: '🌿', books_10: '🌳', books_20: '🏆', books_50: '👑',
    streak_7: '🔥', streak_30: '⚡', answered_ai: '🤖',
  }

  const profileColors = [
    { bg: 'var(--green-light)', accent: 'var(--green-dark)', star: 'var(--green)' },
    { bg: 'var(--pink-light)', accent: 'var(--pink-dark)', star: 'var(--pink)' },
    { bg: 'var(--purple-light)', accent: 'var(--purple-dark)', star: 'var(--purple)' },
    { bg: 'var(--yellow-light)', accent: 'var(--yellow-dark)', star: 'var(--yellow)' },
  ]

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black text-gray-800 mb-6">📚 우리 책장</h1>

      {profiles.map((profile, idx) => {
        if (!profile) return null
        const profileBooks = booksByProfile[profile.id] || []
        const profileBadges = badgesByProfile[profile.id] || []
        const color = profileColors[idx % profileColors.length]
        return (
          <div key={profile.id} className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h2 className="font-black text-lg" style={{color: color.accent}}>{profile.name}</h2>
                <p className="text-xs text-gray-400">읽은 책 {profileBooks.length}권</p>
              </div>
              {profileBadges.length > 0 && (
                <div className="flex gap-1">
                  {profileBadges.map(b => (
                    <span key={b.id} className="text-lg" title={b.type}>{badgeEmoji[b.type] || '🏅'}</span>
                  ))}
                </div>
              )}
            </div>

            {profileBooks.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed p-8 text-center" style={{borderColor: color.accent, background: color.bg}}>
                <p className="text-4xl mb-2">📖</p>
                <p className="text-gray-500 text-sm">아직 읽은 책이 없어요</p>
                <Link href="/add" className="inline-block mt-3 font-bold text-sm" style={{color: color.accent}}>
                  + 첫 번째 책 추가하기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {profileBooks.map(book => (
                  <Link key={book.id} href={`/book/${book.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border-2 transition hover:scale-[1.02]" style={{borderColor: color.bg}}>
                      {book.cover_url ? (
                        <div className="relative w-full aspect-[2/3]">
                          <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-full aspect-[2/3] flex items-center justify-center text-3xl" style={{background: color.bg}}>📖</div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{book.title}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: book.rating || 0 }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5" style={{fill: color.star, color: color.star}} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* FAB */}
      <Link
        href="/add"
        className="fixed bottom-20 right-4 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition z-40 hover:scale-110"
        style={{background: 'var(--green)'}}
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  )
}
