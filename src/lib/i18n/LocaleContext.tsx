'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale, TranslationKey } from './translations'

type TranslationValue = string | ((...args: never[]) => string)

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  bookLocales: Locale[]
  setBookLocales: (locales: Locale[]) => void
  t: (key: TranslationKey, ...args: never[]) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko')
  const [bookLocales, setBookLocalesState] = useState<Locale[]>(['ko'])

  useEffect(() => {
    const saved = localStorage.getItem('bl_locale') as Locale | null
    if (saved && ['ko', 'en', 'es'].includes(saved)) setLocaleState(saved)
    const savedBook = localStorage.getItem('bl_book_locales')
    if (savedBook) {
      try {
        const parsed = JSON.parse(savedBook)
        if (Array.isArray(parsed)) setBookLocalesState(parsed)
      } catch {}
    }
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('bl_locale', l)
  }

  function setBookLocales(ls: Locale[]) {
    setBookLocalesState(ls)
    localStorage.setItem('bl_book_locales', JSON.stringify(ls))
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
    <LocaleContext.Provider value={{ locale, setLocale, bookLocales, setBookLocales, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
