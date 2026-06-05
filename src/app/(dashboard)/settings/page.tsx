'use client'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { Locale } from '@/lib/i18n/translations'
import { Settings } from 'lucide-react'

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

  function toggleBookLocale(l: Locale) {
    if (bookLocales.includes(l)) {
      if (bookLocales.length === 1) return // keep at least one
      setBookLocales(bookLocales.filter(x => x !== l))
    } else {
      setBookLocales([...bookLocales, l])
    }
  }

  return (
    <div className="pb-24 max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" style={{color: 'var(--purple)'}} />
        {t('settings_title')}
      </h1>

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
