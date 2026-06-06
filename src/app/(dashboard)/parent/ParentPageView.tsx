'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { TranslationKey } from '@/lib/i18n/translations'
import { gradeLabel } from '@/lib/gradeLabel'
import { createClient } from '@/lib/supabase/client'
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

function ChildCard({ child, bookCount, badges, t, onDelete, showDelete }: {
  child: Child
  bookCount: number
  badges: Badge[]
  t: (key: TranslationKey, ...args: never[]) => string
  onDelete: () => void
  showDelete: boolean
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{child.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{color: 'var(--green-dark)'}}>{bookCount}</p>
          <p className="text-xs text-gray-400">{t('bookshelf_count', bookCount as never)}</p>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {badges.map(b => (
            <span key={b.id} className="text-xs px-2 py-1 rounded-full font-medium" style={{background: 'var(--yellow-light)', color: 'var(--yellow-dark)'}}>
              {badgeEmoji[b.type]} {badgeName[b.type]}
            </span>
          ))}
        </div>
      )}

      <ColorPicker childId={child.id} currentColor={child.color} />
      <ChildLoginSetup
        childId={child.id}
        childName={child.name}
        hasLogin={!!child.user_id}
        username={child.child_username || null}
      />

      {showDelete && (
        <div className="mt-3 border-t border-gray-50 pt-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full text-xs font-bold py-2 rounded-2xl transition"
            style={{ color: 'var(--pink-dark)', background: 'var(--pink-light)' }}
          >
            {t('child_delete')}
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <p className="font-black text-gray-800 text-lg mb-2">{t('child_delete_confirm')}</p>
            <p className="text-sm text-gray-500 mb-6">{t('child_delete_desc')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100"
              >
                {t('book_cancel')}
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-3 rounded-2xl font-bold text-white"
                style={{ background: 'var(--pink)' }}
              >
                {t('child_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
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
  isAdmin,
}: {
  parentId: string
  parentName: string
  familyCode: string
  partnerName: string | null
  children: Child[]
  recentBooks: Book[]
  badges: Badge[]
  plan: string
  isAdmin: boolean
}) {
  const { t } = useLocale()
  const router = useRouter()
  const supabase = createClient()

  async function handleDeleteChild(childId: string) {
    await supabase.from('bl_books').delete().eq('profile_id', childId)
    await supabase.from('bl_badges').delete().eq('profile_id', childId)
    await supabase.from('bl_profiles').delete().eq('id', childId)
    router.refresh()
  }

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2 text-center">{t('family_title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('family_greeting', parentName as never)}</p>

      {children.length > 0 ? (
        <div className="space-y-4 mb-8">
          {children.map(child => {
            const childBooks = recentBooks.filter(b => b.profile_id === child.id)
            const childBadges = badges.filter(b => b.profile_id === child.id)
            return (
              <ChildCard
                key={child.id}
                child={child}
                bookCount={childBooks.length}
                badges={childBadges}
                t={t}
                onDelete={() => handleDeleteChild(child.id)}
                showDelete={isAdmin}
              />
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
