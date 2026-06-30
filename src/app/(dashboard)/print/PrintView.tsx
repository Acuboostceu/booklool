'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

type Child = { id: string; name: string; color: string | null }
type ContentType = 'books' | 'artwork' | 'both'
type Step = 'select' | 'address' | 'confirm' | 'done'

const contentOptions: { value: ContentType; label: string; emoji: string; desc: string }[] = [
  { value: 'books', label: '책 기록', emoji: '📚', desc: '읽은 책 목록과 한마디' },
  { value: 'artwork', label: '그림 작품', emoji: '🎨', desc: '그린 그림과 캡션' },
  { value: 'both', label: '책 + 그림', emoji: '✨', desc: '책 기록과 그림 모두' },
]

export default function PrintView({ children, userEmail }: { children: Child[]; userEmail: string }) {
  const [step, setStep] = useState<Step>('select')
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [contentType, setContentType] = useState<ContentType>('both')
  const [address, setAddress] = useState({
    name: '', street1: '', street2: '', city: '', state: '', zip: '', country: 'US',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quote, setQuote] = useState<{ total: string } | null>(null)
  const [orderDone, setOrderDone] = useState(false)

  async function handleGetQuote() {
    if (!selectedChild || !address.name || !address.street1 || !address.city || !address.state || !address.zip) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/lulu/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageCount: 32,
          shippingAddress: {
            name: address.name,
            street1: address.street1,
            street2: address.street2 || undefined,
            city: address.city,
            state_code: address.state,
            postcode: address.zip,
            country_code: address.country,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(`가격 조회 실패: ${JSON.stringify(data.error)}`); return }
      const total = data.total_cost_incl_tax ?? data.total_cost_excl_tax ?? '—'
      setQuote({ total: `$${parseFloat(total).toFixed(2)}` })
      setStep('confirm')
    } catch {
      setError('오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOrder() {
    if (!selectedChild) return
    setLoading(true)
    setError('')
    try {
      // 1. PDF 생성
      const pdfRes = await fetch('/api/lulu/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: selectedChild.id, contentType }),
      })
      const pdfData = await pdfRes.json()
      if (!pdfRes.ok) { setError(pdfData.error || 'PDF 생성 실패'); return }

      // 2. 주문
      const orderRes = await fetch('/api/lulu/print-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interiorUrl: pdfData.interiorUrl,
          coverUrl: pdfData.coverUrl,
          pageCount: pdfData.pageCount,
          title: `${selectedChild.name}'s Book`,
          contactEmail: userEmail,
          shippingAddress: {
            name: address.name,
            street1: address.street1,
            street2: address.street2 || undefined,
            city: address.city,
            state_code: address.state,
            postcode: address.zip,
            country_code: address.country,
          },
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) { setError(orderData.error || '주문 실패'); return }

      setStep('done')
      setOrderDone(true)
    } catch {
      setError('오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2 text-center">📖 책 프린트</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">아이의 기록을 실제 책으로 만들어요</p>

      {step === 'done' ? (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl" style={{ background: 'var(--green-light)' }}>
            📬
          </div>
          <h2 className="text-lg font-bold text-gray-800 text-center">주문 완료!</h2>
          <p className="text-sm text-gray-500 text-center">Lulu에서 인쇄 후 배송해드려요.<br />보통 7–10 영업일 소요됩니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 아이 선택 */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">누구의 책을 만들까요?</h2>
            <div className="flex flex-col gap-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className="w-full text-left px-4 py-3 rounded-2xl border-2 font-semibold transition text-sm"
                  style={{
                    borderColor: selectedChild?.id === child.id ? 'var(--green)' : 'var(--green-light)',
                    background: selectedChild?.id === child.id ? 'var(--green-light)' : 'white',
                    color: 'var(--green-dark)',
                  }}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>

          {/* 콘텐츠 선택 */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">무엇을 담을까요?</h2>
            <div className="flex flex-col gap-2">
              {contentOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setContentType(opt.value)}
                  className="w-full text-left px-4 py-3 rounded-2xl border-2 transition"
                  style={{
                    borderColor: contentType === opt.value ? 'var(--purple)' : 'var(--purple-light)',
                    background: contentType === opt.value ? 'var(--purple-light)' : 'white',
                  }}
                >
                  <span className="font-bold text-sm" style={{ color: 'var(--purple-dark)' }}>
                    {opt.emoji} {opt.label}
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 배송지 */}
          {(step === 'select' || step === 'address') && (
            <div className="bg-white rounded-3xl p-4 border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 text-sm">배송지 (미국만 가능)</h2>
              <div className="space-y-2">
                {[
                  { key: 'name', placeholder: '받는 분 이름' },
                  { key: 'street1', placeholder: '주소' },
                  { key: 'street2', placeholder: '아파트/동 (선택)' },
                  { key: 'city', placeholder: '도시 (City)' },
                  { key: 'state', placeholder: '주 코드 (State, 예: CA)' },
                  { key: 'zip', placeholder: '우편번호 (ZIP)' },
                ].map(({ key, placeholder }) => (
                  <input
                    key={key}
                    value={address[key as keyof typeof address]}
                    onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none"
                    style={{ borderColor: 'var(--green-light)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* 가격 확인 단계 */}
          {step === 'confirm' && quote && (
            <div className="bg-white rounded-3xl p-4 border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 text-sm">주문 확인</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>받는 분</span><span className="font-semibold">{address.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>콘텐츠</span>
                  <span className="font-semibold">{contentOptions.find(o => o.value === contentType)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>아이</span><span className="font-semibold">{selectedChild?.name}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                  <span>총 금액 (인쇄 + 배송)</span><span>{quote.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          {step !== 'confirm' ? (
            <button
              onClick={handleGetQuote}
              disabled={loading || !selectedChild || !address.name || !address.street1 || !address.city || !address.state || !address.zip}
              className="w-full font-black rounded-2xl py-4 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--green)' }}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />처리 중...</> : '가격 확인하기'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100"
              >
                수정
              </button>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="flex-1 font-black rounded-2xl py-4 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--green)' }}
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />주문 중...</> : `${quote?.total} 주문하기`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
