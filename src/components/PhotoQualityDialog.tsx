'use client'

import { useLocale } from '@/lib/i18n/LocaleContext'

export default function PhotoQualityDialog({ open, onRetake, onContinue }: {
  open: boolean
  onRetake: () => void
  onContinue: () => void
}) {
  const { t } = useLocale()
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
        <p className="font-black text-gray-800 text-lg mb-2">{t('photo_dark_title')}</p>
        <p className="text-sm text-gray-500 mb-6">{t('photo_dark_desc')}</p>
        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100"
          >
            {t('photo_dark_continue')}
          </button>
          <button
            onClick={onRetake}
            className="flex-1 py-3 rounded-2xl font-bold text-white"
            style={{ background: 'var(--purple)' }}
          >
            {t('photo_dark_retake')}
          </button>
        </div>
      </div>
    </div>
  )
}
