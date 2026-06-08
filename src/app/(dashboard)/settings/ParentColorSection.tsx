'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PROFILE_COLORS, COLOR_LIST, ProfileColor } from '@/lib/profileColors'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleContext'

export default function ParentColorSection() {
  const supabase = createClient()
  const router = useRouter()
  const { locale } = useLocale()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [selected, setSelected] = useState<ProfileColor>('green')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('bl_profiles')
        .select('id, color')
        .eq('user_id', data.user.id)
        .eq('role', 'parent')
        .single()
      if (profile) {
        setProfileId(profile.id)
        setSelected((profile.color as ProfileColor) || 'green')
      }
    })
  }, [supabase])

  async function handleSelect(color: ProfileColor) {
    if (!profileId) return
    setSelected(color)
    setSaving(true)
    await supabase.from('bl_profiles').update({ color }).eq('id', profileId)
    setSaving(false)
    router.refresh()
  }

  if (!profileId) return null

  const label = locale === 'ko' ? '내 컬러' : locale === 'es' ? 'Mi color' : 'My color'

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 mb-4">
      <h2 className="font-semibold text-gray-700 mb-3 text-sm">{label}</h2>
      <div className="flex flex-wrap gap-2">
        {COLOR_LIST.map(color => {
          const c = PROFILE_COLORS[color]
          const isSelected = selected === color
          return (
            <button
              key={color}
              onClick={() => handleSelect(color)}
              disabled={saving}
              className="w-10 h-10 rounded-full flex items-center justify-center transition hover:scale-110 border-2"
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
