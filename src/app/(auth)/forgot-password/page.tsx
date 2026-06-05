'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthLocale } from '@/lib/i18n/useAuthLocale'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const { locale } = useAuthLocale()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const copy = {
    en: {
      title: 'Reset password',
      desc: "Enter your email and we'll send you a reset link.",
      placeholder: 'Email',
      btn: 'Send reset link',
      sending: 'Sending...',
      sent_title: 'Check your email!',
      sent_desc: 'We sent a password reset link to',
      back: 'Back to login',
    },
    ko: {
      title: '비밀번호 재설정',
      desc: '가입한 이메일을 입력하면 재설정 링크를 보내드려요.',
      placeholder: '이메일',
      btn: '재설정 링크 보내기',
      sending: '보내는 중...',
      sent_title: '이메일을 확인해 주세요!',
      sent_desc: '비밀번호 재설정 링크를 보냈어요:',
      back: '로그인으로 돌아가기',
    },
    es: {
      title: 'Restablecer contraseña',
      desc: 'Ingresa tu correo y te enviaremos un enlace.',
      placeholder: 'Correo electrónico',
      btn: 'Enviar enlace',
      sending: 'Enviando...',
      sent_title: '¡Revisa tu correo!',
      sent_desc: 'Enviamos un enlace a',
      back: 'Volver al inicio de sesión',
    },
  }

  const t = copy[locale] ?? copy.en

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{background: 'var(--background)'}}>
      <div className="fixed top-0 left-0 w-48 h-48 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" style={{background: 'var(--green-light)'}} />
      <div className="fixed bottom-0 right-0 w-36 h-36 rounded-full opacity-30 translate-x-1/4 translate-y-1/4" style={{background: 'var(--yellow-light)'}} />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <img src="/booklool.png" alt="Booklool" className="h-12 w-auto mx-auto" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8" style={{border: '2px solid var(--green-light)'}}>
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-lg font-black text-gray-700 mb-2">{t.sent_title}</h2>
              <p className="text-sm text-gray-500">{t.sent_desc}</p>
              <p className="text-sm font-bold text-gray-700 mt-1">{email}</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-center mb-2 text-gray-700">{t.title}</h2>
              <p className="text-xs text-center text-gray-400 mb-6">{t.desc}</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder={t.placeholder}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
                  style={{borderColor: 'var(--green-light)'}}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-black rounded-2xl py-3 text-sm transition disabled:opacity-60"
                  style={{background: 'var(--green)'}}
                >
                  {loading ? t.sending : t.btn}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          <Link href="/login" className="font-bold" style={{color: 'var(--green-dark)'}}>
            ← {t.back}
          </Link>
        </p>
      </div>
    </div>
  )
}
