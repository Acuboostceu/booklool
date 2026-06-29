'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'

export default function AddChildForm({ parentId }: { parentId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

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
