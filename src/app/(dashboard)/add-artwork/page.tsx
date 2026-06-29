'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Camera, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'
import dynamic from 'next/dynamic'

const PerspectiveEditor = dynamic(() => import('@/components/PerspectiveEditor'), { ssr: false })

type Step = 'scan' | 'info' | 'done'
type Captions = { curator: string; parent: string; child: string }

function AddArtworkInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { t, locale } = useLocale()

  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('scan')
  const [rawImageUrl, setRawImageUrl] = useState<string>('')
  const [flattenedUrl, setFlattenedUrl] = useState<string>('')
  const [artTitle, setArtTitle] = useState('')
  const [keywords, setKeywords] = useState('')
  const [captions, setCaptions] = useState<Captions | null>(null)
  const [selectedCaption, setSelectedCaption] = useState<'curator' | 'parent' | 'child' | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string>('')
  const [profileName, setProfileName] = useState<string>('')

  const preselectedProfileId = searchParams.get('profileId')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let resolvedId = preselectedProfileId

      if (!resolvedId) {
        // Fallback: use child or parent profile
        const { data: child } = await supabase
          .from('bl_profiles')
          .select('id, name')
          .eq('user_id', user.id)
          .eq('role', 'child')
          .single()
        if (child) { resolvedId = child.id; setProfileName(child.name) }
        else {
          const { data: parent } = await supabase
            .from('bl_profiles')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('role', 'parent')
            .single()
          if (parent) { resolvedId = parent.id; setProfileName(parent.name) }
        }
      }

      if (!resolvedId) return
      setProfileId(resolvedId)

      // Load name if preselected
      if (preselectedProfileId) {
        const { data } = await supabase.from('bl_profiles').select('name').eq('id', resolvedId).single()
        if (data) setProfileName(data.name)
      }

    }
    loadProfile()
  }, [preselectedProfileId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setRawImageUrl(url)
    setFlattenedUrl('')
  }

  function handleFlattened(dataUrl: string) {
    setFlattenedUrl(dataUrl)
  }

  const activeImageUrl = flattenedUrl || rawImageUrl

  async function handleGenerate() {
    if (!artTitle.trim()) return
    setGenerating(true)
    setSelectedCaption(null)
    try {
      const res = await fetch('/api/artwork/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: artTitle, keywords, profileName, locale }),
      })
      const data = await res.json()
      setCaptions(data)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!activeImageUrl || !artTitle || !selectedCaption || !captions) return
    setSaving(true)
    try {
      // 1. Get presigned URL from server
      const urlRes = await fetch('/api/artwork/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, contentType: 'image/jpeg' }),
      })
      const { uploadUrl, imageUrl } = await urlRes.json()

      // 2. Convert data URL to blob and upload directly to S3
      const response = await fetch(activeImageUrl)
      const blob = await response.blob()
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      })

      // 3. Save metadata to DB (no image payload)
      const saveRes = await fetch('/api/artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          title: artTitle,
          keywords,
          imageUrl,
          captionCurator: captions.curator,
          captionParent: captions.parent,
          captionChild: captions.child,
          selectedCaption: captions[selectedCaption],
        }),
      })
      if (saveRes.ok) {
        setStep('done')
      }
    } finally {
      setSaving(false)
    }
  }

  const steps: Step[] = ['scan', 'info', 'done']
  const stepLabels = [t('artwork_step_scan'), t('artwork_step_info'), t('artwork_step_done')]

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">{t('artwork_title')}</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition"
              style={step === s
                ? { background: 'var(--purple-light)', color: 'var(--purple-dark)' }
                : steps.indexOf(step) > i
                  ? { background: 'var(--green-light)', color: 'var(--green-dark)' }
                  : { background: '#f3f4f6', color: '#9ca3af' }}
            >
              {stepLabels[i]}
            </div>
            {i < steps.length - 1 && <div className="w-3 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step: scan */}
      {step === 'scan' && (
        <div className="space-y-4">
          {!rawImageUrl ? (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full font-bold rounded-2xl py-6 flex flex-col items-center gap-3"
                style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)' }}
              >
                <Camera className="w-8 h-8" />
                <span className="text-base">{t('artwork_upload_camera')}</span>
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                className="w-full font-bold rounded-2xl py-6 flex flex-col items-center gap-3"
                style={{ background: 'var(--yellow-light)', color: 'var(--yellow-dark)' }}
              >
                <ImageIcon className="w-8 h-8" />
                <span className="text-base">{t('artwork_upload_gallery')}</span>
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {flattenedUrl ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">{locale === 'ko' ? '교정된 이미지' : 'Corrected image'}</p>
                  <div className="relative w-full rounded-2xl overflow-hidden">
                    <Image src={flattenedUrl} alt="flattened artwork" width={600} height={600} className="w-full h-auto object-contain rounded-2xl" unoptimized />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setRawImageUrl(''); setFlattenedUrl('') }}
                      className="flex-1 font-semibold rounded-2xl py-2 text-sm border border-gray-200 text-gray-500"
                    >
                      {locale === 'ko' ? '다시 찍기' : 'Retake'}
                    </button>
                    <button
                      onClick={() => setStep('info')}
                      className="flex-1 font-bold rounded-2xl py-2 text-sm"
                      style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
                    >
                      {t('artwork_next')} →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">{locale === 'ko' ? '원근 교정 (선택)' : 'Perspective correction (optional)'}</p>
                  <PerspectiveEditor imageUrl={rawImageUrl} onFlattened={handleFlattened} locale={locale} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setRawImageUrl(''); setFlattenedUrl('') }}
                      className="flex-1 font-semibold rounded-2xl py-2 text-sm border border-gray-200 text-gray-500"
                    >
                      {locale === 'ko' ? '다시 찍기' : 'Retake'}
                    </button>
                    <button
                      onClick={() => setStep('info')}
                      className="flex-1 font-bold rounded-2xl py-2 text-sm"
                      style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
                    >
                      {locale === 'ko' ? '교정 없이 진행' : 'Skip correction'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          <input ref={galleryRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {/* Step: info — title, keywords, generate, caption pick, save (all on one page) */}
      {step === 'info' && (
        <div className="space-y-4">
          {activeImageUrl && (
            <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-gray-100">
              <Image src={activeImageUrl} alt="artwork preview" fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">{t('artwork_title_placeholder')}</label>
              <input
                value={artTitle}
                onChange={e => setArtTitle(e.target.value)}
                placeholder={t('artwork_title_placeholder')}
                className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--purple-light)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--purple)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--purple-light)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">{t('artwork_keywords_label')}</label>
              <input
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder={t('artwork_keywords_placeholder')}
                className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--yellow-light)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--yellow)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--yellow-light)' }}
              />
            </div>
          </div>

          {/* Generate / Regenerate button */}
          <button
            onClick={handleGenerate}
            disabled={!artTitle.trim() || generating}
            className="w-full font-bold rounded-2xl py-4 transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)' }}
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t('artwork_generating')}</>
            ) : captions ? t('artwork_regenerate_btn') : t('artwork_generate_btn')}
          </button>

          {/* Caption selection — shown after generation */}
          {captions && !generating && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-600 text-center">{t('artwork_select_caption')}</p>

              {(['curator', 'parent', 'child'] as const).map(key => (
                <div
                  key={key}
                  onClick={() => setSelectedCaption(key)}
                  className="w-full text-left rounded-3xl p-4 border-2 transition space-y-1 cursor-pointer"
                  style={selectedCaption === key
                    ? { borderColor: 'var(--purple)', background: 'var(--purple-light)' }
                    : { borderColor: '#e5e7eb', background: 'white' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: selectedCaption === key ? 'var(--purple-dark)' : '#9ca3af' }}>
                      {key === 'curator' ? t('artwork_caption_curator') : key === 'parent' ? t('artwork_caption_parent') : t('artwork_caption_child')}
                    </span>
                    {selectedCaption === key && <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--purple)' }} />}
                  </div>
                  {selectedCaption === key ? (
                    <textarea
                      value={captions[key]}
                      onChange={e => setCaptions({ ...captions, [key]: e.target.value })}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                      className="w-full text-sm text-gray-700 bg-transparent resize-none outline-none leading-relaxed"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{captions[key]}</p>
                  )}
                </div>
              ))}

              <button
                onClick={handleSave}
                disabled={!selectedCaption || saving}
                className="w-full font-bold rounded-2xl py-4 transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
              >
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" />{t('artwork_saving')}</> : t('artwork_save')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: 'var(--purple-light)' }}
          >
            🎨
          </div>
          <h2 className="text-lg font-bold text-gray-800 text-center">{t('artwork_done_title')}</h2>
          <button
            onClick={() => router.push(`/bookshelf?profileId=${profileId}&tab=art`)}
            className="font-bold rounded-2xl px-8 py-3"
            style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
          >
            {t('artwork_done_go')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AddArtworkPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
      <AddArtworkInner />
    </Suspense>
  )
}
