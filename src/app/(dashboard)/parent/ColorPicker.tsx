'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PROFILE_COLORS, COLOR_LIST, ProfileColor } from '@/lib/profileColors'
import { useRouter } from 'next/navigation'

export default function ColorPicker({
  childId,
  currentColor,
}: {
  childId: string
  currentColor: string | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [selected, setSelected] = useState<ProfileColor>((currentColor as ProfileColor) || 'green')
  const [saving, setSaving] = useState(false)

  async function handleSelect(color: ProfileColor) {
    setSelected(color)
    setSaving(true)
    await supabase.from('bl_profiles').update({ color }).eq('id', childId)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {COLOR_LIST.map(color => {
          const c = PROFILE_COLORS[color]
          const isSelected = selected === color
          return (
            <button
              key={color}
              onClick={() => handleSelect(color)}
              disabled={saving}
              className="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110 border-2"
              style={{
                background: c.dot,
                borderColor: isSelected ? c.accent : 'transparent',
              }}
            >
              {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
