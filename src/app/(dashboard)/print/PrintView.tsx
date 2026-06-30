'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

type Profile = { id: string; name: string; color: string | null; role: 'parent' | 'child' }
type ContentType = 'books' | 'artwork' | 'both'
type Step = 'select' | 'address' | 'confirm' | 'done'

const contentOptions: { value: ContentType; label: string; emoji: string; desc: string }[] = [
  { value: 'books', label: 'Book Records', emoji: '📚', desc: 'Books read with comments' },
  { value: 'artwork', label: 'Artwork', emoji: '🎨', desc: 'Drawings with captions' },
  { value: 'both', label: 'Books + Art', emoji: '✨', desc: 'Everything together' },
]

export default function PrintView({ profiles, userEmail }: { profiles: Profile[]; userEmail: string }) {
  const [step, setStep] = useState<Step>('select')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [contentType, setContentType] = useState<ContentType>('both')
  const [address, setAddress] = useState({
    name: '', street1: '', street2: '', city: '', state: '', zip: '', country: 'US',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quote, setQuote] = useState<{ total: string } | null>(null)

  function toggleProfile(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleGetQuote() {
    if (selectedIds.length === 0 || !address.name || !address.street1 || !address.city || !address.state || !address.zip) return
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
      if (!res.ok) { setError(`Quote failed: ${JSON.stringify(data.error)}`); return }
      const total = data.total_cost_incl_tax ?? data.total_cost_excl_tax ?? '—'
      setQuote({ total: `$${parseFloat(total).toFixed(2)}` })
      setStep('confirm')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOrder() {
    setLoading(true)
    setError('')
    try {
      for (const profileId of selectedIds) {
        const profile = profiles.find(p => p.id === profileId)!

        const pdfRes = await fetch('/api/lulu/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, contentType }),
        })
        const pdfData = await pdfRes.json()
        if (!pdfRes.ok) { setError(pdfData.error || 'PDF generation failed'); return }

        const orderRes = await fetch('/api/lulu/print-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interiorUrl: pdfData.interiorUrl,
            coverUrl: pdfData.coverUrl,
            pageCount: pdfData.pageCount,
            title: `${profile.name}'s Book`,
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
        if (!orderRes.ok) { setError(orderData.error || 'Order failed'); return }
      }
      setStep('done')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const parents = profiles.filter(p => p.role === 'parent')
  const children = profiles.filter(p => p.role === 'child')
  const selectedNames = profiles.filter(p => selectedIds.includes(p.id)).map(p => p.name)

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2 text-center">📖 Print a Book</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">Turn your family's memories into a real book</p>

      {step === 'done' ? (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl" style={{ background: 'var(--green-light)' }}>
            📬
          </div>
          <h2 className="text-lg font-bold text-gray-800 text-center">Order placed!</h2>
          <p className="text-sm text-gray-500 text-center">Lulu will print and ship your book.<br />Usually 7–10 business days.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile selection */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">Whose book? <span className="text-gray-400 font-normal">(select one or more)</span></h2>

            {parents.length > 0 && (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Parents</p>
                <div className="flex flex-col gap-2 mb-3">
                  {parents.map(p => (
                    <button key={p.id} onClick={() => toggleProfile(p.id)}
                      className="w-full text-left px-4 py-3 rounded-2xl border-2 font-semibold transition text-sm flex items-center justify-between"
                      style={{
                        borderColor: selectedIds.includes(p.id) ? 'var(--purple)' : 'var(--purple-light)',
                        background: selectedIds.includes(p.id) ? 'var(--purple-light)' : 'white',
                        color: 'var(--purple-dark)',
                      }}>
                      {p.name}
                      {selectedIds.includes(p.id) && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {children.length > 0 && (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Kids</p>
                <div className="flex flex-col gap-2">
                  {children.map(p => (
                    <button key={p.id} onClick={() => toggleProfile(p.id)}
                      className="w-full text-left px-4 py-3 rounded-2xl border-2 font-semibold transition text-sm flex items-center justify-between"
                      style={{
                        borderColor: selectedIds.includes(p.id) ? 'var(--green)' : 'var(--green-light)',
                        background: selectedIds.includes(p.id) ? 'var(--green-light)' : 'white',
                        color: 'var(--green-dark)',
                      }}>
                      {p.name}
                      {selectedIds.includes(p.id) && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content type */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">What to include?</h2>
            <div className="flex flex-col gap-2">
              {contentOptions.map(opt => (
                <button key={opt.value} onClick={() => setContentType(opt.value)}
                  className="w-full text-left px-4 py-3 rounded-2xl border-2 transition"
                  style={{
                    borderColor: contentType === opt.value ? 'var(--purple)' : 'var(--purple-light)',
                    background: contentType === opt.value ? 'var(--purple-light)' : 'white',
                  }}>
                  <span className="font-bold text-sm" style={{ color: 'var(--purple-dark)' }}>
                    {opt.emoji} {opt.label}
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {step !== 'confirm' && (
            <div className="bg-white rounded-3xl p-4 border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 text-sm">Shipping address <span className="text-gray-400 font-normal">(US only)</span></h2>
              <div className="space-y-2">
                {[
                  { key: 'name', placeholder: 'Full name' },
                  { key: 'street1', placeholder: 'Street address' },
                  { key: 'street2', placeholder: 'Apt / Unit (optional)' },
                  { key: 'city', placeholder: 'City' },
                  { key: 'state', placeholder: 'State (e.g. CA)' },
                  { key: 'zip', placeholder: 'ZIP code' },
                ].map(({ key, placeholder }) => (
                  <input key={key}
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

          {/* Order summary */}
          {step === 'confirm' && quote && (
            <div className="bg-white rounded-3xl p-4 border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 text-sm">Order summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Ship to</span><span className="font-semibold">{address.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profiles</span><span className="font-semibold">{selectedNames.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Content</span>
                  <span className="font-semibold">{contentOptions.find(o => o.value === contentType)?.label}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                  <span>Total (print + shipping)</span><span>{quote.total}</span>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {step !== 'confirm' ? (
            <button
              onClick={handleGetQuote}
              disabled={loading || selectedIds.length === 0 || !address.name || !address.street1 || !address.city || !address.state || !address.zip}
              className="w-full font-black rounded-2xl py-4 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--green)' }}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Loading...</> : 'Get a quote'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setStep('select')} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100">
                Edit
              </button>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="flex-1 font-black rounded-2xl py-4 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--green)' }}
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Ordering...</> : `Order ${quote?.total}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
