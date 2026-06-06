'use client'

import { Star } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { formatDate } from '@/lib/utils'
import { gradeLabel } from '@/lib/gradeLabel'
import FamilyConnect from './FamilyConnect'
import AddChildForm from './AddChildForm'
import ChildLoginSetup from './ChildLoginSetup'
import ColorPicker from './ColorPicker'

type Child = {
  id: string; name: string; grade: number | null; grade_system: string | null
  user_id: string | null; child_username: string | null; color: string | null
}
type Book = { id: string; title: string; rating: number | null; profile_id: string; created_at: string }
type Badge = { id: string; type: string; profile_id: string }

const badgeEmoji: Record<string, string> = {
  first_book: '🌱', books_5: '🌿', books_10: '🌳', books_20: '🏆', books_50: '👑',
  answered_ai: '🤖',
}
const badgeName: Record<string, string> = {
  first_book: '첫 책', books_5: '5권 달성', books_10: '10권 달성',
  books_20: '20권 달성', books_50: '50권 달성', answered_ai: 'AI 답변',
}

export default function ParentPageView({
  parentId,
  parentName,
  familyCode,
  partnerName,
  children,
  recentBooks,
  badges,
  plan,
}: {
  parentId: string
  parentName: string
  familyCode: string
  partnerName: string | null
  children: Child[]
  recentBooks: Book[]
  badges: Badge[]
  plan: string
}) {
  const { t } = useLocale()

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('family_title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('family_greeting', parentName as never)}</p>

      {children.length > 0 ? (
        <div className="space-y-4 mb-8">
          {children.map(child => {
            const childBooks = recentBooks.filter(b => b.profile_id === child.id)
            const childBadges = badges.filter(b => b.profile_id === child.id)
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
                    <p className="text-2xl font-bold" style={{color: 'var(--green-dark)'}}>{childBooks.length}</p>
                    <p className="text-xs text-gray-400">{t('bookshelf_count', childBooks.length as never)}</p>
                  </div>
                </div>

                {childBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {childBadges.map(b => (
                      <span key={b.id} className="text-xs px-2 py-1 rounded-full font-medium" style={{background: 'var(--yellow-light)', color: 'var(--yellow-dark)'}}>
                        {badgeEmoji[b.type]} {badgeName[b.type]}
                      </span>
                    ))}
                  </div>
                )}

                {childBooks.slice(0, 3).map(book => (
                  <div key={book.id} className="flex items-center gap-2 py-2 border-t border-gray-50">
                    <p className="text-sm flex-1 truncate font-medium text-gray-700">{book.title}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: book.rating || 0 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3" style={{fill: 'var(--yellow)', color: 'var(--yellow)'}} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(book.created_at)}</p>
                  </div>
                ))}

                <ColorPicker childId={child.id} currentColor={child.color} />
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
          <p className="text-gray-400 text-sm">{t('family_no_children')}</p>
        </div>
      )}

      <FamilyConnect familyCode={familyCode} partnerName={partnerName} plan={plan} />

      <div className="bg-white rounded-3xl p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">{t('family_add_child')}</h3>
        <AddChildForm parentId={parentId} plan={plan} childCount={children.length} />
      </div>
    </div>
  )
}
