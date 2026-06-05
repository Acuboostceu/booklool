'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthLocale } from '@/lib/i18n/useAuthLocale'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const { locale } = useAuthLocale()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const copy = {
    en: {
      title: 'New password',
      placeholder: 'New password (min. 6 characters)',
      btn: 'Save new password',
      saving: 'Saving...',
    },
    ko: {
      title: '새 비밀번호',
      placeholder: '새 비밀번호 (6자 이상)',
      btn: '새 비밀번호 저장',
      saving: '저장 중...',
    },
    es: {
      title: 'Nueva contraseña',
      placeholder: 'Nueva contraseña (mín. 6 caracteres)',
      btn: 'Guardar nueva contraseña',
      saving: 'Guardando...',
    },
  }

  const t = copy[locale] ?? copy.en

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/bookshelf')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{background: 'var(--background)'}}>
      <div className="fixed top-0 left-0 w-48 h-48 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" style={{background: 'var(--green-light)'}} />
      <div className="fixed bottom-0 right-0 w-36 h-36 rounded-full opacity-30 translate-x-1/4 translate-y-1/4" style={{background: 'var(--pink-light)'}} />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <img src="/booklool.png" alt="Booklool" className="h-12 w-auto mx-auto" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8" style={{border: '2px solid var(--green-light)'}}>
          <h2 className="text-xl font-black text-center mb-6 text-gray-700">{t.title}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.placeholder}
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
              {loading ? t.saving : t.btn}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
