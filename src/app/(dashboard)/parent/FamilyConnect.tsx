'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Users } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleContext'

export default function FamilyConnect({
  familyCode,
  partnerName,
}: {
  familyCode: string
  partnerName: string | null
}) {
  const router = useRouter()
  const { t } = useLocale()
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
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" style={{color: 'var(--purple)'}} />
        {t('family_connect')}
      </h3>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">{t('family_code_label')}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 font-semibold text-lg tracking-widest text-center" style={{color: 'var(--purple-dark)'}}>
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

      {partnerName ? (
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{background: 'var(--green-light)'}}>
          <span className="text-xl">💑</span>
          <div>
            <p className="text-sm font-bold text-gray-800">{t('family_connected', partnerName as never)}</p>
            <p className="text-xs text-gray-500">{t('family_connected_desc')}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleJoin} className="space-y-2">
          <p className="text-xs text-gray-500">{t('family_enter_code')}</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder={t('family_code_placeholder')}
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
              {loading ? t('family_connecting') : t('family_connect_btn')}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </form>
      )}
    </div>
  )
}
