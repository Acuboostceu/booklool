'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Star, BookOpen, Palette, ChevronRight, Plus } from 'lucide-react'
import { toImgSrc } from '@/lib/imageProxy'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { getProfileColor } from '@/lib/profileColors'
import { useSwipeTab } from '@/lib/useSwipeTab'
import { usePwaPromptTrigger } from '@/lib/usePwaPromptTrigger'
import PwaInstallCard from '@/components/PwaInstallCard'

const PREVIEW_COUNT = 5

type Profile = { id: string; name: string; color?: string | null }
type Book = {
  id: string; title: string; cover_url: string | null; photo_url: string | null; rating: number | null; profile_id: string
}
type Badge = { id: string; badge_type: string; profile_id: string }
type Artwork = {
  id: string; title: string; image_url: string | null; profile_id: string; created_at: string
}

const fallbackColors = ['green', 'pink', 'purple', 'yellow']

function ProfileSection({
  profile,
  colorKey,
  books,
  badges,
  artworks,
  isPartner,
  initialTab,
}: {
  profile: Profile
  colorKey: string
  books: Book[]
  badges: Badge[]
  artworks: Artwork[]
  isPartner: boolean
  initialTab?: 'books' | 'art'
}) {
  const { t } = useLocale()
  const [tab, setTab] = useState<'books' | 'art'>(initialTab ?? 'books')
  // 네비 탭으로 books ↔ art 전환 시 (같은 페이지 재렌더) 상태 동기화
  useEffect(() => {
    setTab(initialTab ?? 'books')
  }, [initialTab])
  const color = getProfileColor(colorKey)
  const swipe = useSwipeTab(tab, setTab)

  return (
    <div className="mb-10">
      {/* Profile header */}
      <Link href={`/profile/${profile.id}`} className="flex items-center gap-2 mb-3 group">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
        <h2 className="font-bold text-base text-gray-800 group-hover:underline">{profile.name}</h2>
        {badges.length > 0 && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: color.bg, color: color.accent }}
          >
            {t('bookshelf_badges', badges.length as never)}
          </span>
        )}
        <ChevronRight className="w-4 h-4 ml-auto opacity-40" style={{ color: color.accent }} />
      </Link>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
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

      {/* Swipeable content */}
      <div {...swipe}>
        {/* Books tab */}
        {tab === 'books' && (
          <>
            {books.length === 0 ? (
              <div
                className="rounded-3xl p-8 flex flex-col items-center justify-center gap-3"
                style={{ background: color.bg }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: color.dot + '25' }}
                >
                  <BookOpen className="w-7 h-7" style={{ color: color.accent }} />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm font-medium">{t('bookshelf_empty')}</p>
                  {!isPartner && (
                    <Link
                      href={`/add?profileId=${profile.id}`}
                      className="inline-block mt-2 text-sm font-bold underline underline-offset-2"
                      style={{ color: color.accent }}
                    >
                      {t('bookshelf_add_first')}
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {!isPartner && (
                    <Link href={`/add?profileId=${profile.id}`} className="group">
                      <div
                        className="rounded-2xl overflow-hidden border-2 border-dashed transition group-hover:shadow-md group-hover:scale-[1.02] aspect-[2/3] flex flex-col items-center justify-center gap-1 px-1"
                        style={{ borderColor: color.bg, background: color.bg + '55' }}
                      >
                        <Plus className="w-7 h-7" style={{ color: color.accent }} />
                        <span className="text-xs font-semibold text-center leading-tight" style={{ color: color.accent }}>
                          {t('book_add_btn')}
                        </span>
                      </div>
                    </Link>
                  )}
                  {books.slice(0, PREVIEW_COUNT).map(book => (
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
                {books.length > PREVIEW_COUNT && (
                  <Link
                    href={`/profile/${profile.id}?tab=books`}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold"
                    style={{ color: color.accent }}
                  >
                    {t('profile_see_all', (books.length - PREVIEW_COUNT) as never)}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </>
            )}
          </>
        )}

        {/* Artwork tab */}
        {tab === 'art' && (
          <>
            {artworks.length === 0 ? (
              <div
                className="rounded-3xl p-8 flex flex-col items-center justify-center gap-3"
                style={{ background: color.bg }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: color.dot + '25' }}
                >
                  <Palette className="w-7 h-7" style={{ color: color.accent }} />
                </div>
                <p className="text-gray-500 text-sm font-medium">{t('artwork_empty')}</p>
                {!isPartner && (
                  <Link
                    href={`/add-artwork?profileId=${profile.id}`}
                    className="inline-block mt-1 text-sm font-bold underline underline-offset-2"
                    style={{ color: color.accent }}
                  >
                    {t('artwork_add_btn')}
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {!isPartner && (
                    <Link href={`/add-artwork?profileId=${profile.id}`} className="group">
                      <div
                        className="rounded-2xl overflow-hidden border-2 border-dashed transition group-hover:shadow-md group-hover:scale-[1.02] aspect-square flex flex-col items-center justify-center gap-1 px-1"
                        style={{ borderColor: color.bg, background: color.bg + '55' }}
                      >
                        <Plus className="w-7 h-7" style={{ color: color.accent }} />
                        <span className="text-xs font-semibold text-center leading-tight" style={{ color: color.accent }}>
                          {t('artwork_add_btn')}
                        </span>
                      </div>
                    </Link>
                  )}
                  {artworks.slice(0, PREVIEW_COUNT).map(art => (
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
                {artworks.length > PREVIEW_COUNT && (
                  <Link
                    href={`/profile/${profile.id}?tab=art`}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold"
                    style={{ color: color.accent }}
                  >
                    {t('profile_see_all', (artworks.length - PREVIEW_COUNT) as never)}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function BookshelfView({
  profiles,
  books,
  badges,
  artworks = [],
  partnerIds = [],
  initialTab,
  initialProfileId,
}: {
  profiles: Profile[]
  books: Book[]
  badges: Badge[]
  artworks?: Artwork[]
  partnerIds?: string[]
  initialTab?: string
  initialProfileId?: string
}) {
  const { t } = useLocale()
  const justSaved = usePwaPromptTrigger()

  const booksByProfile: Record<string, Book[]> = {}
  const badgesByProfile: Record<string, Badge[]> = {}
  const artworksByProfile: Record<string, Artwork[]> = {}
  profiles.forEach(p => {
    booksByProfile[p.id] = books.filter(b => b.profile_id === p.id)
    badgesByProfile[p.id] = badges.filter(b => b.profile_id === p.id)
    artworksByProfile[p.id] = artworks.filter(a => a.profile_id === p.id)
  })

  return (
    <div className="pb-24">
      {justSaved && <PwaInstallCard />}
      <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">{t('bookshelf_title')}</h1>

      {profiles.map((profile, idx) => {
        const colorKey = profile.color || fallbackColors[idx % fallbackColors.length]
        // profileId 지정 시 해당 섹션만, 없으면 (네비 Art 탭) 전체 섹션에 적용
        const initTab = (initialProfileId ? initialProfileId === profile.id : true) && initialTab === 'art' ? 'art' : undefined
        return (
          <ProfileSection
            key={profile.id}
            profile={profile}
            colorKey={colorKey}
            books={booksByProfile[profile.id] || []}
            badges={badgesByProfile[profile.id] || []}
            artworks={artworksByProfile[profile.id] || []}
            isPartner={partnerIds.includes(profile.id)}
            initialTab={initTab}
          />
        )
      })}
    </div>
  )
}
