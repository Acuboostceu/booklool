import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddChildForm from './AddChildForm'
import FamilyConnect from './FamilyConnect'
import ChildLoginSetup from './ChildLoginSetup'
import { Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { gradeLabel } from '@/lib/gradeLabel'

export default async function ParentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parent } = await supabase
    .from('bl_profiles')
    .select('id, name, family_code, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  // Get partner name if connected
  const { data: partner } = parent?.partner_parent_id
    ? await supabase.from('bl_profiles').select('id, name').eq('id', parent.partner_parent_id).single()
    : { data: null }

  // Get children from both parents
  const parentIds = [parent?.id, partner?.id].filter(Boolean) as string[]
  const { data: children } = parentIds.length > 0
    ? await supabase
        .from('bl_profiles')
        .select('id, name, grade, grade_system, user_id, child_username')
        .in('parent_id', parentIds)
    : { data: [] }

  const childIds = (children || []).map(c => c.id)

  const { data: recentBooks } = childIds.length > 0
    ? await supabase
        .from('bl_books')
        .select('*')
        .in('profile_id', childIds)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const { data: badges } = childIds.length > 0
    ? await supabase.from('bl_badges').select('*').in('profile_id', childIds)
    : { data: [] }

  const badgeEmoji: Record<string, string> = {
    first_book: '🌱', books_5: '🌿', books_10: '🌳', books_20: '🏆', books_50: '👑',
    streak_7: '🔥', streak_30: '⚡', answered_ai: '🤖',
  }

  const badgeName: Record<string, string> = {
    first_book: '첫 책', books_5: '5권 달성', books_10: '10권 달성',
    books_20: '20권 달성', books_50: '50권 달성', streak_7: '7일 연속',
    streak_30: '30일 연속', answered_ai: 'AI 답변',
  }

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">가족 대시보드</h1>
      <p className="text-sm text-gray-500 mb-6">안녕하세요, {parent?.name}님!</p>

      {/* Children overview */}
      {(children || []).length > 0 ? (
        <div className="space-y-4 mb-8">
          {(children || []).map(child => {
            const childBooks = (recentBooks || []).filter(b => b.profile_id === child.id)
            const childBadges = (badges || []).filter(b => b.profile_id === child.id)
            return (
              <div key={child.id} className="bg-white rounded-3xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{child.name}</h3>
                    {child.grade !== null && (
                      <p className="text-xs text-gray-500">
                        {gradeLabel(child.grade, child.grade_system)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-500">{childBooks.length}</p>
                    <p className="text-xs text-gray-400">권</p>
                  </div>
                </div>

                {/* Badges */}
                {childBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {childBadges.map(b => (
                      <span key={b.id} className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                        {badgeEmoji[b.type]} {badgeName[b.type]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recent books */}
                {childBooks.slice(0, 3).map(book => (
                  <div key={book.id} className="flex items-center gap-2 py-2 border-t border-gray-50">
                    <p className="text-sm flex-1 truncate font-medium text-gray-700">{book.title}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: book.rating || 0 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(book.created_at)}</p>
                  </div>
                ))}

                {/* Child login setup */}
                <ChildLoginSetup
                  childId={child.id}
                  childName={child.name}
                  hasLogin={!!child.user_id}
                  username={child.child_username || null}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center mb-8">
          <p className="text-gray-400 text-sm">아직 자녀 프로필이 없어요</p>
        </div>
      )}

      {/* Family connect (spouse linking) */}
      <FamilyConnect
        familyCode={parent?.family_code || ''}
        partnerName={partner?.name || null}
      />

      {/* Add child */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">+ 자녀 프로필 추가</h3>
        <AddChildForm parentId={parent?.id || ''} />
      </div>
    </div>
  )
}
