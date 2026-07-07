'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Locale } from '@/lib/i18n/translations'

const appLocales: { value: Locale; label: string; flag: string }[] = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
]

export default function SettingsPage() {
  const { locale, setLocale, t } = useLocale()
  const [isParent, setIsParent] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('bl_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()
      setIsParent(profile?.role === 'parent')
    })
  }, [])

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">{t('settings_title')}</h1>

      {/* Trash — parents only */}
      {isParent && (
        <Link
          href="/trash"
          className="bg-white rounded-3xl p-5 border border-gray-100 mb-4 flex items-center gap-3 hover:bg-gray-50 transition"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--pink-light)' }}>
            <Trash2 className="w-5 h-5" style={{ color: 'var(--pink-dark)' }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-700 text-sm">{t('trash_title')}</p>
            <p className="text-xs text-gray-400">{t('trash_desc')}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
      )}

      {/* Add to home screen */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm">
          {locale === 'ko' ? '📱 홈 화면에 추가하기' : locale === 'es' ? '📱 Agregar a pantalla de inicio' : '📱 Add to Home Screen'}
        </h2>
        <div className="space-y-3">
          <div className="rounded-2xl p-3 text-xs text-gray-600 space-y-1" style={{ background: 'var(--green-light)' }}>
            <p className="font-bold text-gray-700">🍎 iPhone / iPad</p>
            {locale === 'ko' ? (
              <p>Safari에서 하단 <strong>공유 버튼(□↑)</strong> 탭 → <strong>"홈 화면에 추가"</strong> 선택</p>
            ) : locale === 'es' ? (
              <p>En Safari, toca el botón <strong>compartir (□↑)</strong> → selecciona <strong>"Agregar a inicio"</strong></p>
            ) : (
              <p>In Safari, tap the <strong>share button (□↑)</strong> → select <strong>"Add to Home Screen"</strong></p>
            )}
          </div>
          <div className="rounded-2xl p-3 text-xs text-gray-600 space-y-1" style={{ background: 'var(--purple-light)' }}>
            <p className="font-bold text-gray-700">🤖 Android</p>
            {locale === 'ko' ? (
              <p>Chrome에서 우측 상단 <strong>메뉴(⋮)</strong> 탭 → <strong>"앱 설치"</strong> 또는 <strong>"홈 화면에 추가"</strong> 선택</p>
            ) : locale === 'es' ? (
              <p>En Chrome, toca el <strong>menú (⋮)</strong> → selecciona <strong>"Instalar app"</strong> o <strong>"Agregar a inicio"</strong></p>
            ) : (
              <p>In Chrome, tap the <strong>menu (⋮)</strong> → select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></p>
            )}
          </div>
        </div>
      </div>

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
    </div>
  )
}
