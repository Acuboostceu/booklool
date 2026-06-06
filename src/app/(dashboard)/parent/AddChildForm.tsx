'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'

export default function AddChildForm({ parentId, plan, childCount }: { parentId: string; plan: string; childCount: number }) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const isLocked = plan === 'free' && childCount >= 1

  async function handleUpgrade() {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!parentId) return
    setLoading(true)
    await supabase.from('bl_profiles').insert({
      role: 'child',
      name,
      parent_id: parentId,
    })
    setName('')
    setLoading(false)
    router.refresh()
  }

  if (isLocked) {
    return (
      <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--purple-light)' }}>
        <p className="text-sm font-bold mb-1" style={{ color: 'var(--purple-dark)' }}>👨‍👩‍👧‍👦 Family Plan</p>
        <p className="text-xs text-gray-500 mb-3">Upgrade to add unlimited children & connect a partner.</p>
        <button
          onClick={handleUpgrade}
          className="w-full font-black rounded-2xl py-2.5 text-sm text-white transition"
          style={{ background: 'var(--purple)' }}
        >
          Upgrade — $3/mo
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={t('child_name_placeholder')}
        required
        className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
        style={{borderColor: 'var(--green-light)'}}
        onFocus={e => e.target.style.borderColor = 'var(--green)'}
        onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full text-white font-black rounded-2xl py-3 text-sm transition disabled:opacity-60"
        style={{background: 'var(--green)'}}
      >
        {loading ? t('child_adding') : t('child_add_btn')}
      </button>
    </form>
  )
}
