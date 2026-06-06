'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'

export default function FamilyConnect({
  familyCode,
  partnerName,
  plan,
}: {
  familyCode: string
  partnerName: string | null
  plan: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLocale()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showDisconnect, setShowDisconnect] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(familyCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDisconnect() {
    await fetch('/api/family/disconnect', { method: 'POST' })
    setShowDisconnect(false)
    router.refresh()
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    console.log('[join] submitting code:', code)
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_code: code }),
      })
      console.log('[join] response status:', res.status)
      const data = await res.json()
      console.log('[join] response data:', data)
      if (!res.ok) {
        setError(data.error || '연결 실패')
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('[join] fetch error:', err)
      setError('네트워크 오류')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100 mb-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" style={{color: 'var(--purple)'}} />
        {t('family_connect')}
      </h3>

      {partnerName ? (
        <div>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-2" style={{background: 'var(--green-light)'}}>
            <span className="text-xl">💑</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{t('family_connected', partnerName as never)}</p>
              <p className="text-xs text-gray-500">{t('family_connected_desc')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDisconnect(true)}
            className="w-full text-xs font-bold py-2 rounded-2xl transition"
            style={{ color: 'var(--pink-dark)', background: 'var(--pink-light)' }}
          >
            {t('family_disconnect')}
          </button>

          {showDisconnect && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
                <p className="font-black text-gray-800 text-lg mb-2">{t('family_disconnect_confirm')}</p>
                <p className="text-sm text-gray-500 mb-6">{t('family_disconnect_desc')}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDisconnect(false)}
                    className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100"
                  >
                    {t('book_cancel')}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 py-3 rounded-2xl font-bold text-white"
                    style={{ background: 'var(--pink)' }}
                  >
                    {t('family_disconnect')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : plan === 'family' ? (
        /* 결제한 쪽: 코드 공유만 */
        <div>
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
          <p className="text-xs text-gray-400 mt-2 text-center">파트너에게 이 코드를 공유하세요</p>
        </div>
      ) : (
        /* 결제 안 한 쪽: 업그레이드 + 코드 입력 */
        <div className="space-y-3">
          <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--purple-light)' }}>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--purple-dark)' }}>👨‍👩‍👧‍👦 Family Plan</p>
            <p className="text-xs text-gray-500 mb-3">Upgrade to connect your partner and add unlimited children.</p>
            <button
              onClick={async () => {
                const res = await fetch('/api/stripe/checkout', { method: 'POST' })
                const { url } = await res.json()
                if (url) window.location.href = url
              }}
              className="w-full font-black rounded-2xl py-2.5 text-sm text-white transition"
              style={{ background: 'var(--purple)' }}
            >
              Upgrade — $3/mo
            </button>
          </div>
          <p className="text-xs text-center text-gray-400">— 또는 파트너가 이미 결제했다면 —</p>
          <form onSubmit={handleJoin} className="space-y-2">
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
        </div>
      )}
    </div>
  )
}
