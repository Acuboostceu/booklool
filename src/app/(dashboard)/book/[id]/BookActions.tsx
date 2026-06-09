'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Star, X, Check, Camera, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'

type BookData = {
  id: string
  profile_id: string
  rating: number | null
  comment: string | null
  ai_answer: string | null
  ai_question: string | null
  photo_url: string | null
}

/** Top pill buttons: ← / Edit / Delete */
export default function BookActions({ book, editing, setEditing }: {
  book: BookData
  editing: boolean
  setEditing: (v: boolean) => void
}) {
  const router = useRouter()
  const { t } = useLocale()
  const supabase = createClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleDelete() {
    await supabase.from('bl_books').delete().eq('id', book.id)
    router.push('/bookshelf')
  }

  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => router.back()}
        className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-2xl text-sm font-bold transition"
        style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)' }}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {editing ? (
        <button
          onClick={() => setEditing(false)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold bg-gray-100 text-gray-500 transition"
        >
          <X className="w-4 h-4" /> {t('log_cancel')}
        </button>
      ) : (
        <>
          <button
            onClick={() => setEditing(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition"
            style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
          >
            <Pencil className="w-4 h-4" /> {t('book_edit')}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition"
            style={{ background: 'var(--pink-light)', color: 'var(--pink-dark)' }}
          >
            <Trash2 className="w-4 h-4" /> {t('book_delete')}
          </button>
        </>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <p className="font-black text-gray-800 text-lg mb-2">{t('book_delete_confirm')}</p>
            <p className="text-sm text-gray-500 mb-6">{t('book_delete_desc')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100"
              >
                {t('book_cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-2xl font-bold text-white"
                style={{ background: 'var(--pink)' }}
              >
                {t('book_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Edit form panel — rendered below reading log */
export function BookEditForm({ book, setEditing }: {
  book: BookData
  setEditing: (v: boolean) => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLocale()
  const fileRef = useRef<HTMLInputElement>(null)

  const [rating, setRating] = useState(book.rating || 0)
  const [comment, setComment] = useState(book.comment || '')
  const [aiAnswer, setAiAnswer] = useState(book.ai_answer || '')
  const [saving, setSaving] = useState(false)
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string>('')

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewPhotoFile(file)
    setNewPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setSaving(true)
    let photoUrl = book.photo_url || ''
    if (newPhotoFile) {
      try {
        const formData = new FormData()
        formData.append('file', newPhotoFile)
        formData.append('profileId', book.profile_id)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (uploadRes.ok) {
          const { publicUrl } = await uploadRes.json()
          photoUrl = publicUrl
        }
      } catch (err) {
        console.error('Photo upload failed:', err)
      }
    }
    await supabase.from('bl_books').update({
      rating,
      comment,
      ai_answer: aiAnswer,
      photo_url: photoUrl,
    }).eq('id', book.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-black text-gray-800">{t('book_edit')}</p>
        <button onClick={() => { setEditing(false); setNewPhotoFile(null); setNewPhotoPreview('') }}>
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Photo */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-2">{t('book_photo')}</p>
        <div className="relative">
          {(newPhotoPreview || book.photo_url) ? (
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-2">
              <Image
                src={newPhotoPreview || book.photo_url!}
                alt="book photo"
                fill
                className="object-cover"
              />
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold border-2 transition"
            style={{ borderColor: 'var(--green-light)', color: 'var(--green-dark)' }}
          >
            <Camera className="w-4 h-4" />
            {book.photo_url || newPhotoPreview ? t('book_photo_change') : t('book_photo_add')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 mb-2">{t('add_rating')}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)}>
              <Star className={`w-8 h-8 transition ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 mb-2">{t('book_comment')}</p>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={2}
          className="w-full text-sm border-2 rounded-2xl p-3 outline-none resize-none"
          style={{ borderColor: 'var(--green-light)' }}
        />
      </div>

      {book.ai_question && (
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">{t('book_ai_question')}</p>
          <p className="text-xs text-gray-400 mb-2">{book.ai_question}</p>
          <textarea
            value={aiAnswer}
            onChange={e => setAiAnswer(e.target.value)}
            rows={3}
            className="w-full text-sm border-2 rounded-2xl p-3 outline-none resize-none"
            style={{ borderColor: 'var(--purple-light)' }}
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl font-black text-white text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'var(--green)' }}
      >
        <Check className="w-4 h-4" />
        {saving ? t('book_saving') : t('book_save')}
      </button>
    </div>
  )
}
