'use client'

import { useState, useEffect } from 'react'
import { translations, Locale, TranslationKey } from './translations'

export function useAuthLocale() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('bl_locale') as Locale | null
    if (saved && ['ko', 'en', 'es'].includes(saved)) setLocale(saved)
  }, [])

  function t(key: TranslationKey): string {
    const val = translations[locale][key]
    return typeof val === 'function' ? '' : (val as string)
  }

  return { locale, t }
}
