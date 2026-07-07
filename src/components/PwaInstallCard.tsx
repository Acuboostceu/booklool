'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share, MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'
import {
  isStandalone,
  getPwaPlatform,
  getDeferredInstallPrompt,
  onInstallPromptAvailable,
  clearDeferredInstallPrompt,
} from '@/lib/pwaInstallPrompt'

// 첫 기록 완료 직후 1회 노출되는 "홈 화면에 추가" 카드.
// 이미 설치됐거나, 지원 안 하는 플랫폼이거나, 이미 한 번 봤으면(DB 플래그) 렌더링하지 않는다.
export default function PwaInstallCard() {
  const { t } = useLocale()
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')
  const [canNativeInstall, setCanNativeInstall] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    const p = getPwaPlatform()
    if (p === 'other') return
    setPlatform(p)
    setCanNativeInstall(!!getDeferredInstallPrompt())
    const unsubscribe = onInstallPromptAvailable(() => setCanNativeInstall(true))

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('bl_profiles')
        .select('pwa_prompt_seen')
        .eq('user_id', data.user.id)
        .single()
      if (profile && !profile.pwa_prompt_seen) setVisible(true)
    })

    return unsubscribe
  }, [])

  async function markSeen() {
    setVisible(false)
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    await supabase.from('bl_profiles').update({ pwa_prompt_seen: true }).eq('user_id', data.user.id)
  }

  async function handleInstall() {
    const prompt = getDeferredInstallPrompt()
    if (!prompt) return
    await prompt.prompt()
    await prompt.userChoice
    clearDeferredInstallPrompt()
    markSeen()
  }

  if (!visible) return null

  // 안내 문구의 {icon} 자리에 실제 공유/메뉴 아이콘을 끼워 넣는다.
  function renderInstructions() {
    const text = platform === 'ios' ? t('pwa_card_ios') : t('pwa_card_android')
    const Icon = platform === 'ios' ? Share : MoreVertical
    const [before, after] = text.split('{icon}')
    return (
      <>
        {before}
        <Icon className="w-3.5 h-3.5 inline-block mx-1 -mt-0.5" />
        {after}
      </>
    )
  }

  return (
    <div className="rounded-3xl p-4 mb-4 border" style={{ background: 'var(--green-light)', borderColor: 'var(--green-light)' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-bold text-sm text-gray-800">{t('pwa_card_title')}</p>
        <button onClick={markSeen} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">{t('pwa_card_desc')}</p>

      {platform === 'android' && canNativeInstall ? (
        <button
          onClick={handleInstall}
          className="flex items-center justify-center gap-2 w-full font-bold rounded-2xl py-2.5 text-sm text-white transition"
          style={{ background: 'var(--green)' }}
        >
          <Download className="w-4 h-4" /> {t('pwa_card_install')}
        </button>
      ) : (
        <div className="rounded-2xl p-3 text-xs text-gray-600 bg-white/70">
          {renderInstructions()}
        </div>
      )}

      <button onClick={markSeen} className="w-full text-center text-xs text-gray-400 mt-2 underline underline-offset-2">
        {t('pwa_card_later')}
      </button>
    </div>
  )
}
