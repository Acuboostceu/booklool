'use client'

import { useLocale } from '@/lib/i18n/LocaleContext'

export default function LowResWarning({ show }: { show: boolean }) {
  const { t } = useLocale()
  if (!show) return null

  return (
    <p className="text-xs mt-1.5" style={{ color: 'var(--yellow-dark)' }}>
      ⚠️ {t('photo_low_res_warning')}
    </p>
  )
}
