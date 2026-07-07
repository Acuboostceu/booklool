'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthLocale } from '@/lib/i18n/useAuthLocale'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useAuthLocale()
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

    sessionStorage.setItem('bl_show_pwa_prompt', '1')
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
      <div className="fixed top-0 left-0 w-48 h-48 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" style={{background: 'var(--green-light)'}} />
      <div className="fixed top-0 right-0 w-40 h-40 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3" style={{background: 'var(--pink-light)'}} />
      <div className="fixed bottom-0 left-0 w-44 h-44 rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" style={{background: 'var(--purple-light)'}} />
      <div className="fixed bottom-0 right-0 w-36 h-36 rounded-full opacity-30 translate-x-1/4 translate-y-1/4" style={{background: 'var(--yellow-light)'}} />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <img src="/booklool.png" alt="Booklool" className="h-12 w-auto mx-auto" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8" style={{border: '2px solid var(--green-light)'}}>
          <h2 className="text-xl font-black text-center mb-6 text-gray-700">{t('auth_signup')}</h2>

          {/* Google Login — hidden until Supabase project is separated */}
          <button onClick={handleGoogleLogin} className="hidden" aria-hidden="true" />

          <form onSubmit={handleSignup} className="space-y-3">
            <input
              type="text"
              placeholder={t('auth_name_placeholder')}
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
              placeholder={t('auth_email_placeholder')}
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
                placeholder={t('auth_password_placeholder')}
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
              {loading ? t('auth_signup_loading') : t('auth_signup_btn')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t('auth_has_account')}{' '}
          <Link href="/login" className="font-black" style={{color: 'var(--green-dark)'}}>
            {t('auth_login')}
          </Link>
        </p>
        <div className="mt-3 text-center">
          <Link
            href="/child-login"
            className="inline-flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-2xl transition"
            style={{background: 'var(--yellow-light)', color: 'var(--yellow-dark)'}}
          >
            {t('auth_child_login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
