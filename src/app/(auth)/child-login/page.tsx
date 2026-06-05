'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ChildLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const email = `${username.toLowerCase()}@booklool.app`
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError('아이디 또는 비밀번호가 틀렸어요 🙈')
      setLoading(false)
      return
    }

    router.push('/bookshelf')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{background: 'var(--background)'}}>
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-48 h-48 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" style={{background: 'var(--yellow-light)'}} />
      <div className="fixed top-0 right-0 w-40 h-40 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3" style={{background: 'var(--green-light)'}} />
      <div className="fixed bottom-0 left-0 w-44 h-44 rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" style={{background: 'var(--pink-light)'}} />
      <div className="fixed bottom-0 right-0 w-36 h-36 rounded-full opacity-30 translate-x-1/4 translate-y-1/4" style={{background: 'var(--purple-light)'}} />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <img src="/booklool.png" alt="Booklool" className="h-12 w-auto mx-auto" />
          <p className="mt-3 text-sm font-black" style={{ color: 'var(--green)' }}>📚 내 책장에 들어가기</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8" style={{ border: '2px solid var(--green-light)' }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">아이디</label>
              <input
                type="text"
                placeholder="내 아이디를 입력해요"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                required
                className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{ borderColor: 'var(--green-light)' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력해요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full border-2 rounded-2xl px-4 py-3 pr-11 text-sm outline-none transition"
                  style={{ borderColor: 'var(--green-light)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 rounded-2xl px-4 py-3 text-sm text-red-500 text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-black rounded-2xl py-3 text-sm transition disabled:opacity-60"
              style={{ background: 'var(--green)' }}
            >
              {loading ? '들어가는 중...' : '📖 내 책장 열기'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          부모님이신가요?{' '}
          <Link href="/login" className="font-bold" style={{ color: 'var(--green-dark)' }}>
            부모 로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

