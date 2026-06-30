'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Star, Users, LogOut, Settings, BookMarked } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { useEffect, useState } from 'react'

const supabase = createClient()

const navColors = [
  'var(--green-dark)',
  'var(--pink-dark)',
  'var(--purple-dark)',
  'var(--yellow-dark)',
  'var(--green-dark)',
]
const navBgs = [
  'var(--green-light)',
  'var(--pink-light)',
  'var(--purple-light)',
  'var(--yellow-light)',
  'var(--green-light)',
]

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLocale()
  const [isChild, setIsChild] = useState(false)

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('bl_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      setIsChild(profile?.role === 'child')
    }
    loadRole()
  }, [])

  const allNavItems = [
    { href: '/bookshelf', icon: BookOpen, label: t('nav_bookshelf'), childOk: true },
    { href: '/recommendations', icon: Star, label: t('nav_recommendations'), childOk: true },
    { href: '/parent', icon: Users, label: t('nav_family'), childOk: false },
    ...(process.env.NEXT_PUBLIC_PRINT_ENABLED === 'true'
      ? [{ href: '/print', icon: BookMarked, label: 'Print', childOk: false }]
      : []),
    { href: '/settings', icon: Settings, label: t('settings_title'), childOk: true },
  ]

  const navItems = allNavItems.filter(item => !isChild || item.childOk)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* 상단 헤더 — 모든 화면 */}
      <header
        className="px-4 py-3 flex items-center justify-between sticky top-0 z-40"
        style={{ background: '#fffbf5' }}
      >
        <Link href="/bookshelf">
          <img src="/booklool.png" alt="Booklool" className="object-contain h-8 w-auto" />
        </Link>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition p-2">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* 하단 네비 — 모든 화면 */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white flex z-50"
        style={{ borderTop: '1px solid var(--green-light)' }}
      >
        {navItems.map(({ href, icon: Icon, label }, i) => {
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
    </>
  )
}
