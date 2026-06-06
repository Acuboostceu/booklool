'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const GRADE_OPTIONS = [
  { value: '0', label: '3살' },
  { value: '1', label: '4살' },
  { value: '2', label: '5살' },
  { value: '3', label: '6살 (유치원)' },
  { value: '4', label: '7살 (유치원)' },
  { value: '5', label: '초등 1학년' },
  { value: '6', label: '초등 2학년' },
  { value: '7', label: '초등 3학년' },
  { value: '8', label: '초등 4학년' },
  { value: '9', label: '초등 5학년' },
  { value: '10', label: '초등 6학년' },
  { value: '11', label: '중학교 1학년' },
  { value: '12', label: '중학교 2학년' },
]

const GRADE_OPTIONS_US = [
  { value: '0', label: 'Age 3' },
  { value: '1', label: 'Age 4' },
  { value: '2', label: 'Age 5 (Pre-K)' },
  { value: '3', label: 'Kindergarten' },
  { value: '4', label: 'Grade 1' },
  { value: '5', label: 'Grade 2' },
  { value: '6', label: 'Grade 3' },
  { value: '7', label: 'Grade 4' },
  { value: '8', label: 'Grade 5' },
  { value: '9', label: 'Grade 6' },
  { value: '10', label: 'Grade 7' },
  { value: '11', label: 'Grade 8' },
]

export default function AddChildForm({ parentId, plan, childCount }: { parentId: string; plan: string; childCount: number }) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [gradeSystem, setGradeSystem] = useState<'korean' | 'us'>('korean')
  const [loading, setLoading] = useState(false)

  const options = gradeSystem === 'korean' ? GRADE_OPTIONS : GRADE_OPTIONS_US
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
      grade: grade ? parseInt(grade) : null,
      grade_system: gradeSystem,
      parent_id: parentId,
    })
    setName('')
    setGrade('')
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
        placeholder="아이 이름"
        required
        className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition"
        style={{borderColor: 'var(--green-light)'}}
        onFocus={e => e.target.style.borderColor = 'var(--green)'}
        onBlur={e => e.target.style.borderColor = 'var(--green-light)'}
      />
      <div className="flex gap-2">
        <select
          value={gradeSystem}
          onChange={e => { setGradeSystem(e.target.value as 'korean' | 'us'); setGrade('') }}
          className="border-2 rounded-2xl px-3 py-3 text-sm outline-none"
          style={{borderColor: 'var(--green-light)'}}
        >
          <option value="korean">🇰🇷 한국</option>
          <option value="us">🇺🇸 미국</option>
        </select>
        <select
          value={grade}
          onChange={e => setGrade(e.target.value)}
          className="flex-1 border-2 rounded-2xl px-3 py-3 text-sm outline-none"
          style={{borderColor: 'var(--green-light)'}}
        >
          <option value="">나이/학년 선택</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full text-white font-black rounded-2xl py-3 text-sm transition disabled:opacity-60"
        style={{background: 'var(--green)'}}
      >
        {loading ? '추가 중...' : '추가하기 🌱'}
      </button>
    </form>
  )
}
