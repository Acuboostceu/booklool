'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Undo2, Trash2 } from 'lucide-react'
import { toImgSrc } from '@/lib/imageProxy'
import { useLocale } from '@/lib/i18n/LocaleContext'

type TrashBook = {
  id: string; title: string; cover_url: string | null; photo_url: string | null
  profile_id: string; deleted_at: string; profileName: string
}
type TrashArtwork = {
  id: string; title: string | null; image_url: string | null
  profile_id: string; deleted_at: string; profileName: string
}

const RETENTION_DAYS = 30

function daysLeft(deletedAt: string) {
  const elapsed = (Date.now() - new Date(deletedAt).getTime()) / (24 * 60 * 60 * 1000)
  return Math.max(0, Math.ceil(RETENTION_DAYS - elapsed))
}

export default function TrashView({ books, artworks }: { books: TrashBook[]; artworks: TrashArtwork[] }) {
  const router = useRouter()
  const { t } = useLocale()
  const [restoring, setRestoring] = useState<string | null>(null)

  async function handleRestore(type: 'book' | 'artwork', id: string) {
    setRestoring(id)
    const res = await fetch('/api/record/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    })
    setRestoring(null)
    if (res.ok) router.refresh()
  }

  const isEmpty = books.length === 0 && artworks.length === 0

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2 text-center flex items-center justify-center gap-2">
        <Trash2 className="w-5 h-5" /> {t('trash_title')}
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">{t('trash_desc')}</p>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-gray-400 text-sm">{t('trash_empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map(b => (
            <div key={b.id} className="bg-white rounded-3xl p-4 border border-gray-100 flex items-center gap-3">
              {(b.cover_url || b.photo_url) ? (
                <div className="relative w-12 h-16 flex-shrink-0">
                  <Image src={toImgSrc(b.cover_url || b.photo_url)!} alt={b.title} fill className="rounded-xl object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-12 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg">📕</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-sm">{b.title}</p>
                <p className="text-xs text-gray-400">{b.profileName} · {t('trash_days_left', daysLeft(b.deleted_at) as never)}</p>
              </div>
              <button
                onClick={() => handleRestore('book', b.id)}
                disabled={restoring === b.id}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold transition disabled:opacity-50"
                style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
              >
                <Undo2 className="w-3.5 h-3.5" /> {t('trash_restore')}
              </button>
            </div>
          ))}

          {artworks.map(a => (
            <div key={a.id} className="bg-white rounded-3xl p-4 border border-gray-100 flex items-center gap-3">
              {a.image_url ? (
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src={toImgSrc(a.image_url)!} alt={a.title || ''} fill className="rounded-xl object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg">🎨</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-sm">{a.title || '—'}</p>
                <p className="text-xs text-gray-400">{a.profileName} · {t('trash_days_left', daysLeft(a.deleted_at) as never)}</p>
              </div>
              <button
                onClick={() => handleRestore('artwork', a.id)}
                disabled={restoring === a.id}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold transition disabled:opacity-50"
                style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
              >
                <Undo2 className="w-3.5 h-3.5" /> {t('trash_restore')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
