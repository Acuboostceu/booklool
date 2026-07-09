'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Pencil, Check, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toImgSrc } from '@/lib/imageProxy'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { useSwipeNavigate } from '@/lib/useSwipeNavigate'

type Artwork = {
  id: string
  profile_id: string
  title: string | null
  image_url: string | null
  selected_caption: string | null
  created_at: string
}

export default function ArtworkDetailView({ artwork, canDelete = true, prevId = null, nextId = null }: {
  artwork: Artwork
  canDelete?: boolean
  prevId?: string | null
  nextId?: string | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const { locale, t } = useLocale()

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(artwork.title ?? '')
  const [caption, setCaption] = useState(artwork.selected_caption ?? '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 스와이프: 왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전 (편집 중엔 비활성)
  const swipe = useSwipeNavigate(
    () => { if (!editing && nextId) router.push(`/artwork/${nextId}`) },
    () => { if (!editing && prevId) router.push(`/artwork/${prevId}`) },
  )

  const dateLocale = locale === 'ko' ? 'ko-KR' : locale === 'es' ? 'es-ES' : 'en-US'
  const formattedDate = new Date(artwork.created_at).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
  })

  async function handleSave() {
    setSaving(true)
    await supabase.rpc('update_artwork', {
      p_id: artwork.id,
      p_title: title,
      p_selected_caption: caption,
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  function handleCancel() {
    setTitle(artwork.title ?? '')
    setCaption(artwork.selected_caption ?? '')
    setEditing(false)
  }

  const artTab = `/bookshelf?profileId=${artwork.profile_id}&tab=art`

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch('/api/record/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'artwork', id: artwork.id }),
    })
    setDeleting(false)
    if (res.ok) {
      router.push(artTab)
      router.refresh()
    } else {
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen pb-24 px-4 py-6 max-w-lg mx-auto" {...swipe}>
      {/* Top bar */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => router.push(artTab)}
          className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-2xl text-sm font-bold transition"
          style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)' }}
        >
          <ArrowLeft size={16} />
        </button>
        {!editing ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition"
              style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
            >
              <Pencil size={14} /> {t('artwork_detail_edit')}
            </button>
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition"
                style={{ background: 'var(--pink-light)', color: 'var(--pink-dark)' }}
              >
                <Trash2 size={14} /> {t('artwork_detail_delete')}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold bg-gray-100 text-gray-500"
            >
              <X size={14} /> {t('artwork_detail_cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition disabled:opacity-60"
              style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
            >
              <Check size={14} /> {saving ? t('artwork_detail_saving') : t('artwork_detail_save')}
            </button>
          </>
        )}
      </div>

      {/* Framed artwork */}
      {artwork.image_url && (
        <div className="flex justify-center mb-8">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            <Image
              src={toImgSrc(artwork.image_url)!}
              alt={title || t('artwork_detail_no_title')}
              width={340}
              height={340}
              className="block object-cover"
              unoptimized
              style={{ display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* Title */}
      {editing ? (
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-center border-b-2 outline-none bg-transparent mb-1 pb-1"
          style={{ borderColor: 'var(--purple)' }}
        />
      ) : (
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          {title || t('artwork_detail_no_title')}
        </h1>
      )}

      {/* Date */}
      <p className="text-center text-xs text-gray-400 mb-6">{formattedDate}</p>

      {/* Caption */}
      {(caption || editing) && (
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: 'var(--yellow-light)' }}
        >
          {editing ? (
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={5}
              className="w-full text-sm text-gray-700 bg-transparent outline-none resize-none leading-relaxed"
              placeholder={t('artwork_detail_caption_placeholder')}
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{caption}</p>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <p className="font-black text-gray-800 text-lg mb-2">{t('artwork_detail_delete_title')}</p>
            <p className="text-sm text-gray-500 mb-6">{t('artwork_detail_delete_desc')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100"
              >
                {t('artwork_detail_cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl font-bold text-white disabled:opacity-60"
                style={{ background: 'var(--pink)' }}
              >
                {deleting ? t('artwork_detail_deleting') : t('artwork_detail_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
