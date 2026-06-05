'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { RECOMMENDED_BOOKS } from '@/lib/recommendations'

const gradeColors = [
  { bg: 'var(--green-light)', accent: 'var(--green-dark)', border: 'var(--green)' },
  { bg: 'var(--pink-light)', accent: 'var(--pink-dark)', border: 'var(--pink)' },
  { bg: 'var(--purple-light)', accent: 'var(--purple-dark)', border: 'var(--purple)' },
  { bg: 'var(--yellow-light)', accent: 'var(--yellow-dark)', border: 'var(--yellow)' },
]

export default function RecommendationsPage() {
  const grades = Object.keys(RECOMMENDED_BOOKS)
  const [openGrade, setOpenGrade] = useState<string>(grades[0])

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black text-gray-800 mb-1">추천 도서</h1>
      <p className="text-sm text-gray-400 mb-6">학년별 추천 책 목록이에요</p>

      <div className="space-y-3">
        {grades.map((grade, idx) => {
          const books = RECOMMENDED_BOOKS[grade]
          const color = gradeColors[idx % gradeColors.length]
          const isOpen = openGrade === grade

          return (
            <div key={grade} className="rounded-3xl overflow-hidden border-2" style={{borderColor: isOpen ? color.border : 'transparent', background: 'white'}}>
              {/* Header */}
              <button
                onClick={() => setOpenGrade(isOpen ? '' : grade)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{background: isOpen ? color.bg : 'white'}}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-base" style={{color: color.accent}}>{grade}</span>
                  <span className="text-xs text-gray-400 font-medium">{books.length}권</span>
                </div>
                {isOpen
                  ? <ChevronUp className="w-5 h-5" style={{color: color.accent}} />
                  : <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </button>

              {/* Books list */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-2">
                  {books.map((book, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white rounded-2xl p-3 border"
                      style={{borderColor: color.bg}}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 leading-tight">{book.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{book.author}</p>
                      </div>
                      <span
                        className="flex-shrink-0 text-xs px-2 py-1 rounded-full font-bold"
                        style={book.lang === 'ko'
                          ? {background: 'var(--purple-light)', color: 'var(--purple-dark)'}
                          : {background: 'var(--green-light)', color: 'var(--green-dark)'}
                        }
                      >
                        {book.lang === 'ko' ? '한국' : 'EN'}
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
