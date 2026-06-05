'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Plus } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleContext'

type Profile = { id: string; name: string }
type Book = {
  id: string; title: string; cover_url: string | null; rating: number | null; profile_id: string
}
type Badge = { id: string; badge_type: string; profile_id: string }

const profileColors = [
  { bg: 'var(--green-light)', accent: 'var(--green-dark)', star: 'var(--green)' },
  { bg: 'var(--pink-light)', accent: 'var(--pink-dark)', star: 'var(--pink)' },
  { bg: 'var(--purple-light)', accent: 'var(--purple-dark)', star: 'var(--purple)' },
  { bg: 'var(--yellow-light)', accent: 'var(--yellow-dark)', star: 'var(--yellow)' },
]

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
          <div key={profile.id} className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h2 className="font-semibold text-lg" style={{color: color.accent}}>{profile.name}</h2>
                <p className="text-xs text-gray-400">{t('bookshelf_count', profileBooks.length as never)}</p>
              </div>
              {profileBadges.length > 0 && (
                <span className="text-xs text-gray-400 font-medium">{t('bookshelf_badges', profileBadges.length as never)}</span>
              )}
            </div>

            {profileBooks.length === 0 ? (
              <div className="rounded-2xl border p-8 text-center" style={{borderColor: color.accent + '30', background: color.bg}}>
                <p className="text-gray-400 text-sm mb-3">{t('bookshelf_empty')}</p>
                <Link href="/add" className="inline-block font-bold text-sm" style={{color: color.accent}}>
                  {t('bookshelf_add_first')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {profileBooks.map(book => (
                  <Link key={book.id} href={`/book/${book.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border-2 transition hover:scale-[1.02]" style={{borderColor: color.bg}}>
                      {book.cover_url ? (
                        <div className="relative w-full aspect-[2/3]">
                          <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-full aspect-[2/3] flex items-center justify-center text-3xl font-bold text-gray-300" style={{background: color.bg}}>?</div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{book.title}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: book.rating || 0 }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5" style={{fill: color.star, color: color.star}} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* FAB */}
      <Link
        href="/add"
        className="fixed bottom-20 right-4 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition z-40 hover:scale-110"
        style={{background: 'var(--green)'}}
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  )
}
