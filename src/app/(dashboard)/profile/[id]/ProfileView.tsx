'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Star, Plus, BookOpen, Palette, ChevronLeft } from 'lucide-react'
import { toImgSrc } from '@/lib/imageProxy'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { getProfileColor } from '@/lib/profileColors'

type Book = {
  id: string; title: string; cover_url: string | null; photo_url: string | null
  rating: number | null; profile_id: string; created_at: string
}
type Artwork = {
  id: string; title: string; image_url: string | null; profile_id: string; created_at: string
}

function groupByMonth<T extends { created_at: string }>(items: T[]): { label: string; items: T[] }[] {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const d = new Date(item.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return Array.from(map.entries()).map(([key, items]) => {
    const [year, month] = key.split('-')
    const d = new Date(Number(year), Number(month) - 1)
    const label = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    return { label, items }
  })
}

export default function ProfileView({
  profile,
  books,
  artworks,
  isPartner,
  initialTab,
}: {
  profile: { id: string; name: string; color?: string | null }
  books: Book[]
  artworks: Artwork[]
  isPartner: boolean
  initialTab?: string
}) {
  const { t } = useLocale()
  const [tab, setTab] = useState<'books' | 'art'>(initialTab === 'art' ? 'art' : 'books')
  const color = getProfileColor(profile.color || 'green')

  const bookGroups = groupByMonth(books)
  const artGroups = groupByMonth(artworks)

  return (
    <div className="pb-24">
      {/* Back + title */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/bookshelf" className="p-1 rounded-full hover:bg-gray-100 transition">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color.dot }} />
          <h1 className="text-xl font-bold text-gray-800">{profile.name}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('books')}
          className="px-3 py-1 rounded-full text-xs font-semibold transition"
          style={tab === 'books'
            ? { background: color.dot, color: 'white' }
            : { background: color.bg, color: color.accent }}
        >
          {t('artwork_tab_books')}
          <span className="ml-1 opacity-70">{books.length}</span>
        </button>
        <button
          onClick={() => setTab('art')}
          className="px-3 py-1 rounded-full text-xs font-semibold transition"
          style={tab === 'art'
            ? { background: color.dot, color: 'white' }
            : { background: color.bg, color: color.accent }}
        >
          {t('artwork_tab_art')}
          <span className="ml-1 opacity-70">{artworks.length}</span>
        </button>
      </div>

      {/* Swipeable tab content */}
      <div>

      {/* Books by month */}
      {tab === 'books' && (
        <>
          {books.length === 0 && !isPartner ? (
            <div className="rounded-3xl p-8 flex flex-col items-center justify-center gap-3" style={{ background: color.bg }}>
              <BookOpen className="w-8 h-8 opacity-30" style={{ color: color.accent }} />
              <p className="text-gray-500 text-sm font-medium">{t('bookshelf_empty')}</p>
              <Link href={`/add?profileId=${profile.id}`} className="text-sm font-bold underline underline-offset-2" style={{ color: color.accent }}>
                {t('bookshelf_add_first')}
              </Link>
            </div>
          ) : (
            <>
              {bookGroups.map((group, groupIdx) => (
                <div key={group.label} className="mb-8">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{group.label}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {groupIdx === 0 && !isPartner && (
                      <Link href={`/add?profileId=${profile.id}`} className="group">
                        <div
                          className="rounded-2xl aspect-[2/3] border-2 border-dashed flex items-center justify-center transition group-hover:border-solid"
                          style={{ borderColor: color.dot + '60' }}
                        >
                          <Plus className="w-6 h-6 opacity-40" style={{ color: color.accent }} />
                        </div>
                      </Link>
                    )}
                    {group.items.map(book => (
                      <Link key={book.id} href={`/book/${book.id}`} className="group">
                        <div
                          className="rounded-2xl overflow-hidden border transition group-hover:shadow-md group-hover:scale-[1.02]"
                          style={{ borderColor: color.bg, borderWidth: 2 }}
                        >
                          {(book.cover_url || book.photo_url) ? (
                            <div className="relative w-full aspect-[2/3]">
                              <Image src={toImgSrc(book.cover_url || book.photo_url)!} alt={book.title} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ background: color.bg }}>
                              <BookOpen className="w-8 h-8 opacity-30" style={{ color: color.accent }} />
                            </div>
                          )}
                          <div className="p-2 bg-white">
                            <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{book.title}</p>
                            {(book.rating ?? 0) > 0 && (
                              <div className="flex items-center gap-0.5 mt-1">
                                {Array.from({ length: book.rating! }).map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5" style={{ fill: color.star, color: color.star }} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Artworks by month */}
      {tab === 'art' && (
        <>
          {artworks.length === 0 && !isPartner ? (
            <div className="rounded-3xl p-8 flex flex-col items-center justify-center gap-3" style={{ background: color.bg }}>
              <Palette className="w-8 h-8 opacity-30" style={{ color: color.accent }} />
              <p className="text-gray-500 text-sm font-medium">{t('artwork_empty')}</p>
              <Link href={`/add-artwork?profileId=${profile.id}`} className="text-sm font-bold underline underline-offset-2" style={{ color: color.accent }}>
                {t('artwork_add_btn')}
              </Link>
            </div>
          ) : (
            <>
              {artGroups.map((group, groupIdx) => (
                <div key={group.label} className="mb-8">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{group.label}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {groupIdx === 0 && !isPartner && (
                      <Link href={`/add-artwork?profileId=${profile.id}`} className="group">
                        <div
                          className="rounded-2xl aspect-square border-2 border-dashed flex items-center justify-center transition group-hover:border-solid"
                          style={{ borderColor: color.dot + '60' }}
                        >
                          <Plus className="w-6 h-6 opacity-40" style={{ color: color.accent }} />
                        </div>
                      </Link>
                    )}
                    {group.items.map(art => (
                      <Link key={art.id} href={`/artwork/${art.id}`} className="group">
                        <div
                          className="rounded-2xl overflow-hidden border-2 transition group-hover:shadow-md group-hover:scale-[1.02] aspect-square"
                          style={{ borderColor: color.bg }}
                        >
                          {art.image_url ? (
                            <div className="relative w-full h-full">
                              <Image src={toImgSrc(art.image_url)!} alt={art.title} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: color.bg }}>
                              <Palette className="w-6 h-6 opacity-30" style={{ color: color.accent }} />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 truncate mt-1 px-0.5">{art.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      </div>
    </div>
  )
}
