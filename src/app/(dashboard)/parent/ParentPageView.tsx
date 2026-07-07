'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { TranslationKey } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import FamilyConnect from './FamilyConnect'
import AddChildForm from './AddChildForm'
import ChildLoginSetup from './ChildLoginSetup'
import ColorPicker from './ColorPicker'

type Child = {
  id: string; name: string
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
  const [confirmName, setConfirmName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(child.name)
  const [nameValue, setNameValue] = useState(child.name)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSaveName() {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === displayName) { setEditingName(false); return }
    setSaving(true)
    await supabase.from('bl_profiles').update({ name: trimmed }).eq('id', child.id)
    setDisplayName(trimmed)
    setSaving(false)
    setEditingName(false)
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                className="font-semibold text-gray-800 border-b border-gray-300 outline-none bg-transparent w-28"
              />
              <button onClick={handleSaveName} disabled={saving} className="text-xs font-bold px-2 py-1 rounded-xl" style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>
                {saving ? '...' : '저장'}
              </button>
              <button onClick={() => { setNameValue(displayName); setEditingName(false) }} className="text-xs text-gray-400">취소</button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-gray-800">{displayName}</h3>
              <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          )}
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
            <p className="text-sm text-gray-500 mb-2">{t('child_delete_desc')}</p>
            <p className="text-sm font-bold mb-4" style={{ color: 'var(--pink-dark)' }}>
              {t('child_delete_warning')}
            </p>
            <p className="text-xs text-gray-400 mb-2">{t('child_delete_type_name', displayName as never)}</p>
            <input
              value={confirmName}
              onChange={e => setConfirmName(e.target.value)}
              placeholder={displayName}
              className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none mb-4"
              style={{ borderColor: 'var(--pink-light)' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setConfirmName('') }}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100"
              >
                {t('book_cancel')}
              </button>
              <button
                onClick={onDelete}
                disabled={confirmName.trim() !== displayName}
                className="flex-1 py-3 rounded-2xl font-bold text-white disabled:opacity-40"
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
  isAdmin,
  parentColor,
}: {
  parentId: string
  parentName: string
  familyCode: string
  partnerName: string | null
  children: Child[]
  recentBooks: Book[]
  badges: Badge[]
  isAdmin: boolean
  parentColor: string | null
}) {
  const { t, locale } = useLocale()
  const router = useRouter()
  const supabase = createClient()

  async function handleDeleteChild(childId: string) {
    await supabase.rpc('delete_child_profile', { child_profile_id: childId })
    router.refresh()
  }

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2 text-center">{t('family_title')}</h1>
      <p className="text-sm text-gray-500 mb-4">{t('family_greeting', parentName as never)}</p>

      {/* Parent color picker */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 mb-4">
        <ColorPicker childId={parentId} currentColor={parentColor} />
      </div>

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

      <FamilyConnect familyCode={familyCode} partnerName={partnerName} />

      <div className="bg-white rounded-3xl p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">{t('family_add_child')}</h3>
        <AddChildForm parentId={parentId} />
      </div>
    </div>
  )
}
