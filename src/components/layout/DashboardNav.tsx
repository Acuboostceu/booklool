'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BookOpen, PlusCircle, Star, Users, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/bookshelf', icon: BookOpen, label: '책장' },
  { href: '/add', icon: PlusCircle, label: '책 추가' },
  { href: '/recommendations', icon: Star, label: '추천' },
  { href: '/parent', icon: Users, label: '부모' },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navColors = ['var(--green)', 'var(--pink)', 'var(--purple)', 'var(--yellow-dark)']

  return (
    <>
      {/* Top header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between" style={{borderBottom: '2px solid var(--green-light)'}}>
        <Link href="/bookshelf">
          <Image src="/booklool.png" alt="Booklool" width={160} height={52} className="object-contain h-10 w-auto" />
        </Link>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white flex z-50" style={{borderTop: '2px solid var(--green-light)'}}>
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
    </>
  )
}
