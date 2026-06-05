'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Users } from 'lucide-react'

export default function FamilyConnect({
  familyCode,
  partnerName,
}: {
  familyCode: string
  partnerName: string | null
}) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(familyCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/family/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ family_code: code }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || '연결 실패')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100 mb-4">
      <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" style={{color: 'var(--purple)'}} />
        가족 연결
      </h3>

      {/* My family code */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">내 가족 코드 (배우자에게 공유하세요)</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 font-black text-lg tracking-widest text-center" style={{color: 'var(--purple-dark)'}}>
            {familyCode}
          </div>
          <button
            onClick={handleCopy}
            className="p-3 rounded-2xl transition flex items-center justify-center"
            style={{background: copied ? 'var(--green-light)' : 'var(--purple-light)'}}
          >
            {copied
              ? <Check className="w-5 h-5" style={{color: 'var(--green-dark)'}} />
              : <Copy className="w-5 h-5" style={{color: 'var(--purple-dark)'}} />
            }
          </button>
        </div>
      </div>

      {/* Partner status or join form */}
      {partnerName ? (
        <div className="flex items-center gap-3 bg-green-50 rounded-2xl px-4 py-3">
          <span className="text-xl">💑</span>
          <div>
            <p className="text-sm font-bold text-gray-800">{partnerName}님과 연결됨</p>
            <p className="text-xs text-gray-500">같은 가족 책장을 보고 있어요</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleJoin} className="space-y-2">
          <p className="text-xs text-gray-500">배우자의 가족 코드 입력</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="코드 6자리"
              maxLength={6}
              className="flex-1 border-2 rounded-2xl px-4 py-3 text-sm font-bold tracking-widest uppercase outline-none"
              style={{borderColor: 'var(--purple-light)'}}
              onFocus={e => e.target.style.borderColor = 'var(--purple)'}
              onBlur={e => e.target.style.borderColor = 'var(--purple-light)'}
            />
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="text-white font-black rounded-2xl px-4 py-3 text-sm transition disabled:opacity-60"
              style={{background: 'var(--purple)'}}
            >
              {loading ? '...' : '연결'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </form>
      )}
    </div>
  )
}
