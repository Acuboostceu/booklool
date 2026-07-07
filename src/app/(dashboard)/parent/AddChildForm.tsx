'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 19 }, (_, i) => currentYear - i) // 0~18세
const months = Array.from({ length: 12 }, (_, i) => i + 1)

export default function AddChildForm({ parentId }: { parentId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!parentId) return
    setLoading(true)
    await supabase.from('bl_profiles').insert({
      role: 'child',
      name,
      parent_id: parentId,
      birth_year: birthYear ? parseInt(birthYear) : null,
      birth_month: birthMonth ? parseInt(birthMonth) : null,
    })
    setName('')
    setBirthYear('')
    setBirthMonth('')
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

      <div className="rounded-2xl p-3" style={{ background: 'var(--yellow-light)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--yellow-dark)' }}>{t('child_birth_label')}</p>
        <div className="flex gap-2">
          <select
            value={birthYear}
            onChange={e => setBirthYear(e.target.value)}
            className="flex-1 border-2 rounded-2xl px-3 py-3 text-sm outline-none transition bg-white"
            style={{ borderColor: 'var(--green-light)' }}
          >
            <option value="">{t('child_birth_year')}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={birthMonth}
            onChange={e => setBirthMonth(e.target.value)}
            className="flex-1 border-2 rounded-2xl px-3 py-3 text-sm outline-none transition bg-white"
            style={{ borderColor: 'var(--green-light)' }}
          >
            <option value="">{t('child_birth_month')}</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

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
