'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale, TranslationKey } from './translations'

type TranslationValue = string | ((...args: never[]) => string)

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, ...args: never[]) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('bl_locale') as Locale | null
    if (saved && ['ko', 'en', 'es'].includes(saved)) setLocaleState(saved)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('bl_locale', l)
  }

  function t(key: TranslationKey, ...args: never[]): string {
    const val: TranslationValue = translations[locale][key] as TranslationValue
    if (typeof val === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (val as (...a: any[]) => string)(...args)
    }
    return val as string
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
