'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const copy = {
  en: {
    nav_login: 'Log in',
    nav_start: 'Get started free',
    lang_toggle: '한국어',
    hero_tag: '📚 Family Reading Journal',
    hero_title: "Your child's bookshelf,",
    hero_title2: 'years from now.',
    hero_sub: 'Every book they read. Every thought they had. Bound into one book, forever.',
    hero_cta: 'Start for free',
    hero_sub_cta: 'No credit card required',
    how_label: 'HOW IT WORKS',
    how_title: 'Three steps to a lifetime of memories',
    step1_title: 'Snap the moment',
    step1_desc: "Take a photo of your child holding the book — that goofy proud face is the whole point. Our AI reads the title automatically.",
    step2_title: 'Log & reflect',
    step2_desc: 'Older kids log in and write their own thoughts. Younger ones talk it through with a parent — you ask, they answer, you type it in together. Either way, it gets saved.',
    step3_title: 'Print your year',
    step3_desc: 'Every photo, review, and memory — bound into a beautiful book delivered to your door.',
    pricing_label: 'PRICING',
    pricing_title: 'Simple, family-friendly pricing',
    free_name: 'Free',
    free_price: '$0',
    free_period: 'forever',
    free_features: ['1 child profile', 'Unlimited books', 'AI reading questions', 'Photo journal'],
    family_name: 'Family',
    family_price: '$3',
    family_period: '/ month',
    family_badge: 'Most popular',
    family_features: ['Everything in Free', 'Connect with partner', 'Unlimited children', 'Family bookshelf', 'Priority support'],
    print_name: 'Print Book',
    print_price: 'From $29',
    print_period: 'per book',
    print_features: ["Your year in photos", 'All reviews & AI answers', 'Hardcover or softcover', 'Shipped to your door'],
    plan_cta: 'Get started',
    footer_copy: '© 2025 Booklool · Made with love for reading families.',
  },
  ko: {
    nav_login: '로그인',
    nav_start: '무료로 시작',
    lang_toggle: 'English',
    hero_tag: '📚 가족 독서 일기',
    hero_title: '몇 년 후, 아이의 책장을',
    hero_title2: '다시 펼쳐보세요.',
    hero_sub: '읽은 책들, 남긴 생각들, 우리 가족의 이야기가 돼요.',
    hero_cta: '무료로 시작하기',
    hero_sub_cta: '신용카드 불필요',
    how_label: '사용 방법',
    how_title: '세 단계로 평생의 추억을',
    step1_title: '그 순간을 찍어요',
    step1_desc: '책을 들고 있는 아이의 개구진 얼굴을 찍어요. 그게 포인트예요. AI가 책 제목은 알아서 읽어줘요.',
    step2_title: '함께 기록해요',
    step2_desc: '큰 아이는 직접 로그인해서 본인이 써요. 어린아이는 부모가 질문하고, 아이가 답하면 같이 입력해요. 그 대화 자체가 기록이 돼요.',
    step3_title: '책으로 만들기',
    step3_desc: '사진, 감상, 추억을 모아 아름다운 책 한 권으로 만들어 집으로 배송해드려요.',
    pricing_label: '요금제',
    pricing_title: '가족을 위한 합리적인 가격',
    free_name: '무료',
    free_price: '$0',
    free_period: '영원히',
    free_features: ['자녀 프로필 1명', '책 무제한 기록', 'AI 독후 질문', '사진 독서 일기'],
    family_name: '패밀리',
    family_price: '$3',
    family_period: '/ 월',
    family_badge: '인기',
    family_features: ['무료 플랜 모든 기능', '배우자 계정 연결', '자녀 무제한', '가족 책장 공유', '우선 지원'],
    print_name: '프린트 북',
    print_price: '$29부터',
    print_period: '권당',
    print_features: ['한 해의 사진 전부', '감상 & AI 답변 수록', '하드커버 / 소프트커버', '집으로 배송'],
    plan_cta: '시작하기',
    footer_copy: '© 2025 Booklool · 독서하는 가족을 위해 만들었어요.',
  },
}

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'ko'>('en')
  const [loggedIn, setLoggedIn] = useState(false)
  const t = copy[lang]
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setLoggedIn(true)
    })
  }, [supabase])

  const steps = [
    { icon: '📸', title: t.step1_title, desc: t.step1_desc, color: 'var(--green-light)' },
    { icon: '✏️', title: t.step2_title, desc: t.step2_desc, color: 'var(--purple-light)' },
    { icon: '📖', title: t.step3_title, desc: t.step3_desc, color: 'var(--yellow-light)' },
  ]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-nunito), var(--font-noto), sans-serif' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Image src="/booklool.png" alt="Booklool" width={120} height={40} className="h-8 w-auto object-contain" />
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 transition"
            >
              {t.lang_toggle}
            </button>
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition hidden sm:block">
              {t.nav_login}
            </Link>
            <Link
              href={loggedIn ? '/bookshelf' : '/login'}
              className="text-sm font-bold px-4 py-2 rounded-full text-white transition hover:opacity-90"
              style={{ background: 'var(--green)' }}
            >
              {loggedIn ? '→ App' : t.nav_start}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: '#fefdf5' }}>
        {/* Notebook lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #c8dff0 31px, #c8dff0 32px)',
            backgroundPositionY: '56px',
            opacity: 0.45,
          }}
        />
        {/* Red margin line — desktop only */}
        <div className="absolute top-0 bottom-0 hidden md:block" style={{ left: '88px', width: '1px', background: '#f4a0a0', opacity: 0.6 }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-40 text-center">
          <div
            className="inline-block mb-5 text-xs font-bold px-4 py-1.5 rounded-full"
            style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
          >
            {t.hero_tag}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-1">
            {t.hero_title}<br />
            <span style={{ color: 'var(--green-dark)' }}>{t.hero_title2}</span>
          </h1>
          <div className="mb-7" />
          <p className="text-base md:text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
            {t.hero_sub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href={loggedIn ? '/bookshelf' : '/login'}
              className="text-white font-bold px-8 py-4 rounded-full text-base shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--green)' }}
            >
              {t.hero_cta} →
            </Link>
            <p className="text-xs text-gray-400">{t.hero_sub_cta}</p>
          </div>

          {/* Mock UI */}
          <div className="mt-20 flex justify-center">
            <div className="w-64 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 text-left">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <Image src="/booklool.png" alt="" width={72} height={24} className="h-5 w-auto object-contain" />
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  { title: 'The Very Hungry Caterpillar', color: 'var(--green-light)', dot: 'var(--green)' },
                  { title: '강아지똥', color: 'var(--pink-light)', dot: 'var(--pink)' },
                  { title: "Charlotte's Web", color: 'var(--purple-light)', dot: 'var(--purple)' },
                ].map((book, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl" style={{ background: book.color }}>
                    <div className="w-8 h-11 rounded-lg flex-shrink-0" style={{ background: book.dot, opacity: 0.35 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 leading-tight truncate">{book.title}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="text-[9px]" style={{ color: 'var(--yellow)' }}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: 'var(--green)' }}>{t.how_label}</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-16">{t.how_title}</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: step.color }}
                >
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-gray-300 mb-2">0{i + 1}</p>
                  <h3 className="font-black text-xl text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24" style={{ background: '#fefdf5' }}>
        {/* Subtle notebook lines on pricing too */}
        <div className="relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-xs font-black tracking-widest mb-4" style={{ color: 'var(--purple)' }}>{t.pricing_label}</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-16">{t.pricing_title}</h2>

            <div className="grid md:grid-cols-3 gap-6">

              {/* Free */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 text-left flex flex-col">
                <p className="font-black text-xl text-gray-800 mb-2">{t.free_name}</p>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-5xl font-black text-gray-900">{t.free_price}</span>
                  <span className="text-sm text-gray-400 mb-1.5">{t.free_period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {t.free_features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="font-bold" style={{ color: 'var(--green)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full text-center font-bold py-3.5 rounded-2xl border-2 text-sm transition hover:bg-gray-50"
                  style={{ borderColor: 'var(--green-light)', color: 'var(--green-dark)' }}
                >
                  {t.plan_cta}
                </Link>
              </div>

              {/* Family — highlighted */}
              <div className="rounded-3xl p-8 text-left flex flex-col relative shadow-2xl -mt-2 -mb-2" style={{ background: 'var(--green)' }}>
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-1.5 rounded-full bg-white shadow-sm"
                  style={{ color: 'var(--green-dark)' }}
                >
                  {t.family_badge}
                </div>
                <p className="font-black text-xl text-white mb-2">{t.family_name}</p>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-5xl font-black text-white">{t.family_price}</span>
                  <span className="text-sm text-white/60 mb-1.5">{t.family_period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {t.family_features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-white/90">
                      <span className="font-bold text-white">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full text-center font-black py-3.5 rounded-2xl text-sm transition hover:opacity-90 bg-white"
                  style={{ color: 'var(--green-dark)' }}
                >
                  {t.plan_cta}
                </Link>
              </div>

              {/* Print Book */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 text-left flex flex-col">
                <p className="font-black text-xl text-gray-800 mb-2">{t.print_name}</p>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-3xl font-black text-gray-900">{t.print_price}</span>
                  <span className="text-sm text-gray-400 mb-1.5">{t.print_period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {t.print_features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="font-bold" style={{ color: 'var(--yellow-dark)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full text-center font-bold py-3.5 rounded-2xl border-2 text-sm opacity-50 cursor-not-allowed"
                  style={{ borderColor: 'var(--yellow-light)', color: 'var(--yellow-dark)' }}
                  disabled
                >
                  Coming soon
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-gray-100 text-center bg-white">
        <Image src="/booklool.png" alt="Booklool" width={80} height={26} className="h-6 w-auto object-contain mx-auto mb-3 opacity-40" />
        <p className="text-xs text-gray-400">{t.footer_copy}</p>
      </footer>

    </div>
  )
}
