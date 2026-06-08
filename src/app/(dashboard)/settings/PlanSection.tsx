'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Locale } from '@/lib/i18n/translations'

const copy = {
  en: {
    title: 'Plan',
    free: 'Free',
    family: 'Family',
    free_desc: '1 child profile · No partner',
    family_desc: 'Unlimited children · Partner access',
    upgrade: 'Whole family — just $1.99/mo',
    upgrading: 'Redirecting...',
    current: 'Current plan',
    cancel: 'Cancel subscription',
    cancel_confirm: 'Cancel subscription?',
    cancel_desc: 'Your plan stays active until the end of the billing period, then reverts to Free.',
    cancel_btn: 'Yes, cancel',
    cancel_no: 'Keep plan',
    cancelling: 'Cancelling...',
    cancelled: 'Cancellation scheduled',
  },
  ko: {
    title: '플랜',
    free: '무료',
    family: '가족',
    free_desc: '아이 1명 · 파트너 연결 불가',
    family_desc: '아이 무제한 · 파트너 연결',
    upgrade: '가족 모두, 단 $1.99/월',
    upgrading: '이동 중...',
    current: '현재 플랜',
    cancel: '구독 취소',
    cancel_confirm: '구독을 취소할까요?',
    cancel_desc: '현재 결제 기간이 끝날 때까지는 계속 사용할 수 있어요. 이후 무료 플랜으로 전환돼요.',
    cancel_btn: '네, 취소할게요',
    cancel_no: '유지하기',
    cancelling: '처리 중...',
    cancelled: '취소가 예약됐어요',
  },
  es: {
    title: 'Plan',
    free: 'Gratis',
    family: 'Familia',
    free_desc: '1 perfil de niño · Sin pareja',
    family_desc: 'Niños ilimitados · Acceso pareja',
    upgrade: 'Actualizar a Familia — $3/mes',
    upgrading: 'Redirigiendo...',
    current: 'Plan actual',
    cancel: 'Cancelar suscripción',
    cancel_confirm: '¿Cancelar suscripción?',
    cancel_desc: 'Tu plan sigue activo hasta el final del período de facturación, luego vuelve a Gratis.',
    cancel_btn: 'Sí, cancelar',
    cancel_no: 'Mantener plan',
    cancelling: 'Cancelando...',
    cancelled: 'Cancelación programada',
  },
}

export default function PlanSection({ locale }: { locale: Locale }) {
  const supabase = createClient()
  const t = copy[locale] ?? copy.en
  const [plan, setPlan] = useState<'free' | 'family' | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('bl_profiles')
        .select('plan')
        .eq('user_id', data.user.id)
        .eq('role', 'parent')
        .single()
      setPlan(profile?.plan ?? 'free')
    })
  }, [supabase])

  async function handleCancel() {
    setCancelling(true)
    await fetch('/api/stripe/cancel', { method: 'POST' })
    setCancelling(false)
    setShowCancel(false)
    setCancelled(true)
  }

  async function handleUpgrade() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  if (plan === null) return null

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 mb-4">
      <h2 className="font-semibold text-gray-700 mb-3 text-sm">{t.title}</h2>

      <div className="flex gap-3 mb-4">
        {/* Free plan */}
        <div
          className="flex-1 rounded-2xl p-3 border-2 text-center"
          style={{
            borderColor: plan === 'free' ? 'var(--green)' : 'var(--green-light)',
            background: plan === 'free' ? 'var(--green-light)' : 'white',
          }}
        >
          <p className="font-black text-sm" style={{ color: 'var(--green-dark)' }}>{t.free}</p>
          <p className="text-xs text-gray-400 mt-1">$0</p>
          <p className="text-xs text-gray-500 mt-1 leading-tight">{t.free_desc}</p>
          {plan === 'free' && (
            <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--green)', color: 'white' }}>
              {t.current}
            </span>
          )}
        </div>

        {/* Family plan */}
        <div
          className="flex-1 rounded-2xl p-3 border-2 text-center"
          style={{
            borderColor: plan === 'family' ? 'var(--purple)' : 'var(--purple-light)',
            background: plan === 'family' ? 'var(--purple-light)' : 'white',
          }}
        >
          <p className="font-black text-sm" style={{ color: 'var(--purple-dark)' }}>{t.family}</p>
          <p className="text-xs text-gray-400 mt-1">$1.99 / mo</p>
          <p className="text-xs text-gray-500 mt-1 leading-tight">{t.family_desc}</p>
          {plan === 'family' && (
            <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--purple)', color: 'white' }}>
              {t.current}
            </span>
          )}
        </div>
      </div>

      {plan === 'free' && (
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full font-black rounded-2xl py-3 text-sm text-white transition disabled:opacity-60"
          style={{ background: 'var(--purple)' }}
        >
          {loading ? t.upgrading : t.upgrade}
        </button>
      )}

      {plan === 'family' && (
        <div className="text-center">
          {cancelled ? (
            <p className="text-xs font-bold" style={{ color: 'var(--pink-dark)' }}>✓ {t.cancelled}</p>
          ) : (
            <button
              onClick={() => setShowCancel(true)}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition"
            >
              {t.cancel}
            </button>
          )}
        </div>
      )}

      {showCancel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <p className="font-black text-gray-800 text-lg mb-2">{t.cancel_confirm}</p>
            <p className="text-sm text-gray-500 mb-6">{t.cancel_desc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100"
              >
                {t.cancel_no}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl font-bold text-white disabled:opacity-60"
                style={{ background: 'var(--pink)' }}
              >
                {cancelling ? t.cancelling : t.cancel_btn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
