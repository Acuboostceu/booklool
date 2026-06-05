'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BookOpen, PlusCircle, Star, Users, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/bookshelf', icon: BookOpen, label: '책장' },
  { href: '/add', icon: PlusCircle, label: '책 추가' },
  { href: '/recommendations', icon: Star, label: '추천' },
  { href: '/parent', icon: Users, label: '부모' },
]

const navColors = ['var(--green)', 'var(--pink)', 'var(--purple)', 'var(--yellow-dark)']

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* ── 모바일: 상단 헤더 + 하단 네비 ── */}
      <header className="md:hidden bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40" style={{borderBottom: '2px solid var(--green-light)'}}>
        <Link href="/bookshelf">
          <Image src="/booklool.png" alt="Booklool" width={140} height={46} className="object-contain h-9 w-auto" />
        </Link>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white flex z-50" style={{borderTop: '2px solid var(--green-light)'}}>
        {navItems.map(({ href, icon: Icon, label }, i) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition"
              style={{ color: active ? navColors[i] : '#aaa' }}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── 태블릿/데스크탑: 좌측 사이드바 ── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 bg-white z-40 px-4 py-6" style={{borderRight: '2px solid var(--green-light)'}}>
        <Link href="/bookshelf" className="mb-8 block">
          <Image src="/booklool.png" alt="Booklool" width={140} height={46} className="object-contain h-10 w-auto" />
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, icon: Icon, label }, i) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition"
                style={{
                  background: active ? 'var(--green-light)' : 'transparent',
                  color: active ? navColors[i] : '#999',
                }}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </aside>
    </>
  )
}
