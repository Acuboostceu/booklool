'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Plus, BookOpen } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleContext'

type Profile = { id: string; name: string }
type Book = {
  id: string; title: string; cover_url: string | null; rating: number | null; profile_id: string
}
type Badge = { id: string; badge_type: string; profile_id: string }

const profileColors = [
  { bg: 'var(--green-light)', accent: 'var(--green-dark)', star: 'var(--green)', avatar: '#6ab87a' },
  { bg: 'var(--pink-light)', accent: 'var(--pink-dark)', star: 'var(--pink)', avatar: '#e8a0b4' },
  { bg: 'var(--purple-light)', accent: 'var(--purple-dark)', star: 'var(--purple)', avatar: '#a896d4' },
  { bg: 'var(--yellow-light)', accent: 'var(--yellow-dark)', star: 'var(--yellow)', avatar: '#e8cc78' },
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return name.slice(0, 2)
  return parts[0][0] + parts[parts.length - 1][0]
}

export default function BookshelfView({
  profiles,
  books,
  badges,
}: {
  profiles: Profile[]
  books: Book[]
  badges: Badge[]
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
        const color = profileColors[idx % profileColors.length]

        return (
          <div key={profile.id} className="mb-10">
            {/* Profile header */}
            <div className="flex items-center gap-3 mb-4">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: color.avatar }}
              >
                {initials(profile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base text-gray-800 leading-tight">{profile.name}</h2>
                <p className="text-xs text-gray-400">{t('bookshelf_count', profileBooks.length as never)}</p>
              </div>
              {profileBadges.length > 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
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
                  style={{ background: color.avatar + '25' }}
                >
                  <BookOpen className="w-7 h-7" style={{ color: color.accent }} />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm font-medium">{t('bookshelf_empty')}</p>
                  <Link
                    href="/add"
                    className="inline-block mt-2 text-sm font-bold underline underline-offset-2"
                    style={{ color: color.accent }}
                  >
                    {t('bookshelf_add_first')}
                  </Link>
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
                {/* Add book tile */}
                <Link href="/add" className="group">
                  <div
                    className="rounded-2xl aspect-[2/3] border-2 border-dashed flex items-center justify-center transition group-hover:border-solid"
                    style={{ borderColor: color.avatar + '60' }}
                  >
                    <Plus className="w-6 h-6 opacity-40" style={{ color: color.accent }} />
                  </div>
                </Link>
              </div>
            )}
          </div>
        )
      })}

      {/* FAB (mobile) */}
      <Link
        href="/add"
        className="md:hidden fixed bottom-20 right-4 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition z-40 hover:scale-110"
        style={{ background: 'var(--green)' }}
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  )
}
