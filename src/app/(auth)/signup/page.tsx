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

    // Create parent profile with unique family_code
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffbf5] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-amber-500 tracking-tight">
            Book<span className="relative">
              l<span className="inline-block w-5 h-5 rounded-full bg-amber-900 mx-0.5 align-middle" style={{marginBottom: '2px'}} />
              <span className="inline-block w-5 h-5 rounded-full bg-amber-900 mx-0.5 align-middle" style={{marginBottom: '2px'}} />
              l
            </span>
          </h1>
          <p className="text-amber-700 mt-2 text-sm font-medium">책 그림일기</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-8">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">회원가입</h2>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 시작하기
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            <input
              type="text"
              placeholder="이름 (부모님 이름)"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition"
            />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-11 text-sm outline-none focus:border-amber-400 transition"
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
              className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-2xl py-3 text-sm transition disabled:opacity-60"
            >
              {loading ? '가입 중...' : '시작하기 🎉'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-amber-600 font-semibold">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
