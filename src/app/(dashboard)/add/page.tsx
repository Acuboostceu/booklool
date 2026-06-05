'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, Image as ImageIcon, Search, Star, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BookSearchResult } from '@/types'

type Step = 'capture' | 'search' | 'confirm' | 'review'

export default function AddBookPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('capture')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [authorQuery, setAuthorQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<BookSearchResult | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [children, setChildren] = useState<{ id: string; name: string }[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')

  async function loadChildren() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: parent } = await supabase
      .from('bl_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'parent')
      .single()
    if (!parent) return
    setProfileId(parent.id)
    const { data: kids } = await supabase
      .from('bl_profiles')
      .select('id, name')
      .eq('parent_id', parent.id)
    setChildren(kids || [])
    setSelectedChild(kids?.[0]?.id || parent.id)
  }

  useState(() => { loadChildren() })

  async function compressImage(file: File, maxWidth = 800): Promise<string> {
    return new Promise((resolve) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = url
    })
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setOcrLoading(true)

    try {
      const compressed = await compressImage(file)
      const base64 = compressed.split(',')[1]
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
      })
      if (res.ok) {
        const { title, author } = await res.json()
        setQuery(title || '')
        setAuthorQuery(author || '')
        if (title || author) handleSearch(title || '', author || '')
      }
    } catch (e) {
      // OCR 실패해도 검색 단계로 넘어감
    } finally {
      setOcrLoading(false)
      setStep('search')
    }
  }

  async function handleSearch(titleQ?: string, authorQ?: string) {
    const t = titleQ !== undefined ? titleQ : query
    const a = authorQ !== undefined ? authorQ : authorQuery
    if (!t.trim() && !a.trim()) return
    setSearching(true)
    const parts = []
    if (t.trim()) parts.push(`intitle:${t.trim()}`)
    if (a.trim()) parts.push(`inauthor:${a.trim()}`)
    const searchQ = parts.join('+')
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(searchQ)}`)
    const { results } = await res.json()
    setSearchResults(results)
    setSearching(false)
  }

  async function selectBook(book: BookSearchResult) {
    setSelected(book)
    setStep('confirm')
    // Generate AI question
    const res = await fetch('/api/ai-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: book.title, author: book.author, language: book.language }),
    })
    const { question } = await res.json()
    setAiQuestion(question)
    setStep('review')
  }

  async function handleSave() {
    if (!selected || !selectedChild) return
    setSaving(true)

    let photoUrl = ''
    if (photoFile) {
      // Presigned URL 발급 받아서 S3에 직접 업로드 (원본 화질)
      const presignRes = await fetch(
        `/api/upload?profileId=${selectedChild}&contentType=${encodeURIComponent(photoFile.type || 'image/jpeg')}`
      )
      if (presignRes.ok) {
        const { presignedUrl, publicUrl } = await presignRes.json()
        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: photoFile,
          headers: { 'Content-Type': photoFile.type || 'image/jpeg' },
        })
        if (uploadRes.ok) photoUrl = publicUrl
      }
    }

    await supabase.from('bl_books').insert({
      profile_id: selectedChild,
      title: selected.title,
      author: selected.author,
      publisher: selected.publisher,
      cover_url: selected.cover_url,
      photo_url: photoUrl,
      description: selected.description,
      isbn: selected.isbn,
      language: selected.language,
      rating,
      comment,
      ai_question: aiQuestion,
      ai_answer: aiAnswer,
    })

    // Check badges
    await checkBadges(selectedChild)

    router.push('/bookshelf')
  }

  async function checkBadges(pid: string) {
    const { count } = await supabase
      .from('bl_books')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', pid)

    const milestones: Record<number, string> = { 1: 'first_book', 5: 'books_5', 10: 'books_10', 20: 'books_20', 50: 'books_50' }
    const total = (count || 0) + 1
    if (milestones[total]) {
      await supabase.from('bl_badges').upsert({ profile_id: pid, type: milestones[total] })
    }
    if (aiAnswer) {
      await supabase.from('bl_badges').upsert({ profile_id: pid, type: 'answered_ai' })
    }
  }

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">책 추가</h1>

      {/* Child selector */}
      {children.length > 0 && (
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">누구의 책장에 추가할까요?</label>
          <div className="flex gap-2 flex-wrap">
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className="px-4 py-2 rounded-2xl text-sm font-medium transition border"
                style={selectedChild === c.id
                  ? {background: 'var(--green-light)', borderColor: 'var(--green)', color: 'var(--green-dark)'}
                  : {background: 'white', borderColor: '#e5e7eb', color: '#6b7280'}}
              >
                {c.name}
              </button>
            ))}
            {profileId && (
              <button
                onClick={() => setSelectedChild(profileId)}
                className="px-4 py-2 rounded-2xl text-sm font-medium transition border"
                style={selectedChild === profileId
                  ? {background: 'var(--green-light)', borderColor: 'var(--green)', color: 'var(--green-dark)'}
                  : {background: 'white', borderColor: '#e5e7eb', color: '#6b7280'}}
              >
                내 책장
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step: capture */}
      {step === 'capture' && (
        <div className="space-y-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full font-bold rounded-2xl py-6 flex flex-col items-center gap-3 transition"
            style={{background: 'var(--green-light)', color: 'var(--green-dark)'}}
          >
            <Camera className="w-8 h-8" />
            <span className="text-base">카메라로 찍기</span>
            <span className="text-xs opacity-70">책 표지를 찍으면 제목을 자동 인식해요</span>
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="w-full font-bold rounded-2xl py-6 flex flex-col items-center gap-3 transition"
            style={{background: 'var(--purple-light)', color: 'var(--purple-dark)'}}
          >
            <ImageIcon className="w-8 h-8" />
            <span className="text-base">사진첩에서 선택</span>
            <span className="text-xs opacity-60">저장된 사진에서 골라요</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          <input ref={galleryRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />

          <button
            onClick={() => setStep('search')}
            className="w-full bg-white font-semibold rounded-3xl py-4 flex items-center justify-center gap-2 transition border-2"
            style={{borderColor: 'var(--green-light)', color: 'var(--green-dark)'}}
          >
            <Search className="w-5 h-5" />
            직접 검색하기
          </button>
        </div>
      )}

      {/* Step: search */}
      {step === 'search' && (
        <div className="space-y-4">
          {photoPreview && (
            <div className="relative w-20 h-28 rounded-xl overflow-hidden">
              <Image src={photoPreview} alt="book photo" fill className="object-cover" />
            </div>
          )}
          {ocrLoading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              책 제목 인식 중...
            </div>
          )}
          <div className="space-y-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="책 제목"
              className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{borderColor: 'var(--green-light)'}}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
            />
            <div className="flex gap-2">
              <input
                value={authorQuery}
                onChange={e => setAuthorQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="저자 (선택)"
                className="flex-1 border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{borderColor: 'var(--purple-light)'}}
                onFocus={e => e.target.style.borderColor = 'var(--purple)'}
                onBlur={e => e.target.style.borderColor = 'var(--purple-light)'}
              />
              <button
                onClick={() => handleSearch()}
                disabled={searching}
                className="rounded-2xl px-4 font-semibold"
                style={{background: 'var(--green-light)', color: 'var(--green-dark)'}}
              >
                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {searchResults.map((book, i) => (
              <button
                key={i}
                onClick={() => selectBook(book)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 hover:border-gray-300 transition text-left"
              >
                {book.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} width={40} height={56} className="rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: review */}
      {(step === 'confirm' || step === 'review') && selected && (
        <div className="space-y-4">
          {/* Book info */}
          <div className="bg-white rounded-3xl p-4 flex gap-4 border border-gray-100">
            {selected.cover_url ? (
              <Image src={selected.cover_url} alt={selected.title} width={64} height={90} className="rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-24 bg-gray-100 rounded-xl flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-gray-800">{selected.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{selected.author}</p>
              {selected.publisher && <p className="text-xs text-gray-400 mt-0.5">{selected.publisher}</p>}
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">별점</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)}>
                  <Star className={`w-8 h-8 transition ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">한 줄 감상</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="이 책을 읽고 어떤 생각이 들었나요?"
              rows={2}
              className="w-full text-sm border border-gray-100 rounded-2xl p-3 outline-none focus:border-gray-300 resize-none"
            />
          </div>

          {/* AI Question */}
          {step === 'review' && aiQuestion && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">AI 독후 질문</p>
              <p className="font-semibold text-gray-800 mb-3 text-sm">{aiQuestion}</p>
              <textarea
                value={aiAnswer}
                onChange={e => setAiAnswer(e.target.value)}
                placeholder="내 생각을 써봐요..."
                rows={3}
                className="w-full text-sm border border-gray-100 rounded-xl p-3 outline-none focus:border-gray-300 resize-none bg-gray-50"
              />
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI 질문 생성 중...
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || rating === 0}
            className="w-full font-bold rounded-2xl py-4 transition disabled:opacity-60"
            style={{background: 'var(--green-light)', color: 'var(--green-dark)'}}
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
          {rating === 0 && <p className="text-xs text-center text-gray-400">별점을 선택해주세요</p>}
        </div>
      )}
    </div>
  )
}
