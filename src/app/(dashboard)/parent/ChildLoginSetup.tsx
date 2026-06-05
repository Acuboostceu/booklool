'use client'

import { useState } from 'react'
import { KeyRound, Check } from 'lucide-react'

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
      setError(data.error || '오류 발생')
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
          {done || hasLogin ? `로그인 설정됨 (${username || newUsername}) — 변경` : '아이 로그인 설정'}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs font-bold text-gray-600">{childName} 로그인 설정</p>
          <input
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="영문+숫자만 (예: elisha01)"
            required
            disabled={hasLogin}
            className="w-full border-2 rounded-xl px-3 py-2 text-sm outline-none disabled:bg-gray-50"
            style={{ borderColor: 'var(--purple-light)' }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={hasLogin ? '새 비밀번호 (변경 시)' : '비밀번호 (4자 이상)'}
            required={!hasLogin}
            minLength={4}
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
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 rounded-xl text-xs font-bold text-gray-400 bg-gray-100"
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
