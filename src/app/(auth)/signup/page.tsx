'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const family_code = Math.random().toString(36).slice(2, 8).toUpperCase()
      const { error: profileError } = await supabase.from('bl_profiles').insert({
        user_id: data.user.id,
        role: 'parent',
        name,
        family_code,
      })
      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    router.push('/bookshelf')
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{background: 'var(--background)'}}>
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-48 h-48 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" style={{background: 'var(--green-light)'}} />
      <div className="fixed top-0 right-0 w-40 h-40 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3" style={{background: 'var(--pink-light)'}} />
      <div className="fixed bottom-0 left-0 w-44 h-44 rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" style={{background: 'var(--purple-light)'}} />
      <div className="fixed bottom-0 right-0 w-36 h-36 rounded-full opacity-30 translate-x-1/4 translate-y-1/4" style={{background: 'var(--yellow-light)'}} />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/booklool.png" alt="Booklool" className="h-12 w-auto mx-auto" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8" style={{border: '2px solid var(--green-light)'}}>
          <h2 className="text-xl font-black text-center mb-6 text-gray-700">회원가입</h2>

          {/* Google Login — hidden until Supabase project is separated */}
          <button
            onClick={handleGoogleLogin}
            className="hidden w-full flex items-center justify-center gap-3 rounded-2xl py-3 px-4 text-sm font-semibold text-gray-700 hover:opacity-80 transition mb-4"
            style={{border: '2px solid var(--green-light)', background: 'var(--green-light)'}}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 시작하기
          </button>


          <form onSubmit={handleSignup} className="space-y-3">
            <input
              type="text"
              placeholder="이름 (부모님 이름)"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{borderColor: 'var(--green-light)'}}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
            />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{borderColor: 'var(--green-light)'}}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border-2 rounded-2xl px-4 py-3 pr-11 text-sm outline-none transition"
                style={{borderColor: 'var(--green-light)'}}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-black rounded-2xl py-3 text-sm transition disabled:opacity-60"
              style={{background: 'var(--green)'}}
            >
              {loading ? '가입 중...' : '시작하기 🌿'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-black" style={{color: 'var(--green-dark)'}}>
            로그인
          </Link>
        </p>
        <div className="mt-3 text-center">
          <Link
            href="/child-login"
            className="inline-flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-2xl transition"
            style={{background: 'var(--yellow-light)', color: 'var(--yellow-dark)'}}
          >
            📚 어린이 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
