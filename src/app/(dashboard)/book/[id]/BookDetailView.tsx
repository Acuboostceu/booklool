'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/LocaleContext'
import BookActions, { BookEditForm } from './BookActions'
import ReadingLogSection from './ReadingLogSection'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

type Book = {
  id: string
  profile_id: string
  title: string
  author: string | null
  publisher: string | null
  cover_url: string | null
  photo_url: string | null
  rating: number | null
  comment: string | null
  ai_question: string | null
  ai_answer: string | null
  description: string | null
  read_at: string | null
  total_pages: number | null
}

export default function BookDetailView({ book, canDelete = true }: { book: Book; canDelete?: boolean }) {
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (searchParams.get('edit') === '1') {
      setEditing(true)
      // Scroll to edit form after it renders
      setTimeout(() => {
        document.getElementById('book-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [searchParams])

  const bookData = {
    id: book.id,
    profile_id: book.profile_id,
    rating: book.rating,
    comment: book.comment,
    ai_answer: book.ai_answer,
    ai_question: book.ai_question,
    photo_url: book.photo_url,
  }

  return (
    <div className="pb-24">

      {/* Top action buttons (back / edit / delete) — always visible */}
      <BookActions book={bookData} editing={editing} setEditing={setEditing} canDelete={canDelete} />

      {/* Cover */}
      <div className="flex gap-4 mb-6">
        {book.cover_url ? (
          <Image src={book.cover_url} alt={book.title} width={90} height={128} className="rounded-2xl object-cover flex-shrink-0 shadow-md" />
        ) : (
          <div className="w-24 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 font-bold text-2xl flex-shrink-0">?</div>
        )}
        <div>
          <h1 className="font-black text-xl text-gray-800 leading-tight">{book.title}</h1>
          {book.author && <p className="text-gray-500 text-sm mt-1">{book.author}</p>}
          {book.publisher && <p className="text-gray-400 text-xs mt-0.5">{book.publisher}</p>}
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < (book.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatDate(book.read_at ?? '')}</p>
        </div>
      </div>

      {/* User photo / Comment / AI Q&A — hidden while editing (editable in form below) */}
      {!editing && (
        <>
          {book.photo_url && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t('book_photo')}</p>
              <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <Image src={book.photo_url} alt="book photo" fill className="object-contain bg-gray-50" />
              </div>
            </div>
          )}

          {book.comment && (
            <div className="bg-white rounded-3xl p-4 border border-gray-100 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t('book_comment')}</p>
              <p className="text-gray-800">{book.comment}</p>
            </div>
          )}

          {book.ai_question && (
            <div className="rounded-3xl p-4 border mb-4" style={{ background: 'var(--purple-light)', borderColor: 'var(--purple-light)' }}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t('book_ai_question')}</p>
              <p className="font-semibold text-gray-800 mb-3">{book.ai_question}</p>
              {book.ai_answer ? (
                <div className="bg-white rounded-2xl p-3">
                  <p className="text-sm text-gray-700">{book.ai_answer}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">—</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Description */}
      {book.description && (
        <div className="bg-white rounded-3xl p-4 border border-gray-100 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t('book_description')}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
        </div>
      )}

      {/* Reading Log — only for log-mode books (total_pages set) */}
      {book.total_pages && (
        <ReadingLogSection bookId={book.id} profileId={book.profile_id} totalPages={book.total_pages} />
      )}

      {/* Edit form — appears below reading log when editing */}
      {editing && (
        <div id="book-edit-form">
          <BookEditForm book={bookData} setEditing={setEditing} />
        </div>
      )}
    </div>
  )
}
