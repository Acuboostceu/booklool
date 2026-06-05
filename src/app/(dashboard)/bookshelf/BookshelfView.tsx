'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Plus, BookOpen } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { getProfileColor } from '@/lib/profileColors'

type Profile = { id: string; name: string; color?: string | null }
type Book = {
  id: string; title: string; cover_url: string | null; rating: number | null; profile_id: string
}
type Badge = { id: string; badge_type: string; profile_id: string }

// fallback colors for parent/partner profiles (no color column)
const fallbackColors = ['green', 'pink', 'purple', 'yellow']

export default function BookshelfView({
  profiles,
  books,
  badges,
  partnerIds = [],
}: {
  profiles: Profile[]
  books: Book[]
  badges: Badge[]
  partnerIds?: string[]
}) {
  const { t } = useLocale()

  const booksByProfile: Record<string, Book[]> = {}
  const badgesByProfile: Record<string, Badge[]> = {}
  profiles.forEach(p => {
    booksByProfile[p.id] = books.filter(b => b.profile_id === p.id)
    badgesByProfile[p.id] = badges.filter(b => b.profile_id === p.id)
  })

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('bookshelf_title')}</h1>

      {profiles.map((profile, idx) => {
        const profileBooks = booksByProfile[profile.id] || []
        const profileBadges = badgesByProfile[profile.id] || []
        const colorKey = profile.color || fallbackColors[idx % fallbackColors.length]
        const color = getProfileColor(colorKey)

        return (
          <div key={profile.id} className="mb-10">
            {/* Profile header */}
            <div className="flex items-center gap-2 mb-4">
              {/* Color dot */}
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
              <h2 className="font-bold text-base text-gray-800">{profile.name}</h2>
              <span className="text-xs text-gray-400">{t('bookshelf_count', profileBooks.length as never)}</span>
              {profileBadges.length > 0 && (
                <span
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: color.bg, color: color.accent }}
                >
                  {t('bookshelf_badges', profileBadges.length as never)}
                </span>
              )}
            </div>

            {/* Books grid or empty state */}
            {profileBooks.length === 0 ? (
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
                  {!partnerIds.includes(profile.id) && (
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {profileBooks.map(book => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group">
                    <div
                      className="rounded-2xl overflow-hidden border transition group-hover:shadow-md group-hover:scale-[1.02]"
                      style={{ borderColor: color.bg, borderWidth: 2 }}
                    >
                      {book.cover_url ? (
                        <div className="relative w-full aspect-[2/3]">
                          <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-full aspect-[2/3] flex items-center justify-center"
                          style={{ background: color.bg }}
                        >
                          <BookOpen className="w-8 h-8 opacity-30" style={{ color: color.accent }} />
                        </div>
                      )}
                      <div className="p-2 bg-white">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{book.title}</p>
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
                {/* Add book tile — hidden for partner */}
                {!partnerIds.includes(profile.id) && (
                  <Link href={`/add?profileId=${profile.id}`} className="group">
                    <div
                      className="rounded-2xl aspect-[2/3] border-2 border-dashed flex items-center justify-center transition group-hover:border-solid"
                      style={{ borderColor: color.dot + '60' }}
                    >
                      <Plus className="w-6 h-6 opacity-40" style={{ color: color.accent }} />
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      })}

    </div>
  )
}
