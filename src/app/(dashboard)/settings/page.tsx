'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Locale } from '@/lib/i18n/translations'
import PlanSection from './PlanSection'
import ParentColorSection from './ParentColorSection'

const appLocales: { value: Locale; label: string; flag: string }[] = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
]

const bookLocaleOptions: { value: Locale; label: string; flag: string }[] = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
]

export default function SettingsPage() {
  const { locale, setLocale, bookLocales, setBookLocales, t } = useLocale()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  function toggleBookLocale(l: Locale) {
    if (bookLocales.includes(l)) {
      if (bookLocales.length === 1) return
      setBookLocales(bookLocales.filter(x => x !== l))
    } else {
      setBookLocales([...bookLocales, l])
    }
  }

  return (
    <div className="pb-24 max-w-md">
      <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">{t('settings_title')}</h1>

      {/* Upgrade success banner */}
      {showSuccess && (
        <div
          className="rounded-3xl p-4 mb-4 text-center animate-pulse"
          style={{ background: 'var(--green-light)' }}
        >
          <p className="text-lg mb-1">🎉</p>
          <p className="font-black text-sm" style={{ color: 'var(--green-dark)' }}>
            {locale === 'ko' ? '패밀리 플랜으로 업그레이드됐어요!' :
             locale === 'es' ? '¡Actualizado al Plan Familiar!' :
             'Welcome to the Family Plan!'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--green-dark)', opacity: 0.7 }}>
            {locale === 'ko' ? '파트너 연결과 자녀 무제한 추가가 가능해요.' :
             locale === 'es' ? 'Ahora puedes conectar a tu pareja y agregar hijos ilimitados.' :
             'You can now connect your partner and add unlimited children.'}
          </p>
        </div>
      )}

      {/* Plan */}
      <PlanSection locale={locale} />

      {/* Parent color */}
      <ParentColorSection />

      {/* App language */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm">{t('settings_language')}</h2>
        <div className="flex gap-2">
          {appLocales.map(({ value, label, flag }) => (
            <button
              key={value}
              onClick={() => setLocale(value)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-sm font-bold border-2 transition"
              style={{
                borderColor: locale === value ? 'var(--purple)' : 'var(--purple-light)',
                background: locale === value ? 'var(--purple-light)' : 'white',
                color: locale === value ? 'var(--purple-dark)' : '#aaa',
              }}
            >
              <span className="text-xl">{flag}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Book recommendation language */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-1 text-sm">{t('settings_book_language')}</h2>
        <p className="text-xs text-gray-400 mb-3">
          {locale === 'ko' ? '추천 도서 목록에 표시할 언어를 선택하세요 (복수 선택 가능)' :
           locale === 'es' ? 'Selecciona los idiomas para ver en recomendaciones (puedes elegir varios)' :
           'Select languages to show in recommendations (multiple allowed)'}
        </p>
        <div className="flex gap-2">
          {bookLocaleOptions.map(({ value, label, flag }) => {
            const selected = bookLocales.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggleBookLocale(value)}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-sm font-bold border-2 transition"
                style={{
                  borderColor: selected ? 'var(--green)' : 'var(--green-light)',
                  background: selected ? 'var(--green-light)' : 'white',
                  color: selected ? 'var(--green-dark)' : '#aaa',
                }}
              >
                <span className="text-xl">{flag}</span>
                {label}
                {selected && <span className="text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
