'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { RECOMMENDED_BOOKS } from '@/lib/recommendations'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Locale } from '@/lib/i18n/translations'
import { gradeLabel } from '@/lib/gradeLabels'

const gradeColors = [
  { bg: 'var(--green-light)', accent: 'var(--green-dark)', border: 'var(--green-light)' },
  { bg: 'var(--pink-light)', accent: 'var(--pink-dark)', border: 'var(--pink-light)' },
  { bg: 'var(--purple-light)', accent: 'var(--purple-dark)', border: 'var(--purple-light)' },
  { bg: 'var(--yellow-light)', accent: 'var(--yellow-dark)', border: 'var(--yellow-light)' },
]

const langLabel: Record<Locale, string> = { ko: '한국어', en: 'EN', es: 'ES' }

export default function RecommendationsPage() {
  const { t, locale, bookLocales } = useLocale()
  const grades = Object.keys(RECOMMENDED_BOOKS)
  const [openGrade, setOpenGrade] = useState<string>(grades[0])

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('rec_title')}</h1>
      <p className="text-sm text-gray-400 mb-6">{t('rec_subtitle')}</p>

      <div className="space-y-3">
        {grades.map((grade, idx) => {
          const allBooks = RECOMMENDED_BOOKS[grade]
          const books = allBooks.filter(b => bookLocales.includes(b.lang as Locale))
          if (books.length === 0) return null
          const color = gradeColors[idx % gradeColors.length]
          const isOpen = openGrade === grade

          return (
            <div key={grade} className="rounded-2xl overflow-hidden border" style={{borderColor: isOpen ? color.border : '#f0f0f0', background: 'white'}}>
              <button
                onClick={() => setOpenGrade(isOpen ? '' : grade)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{background: isOpen ? color.bg : 'white'}}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base" style={{color: color.accent}}>{gradeLabel(grade, locale)}</span>
                  <span className="text-xs text-gray-400 font-medium">{t('rec_count', books.length as never)}</span>
                </div>
                {isOpen
                  ? <ChevronUp className="w-5 h-5" style={{color: color.accent}} />
                  : <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-2">
                  {books.map((book, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white rounded-xl p-3 border"
                      style={{borderColor: '#f0f0f0'}}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 leading-tight">{book.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{book.author}</p>
                      </div>
                      <span
                        className="flex-shrink-0 text-xs px-2 py-1 rounded-full font-bold"
                        style={book.lang === 'ko'
                          ? {background: 'var(--purple-light)', color: 'var(--purple-dark)'}
                          : book.lang === 'en'
                          ? {background: 'var(--green-light)', color: 'var(--green-dark)'}
                          : {background: 'var(--yellow-light)', color: 'var(--yellow-dark)'}
                        }
                      >
                        {langLabel[book.lang as Locale] || book.lang}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
