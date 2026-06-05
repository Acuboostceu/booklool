import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import BookActions from './BookActions'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase.from('bl_books').select('*').eq('id', id).single()
  if (!book) notFound()

  return (
    <div className="pb-24">
      <Link href="/bookshelf" className="flex items-center gap-1 text-gray-500 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> 책장으로
      </Link>

      {/* Edit / Delete */}
      <BookActions book={{ id: book.id, rating: book.rating, comment: book.comment, ai_answer: book.ai_answer, ai_question: book.ai_question }} />

      {/* Cover */}
      <div className="flex gap-4 mb-6">
        {book.cover_url ? (
          <Image src={book.cover_url} alt={book.title} width={90} height={128} className="rounded-2xl object-cover flex-shrink-0 shadow-md" />
        ) : (
          <div className="w-24 h-32 bg-amber-100 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">📖</div>
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
          <p className="text-xs text-gray-400 mt-1">{formatDate(book.read_at)}</p>
        </div>
      </div>

      {/* User photo */}
      {book.photo_url && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">📸 내가 찍은 사진</p>
          <div className="relative w-full rounded-2xl overflow-hidden" style={{aspectRatio: '3/4'}}>
            <Image src={book.photo_url} alt="book photo" fill className="object-contain bg-gray-50" />
          </div>
        </div>
      )}

      {/* Comment */}
      {book.comment && (
        <div className="bg-white rounded-3xl p-4 border border-gray-100 mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">✏️ 한 줄 감상</p>
          <p className="text-gray-800">{book.comment}</p>
        </div>
      )}

      {/* AI Q&A */}
      {book.ai_question && (
        <div className="bg-amber-50 rounded-3xl p-4 border border-amber-100 mb-4">
          <p className="text-xs font-semibold text-amber-600 mb-2">🤖 AI 독후 질문</p>
          <p className="font-semibold text-gray-800 mb-3">{book.ai_question}</p>
          {book.ai_answer ? (
            <div className="bg-white rounded-2xl p-3">
              <p className="text-sm text-gray-700">{book.ai_answer}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">아직 답변하지 않았어요</p>
          )}
        </div>
      )}

      {/* Description */}
      {book.description && (
        <div className="bg-white rounded-3xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">📋 책 소개</p>
          <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
        </div>
      )}
    </div>
  )
}
