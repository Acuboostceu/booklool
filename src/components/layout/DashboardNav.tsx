'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, PlusCircle, Star, Users, LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { useEffect, useState } from 'react'

const navColors = [
  'var(--green-dark)',
  'var(--pink-dark)',
  'var(--purple-dark)',
  'var(--yellow-dark)',
  'var(--purple-dark)',
]
const navBgs = [
  'var(--green-light)',
  'var(--pink-light)',
  'var(--purple-light)',
  'var(--yellow-light)',
  'var(--purple-light)',
]

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLocale()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [supabase])

  const navItems = [
    { href: '/bookshelf', icon: BookOpen, label: t('nav_bookshelf') },
    { href: '/add', icon: PlusCircle, label: t('nav_add') },
    { href: '/recommendations', icon: Star, label: t('nav_recommendations') },
    { href: '/parent', icon: Users, label: t('nav_family') },
    { href: '/settings', icon: Settings, label: t('settings_title') },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = userEmail ? userEmail.split('@')[0] : ''

  return (
    <>
      {/* ── 모바일: 상단 헤더 ── */}
      <header
        className="md:hidden bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40"
        style={{ borderBottom: '1px solid var(--green-light)' }}
      >
        <Link href="/bookshelf">
          <img src="/booklool.png" alt="Booklool" className="object-contain h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className="p-2 rounded-xl transition"
            style={{ color: pathname === '/settings' ? 'var(--purple-dark)' : '#bbb' }}
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── 모바일: 하단 네비 (Settings 제외, 5개 → 4개) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white flex z-50"
        style={{ borderTop: '1px solid var(--green-light)' }}
      >
        {navItems.slice(0, 4).map(({ href, icon: Icon, label }, i) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition"
              style={{ color: active ? navColors[i] : '#bbb' }}
            >
              {active ? (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5"
                  style={{ background: navBgs[i] }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ) : (
                <Icon className="w-5 h-5 mb-0.5" />
              )}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── 태블릿/데스크탑: 좌측 사이드바 ── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 bg-white z-40"
        style={{ borderRight: '1px solid #f0ede8' }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <Link href="/bookshelf">
            <img src="/booklool.png" alt="Booklool" className="object-contain h-9 w-auto" />
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-3" style={{ height: 1, background: '#f0ede8' }} />

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }, i) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition"
                style={{
                  background: active ? navBgs[i] : 'transparent',
                  color: active ? navColors[i] : '#9ca3af',
                  fontWeight: active ? 700 : 500,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: active ? 'white' : 'transparent',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 mt-2 mb-3" style={{ height: 1, background: '#f0ede8' }} />

        {/* User + logout */}
        <div className="px-3 pb-5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--green)' }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 truncate">{displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
          >
            <LogOut className="w-4 h-4" />
            {t('nav_logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
