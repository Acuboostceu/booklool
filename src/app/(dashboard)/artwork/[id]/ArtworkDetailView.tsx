'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Artwork = {
  id: string
  title: string | null
  image_url: string | null
  selected_caption: string | null
  created_at: string
}

export default function ArtworkDetailView({ artwork }: { artwork: Artwork }) {
  const router = useRouter()
  const supabase = createClient()

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(artwork.title ?? '')
  const [caption, setCaption] = useState(artwork.selected_caption ?? '')
  const [saving, setSaving] = useState(false)

  const formattedDate = new Date(artwork.created_at).toLocaleDateString('ko-KR', {
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

  return (
    <div className="min-h-screen pb-24 px-4 py-6 max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>작품 목록으로</span>
        </button>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Pencil size={14} />
            수정
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
            >
              <X size={14} /> 취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 text-sm font-bold"
              style={{ color: 'var(--green-dark)' }}
            >
              <Check size={14} /> {saving ? '저장 중...' : '저장'}
            </button>
          </div>
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
              src={artwork.image_url}
              alt={title || '작품 이미지'}
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
          {title || '제목 없음'}
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
              placeholder="캡션을 입력하세요"
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{caption}</p>
          )}
        </div>
      )}
    </div>
  )
}
