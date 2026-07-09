'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleContext'

export default function ChildLoginSetup({
  childId,
  childName,
  hasLogin,
  username,
}: {
  childId: string
  childName: string
  hasLogin: boolean
  username: string | null
}) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [newUsername, setNewUsername] = useState(username || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/child/set-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: childId, username: newUsername, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t('child_login_error'))
    } else {
      setDone(true)
      setOpen(false)
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="mt-3 border-t border-gray-50 pt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-xs font-bold transition"
          style={{ color: 'var(--purple-dark)' }}
        >
          <KeyRound className="w-3.5 h-3.5" />
          {done || hasLogin
            ? t('child_login_configured', (username || newUsername) as never)
            : t('child_login_setup')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs font-bold text-gray-600">{t('child_login_form_title', childName as never)}</p>
          <input
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder={t('child_login_username_placeholder')}
            required
            disabled={hasLogin}
            className="w-full border-2 rounded-xl px-3 py-2 text-sm outline-none disabled:bg-gray-50"
            style={{ borderColor: 'var(--purple-light)' }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={hasLogin ? t('child_login_pw_new') : t('child_login_pw_set')}
            required={!hasLogin}
            minLength={6}
            className="w-full border-2 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--purple-light)' }}
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-white font-bold rounded-xl py-2 text-xs transition disabled:opacity-60"
              style={{ background: 'var(--purple)' }}
            >
              {loading ? t('child_login_saving') : t('child_login_save')}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 rounded-xl text-xs font-bold text-gray-400 bg-gray-100"
            >
              {t('child_login_cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
