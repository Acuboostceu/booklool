'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const copy = {
  en: {
    nav_login: 'Log in',
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
    step1_desc: 'Take a photo of your child with the book. Our AI reads the title automatically.',
    step2_title: 'Log & reflect',
    step2_desc: 'Two ways to record — pick what fits your child.',
    step2_rate_title: '⭐ Review mode',
    step2_rate_desc: 'Rate the book, write a thought, and answer an AI question. Perfect for younger readers.',
    step2_log_title: '📖 Reading log',
    step2_log_desc: 'Log pages read each session. A progress bar tracks the journey. When done, all those impressions add up to their own story of the book.',
    step3_title: 'Your year, bound in one book.',
    step3_desc: 'Every photo, review, and memory — printed into a beautiful book delivered to your door.',

    art_label: 'ART JOURNAL',
    art_title: "Your child's art, curated.",
    art_humor: "Your child's stick figures, curated.",
    art_feature1_title: 'Perspective correction',
    art_feature1_desc: 'Snap a photo of any drawing — even at an angle. Adjust the four corners to flatten it perfectly.',
    art_feature2_title: 'Title & AI curation',
    art_feature2_desc: 'Add a title and keywords. The AI writes a curator-style caption, a parent diary entry, or a child\'s voice — choose the one that fits.',
    art_feature3_title: 'Printed at year-end',
    art_feature3_desc: 'All artwork goes into the same year-end book as the reading journal. One book, the whole year.',

    trust_label: 'PRIVACY & SAFETY',
    trust_title: "Your child's data is treated like family.",
    trust_sub: "Free, forever. No credit card, no data games — just careful handling of what matters most.",
    trust1_title: 'No face photos sent to AI',
    trust1_desc: "When we scan a book cover, only the extracted text goes to AI — never the photo of your child. Their face never leaves our infrastructure to reach a third party.",
    trust2_title: 'Private storage, family-only access',
    trust2_desc: 'Every photo lives in access-controlled storage. No public links, no strangers — only your family can ever see them.',
    trust3_title: '30-day recovery on delete',
    trust3_desc: "Accidents happen. Deleted books and art go to a trash bin for 30 days before they're gone for good, so a wrong tap never means a lost memory.",
    trust4_title: 'Built with COPPA in mind',
    trust4_desc: "We follow children's privacy best practices as a baseline, not an afterthought — minimal data, clear purpose, no surprises.",
    footer_copy: '© 2026 Booklool · Made with love for reading families.',
  },
  ko: {
    nav_login: '로그인',
    lang_toggle: 'English',
    hero_tag: '📚 가족 독서 일기',
    hero_title: '몇 년 후, 아이의 책장을',
    hero_title2: '다시 펼쳐보세요.',
    hero_sub: '읽은 책들, 남긴 생각들, 우리 가족의 이야기가 돼요.',
    hero_cta: '무료로 시작하기',
    hero_sub_cta: '신용카드 불필요',

    how_label: '사용 방법',
    how_title: '세 단계로 평생의 추억을',
    step1_title: '사진을 찍어요',
    step1_desc: '책과 함께 찍은 아이 사진 한 장. AI가 책 제목을 자동으로 찾아줘요.',
    step2_title: '기록해요',
    step2_desc: '아이에게 맞는 방법으로 골라 기록해요.',
    step2_rate_title: '⭐ 평가 모드',
    step2_rate_desc: '별점, 감상, AI 독후 질문까지. 어린 독자에게 딱 맞아요.',
    step2_log_title: '📖 독서 로그',
    step2_log_desc: '그날 읽은 페이지와 한 줄 감상을 기록해요. 프로그레스 바가 진행 상황을 알려주고, 다 읽으면 쌓인 감상들이 자연스럽게 그 책의 이야기가 돼요.',
    step3_title: '일년이 한 권에.',
    step3_desc: '모든 사진과 생각, 기억이 담긴 책 한 권이 선물처럼 배달돼요.',

    art_label: '아트 저널',
    art_title: '아이의 그림을, 작품으로.',
    art_humor: '막대기 그림도, 큐레이팅됩니다. 😄',
    art_feature1_title: '원근 교정',
    art_feature1_desc: '비스듬히 찍어도 괜찮아요. 네 귀퉁이를 잡아당겨 그림을 평평하게 펼쳐요.',
    art_feature2_title: '제목과 AI 큐레이션',
    art_feature2_desc: '제목과 키워드를 넣으면 AI가 큐레이터 스타일, 부모 일기체, 아이 목소리 세 가지 캡션을 만들어줘요.',
    art_feature3_title: '연말에 한 권으로',
    art_feature3_desc: '독서 일기와 함께 연말 책에 실려요. 책 읽은 기억과 그림이 한 권에 담겨요.',

    trust_label: '개인정보 & 안전',
    trust_title: '아이의 정보를, 가족처럼 다룹니다.',
    trust_sub: '영원히 무료예요. 신용카드도, 숨겨진 조건도 없이 — 가장 소중한 것을 조심스럽게 다룰 뿐이에요.',
    trust1_title: '아이 얼굴 사진은 AI로 보내지 않아요',
    trust1_desc: '책 표지를 인식할 때도 추출된 텍스트만 AI로 전송해요. 아이 사진 자체는 절대 외부로 나가지 않아요.',
    trust2_title: '비공개 저장, 가족만 접근 가능',
    trust2_desc: '모든 사진은 접근이 통제된 저장소에 보관돼요. 공개 링크도, 낯선 사람의 접근도 없어요 — 오직 우리 가족만 볼 수 있어요.',
    trust3_title: '삭제해도 30일간 복구 가능',
    trust3_desc: '실수는 누구나 해요. 삭제한 책과 그림은 30일 동안 휴지통에 보관되어, 잘못 누른 한 번이 소중한 기억을 영영 잃게 만들지 않아요.',
    trust4_title: 'COPPA를 염두에 두고 설계했어요',
    trust4_desc: '아이 개인정보 보호 원칙을 나중에 덧붙인 게 아니라 처음부터 기준으로 삼았어요 — 최소한의 정보만, 목적이 분명하게, 숨기는 것 없이.',
    footer_copy: '© 2026 Booklool · 독서하는 가족을 위해 만들었어요.',
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
    const saved = localStorage.getItem('bl_locale')
    if (saved === 'ko') setLang('ko')
  }, [supabase])

  function toggleLang() {
    const next = lang === 'en' ? 'ko' : 'en'
    setLang(next)
    localStorage.setItem('bl_locale', next)
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-nunito), var(--font-noto), sans-serif' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <img src="/booklool.png" alt="Booklool" className="h-8 w-auto object-contain shrink-0" />
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleLang}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition whitespace-nowrap"
            >
              {t.lang_toggle}
            </button>
            <Link href={loggedIn ? '/bookshelf' : '/login'} className="text-sm font-bold text-gray-700 hover:text-gray-900 transition">
              {loggedIn ? '→ App' : t.nav_login}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: '#fefdf5' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #c8dff0 31px, #c8dff0 32px)',
            backgroundPositionY: '56px',
            opacity: 0.45,
          }}
        />
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
            {lang === 'en' ? (
              <>
                <span className="md:hidden">
                  Every book they read.<br />
                  Every thought they had.<br />
                  Bound into one book, forever.
                </span>
                <span className="hidden md:inline">
                  Every book they read. Every thought they had.<br />
                  Bound into one book, forever.
                </span>
              </>
            ) : t.hero_sub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href={loggedIn ? '/bookshelf' : '/signup'}
              className="text-white font-bold px-8 py-4 rounded-full text-base shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--green)' }}
            >
              {t.hero_cta} →
            </Link>
            <p className="text-xs text-gray-400">{t.hero_sub_cta}</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-black tracking-widest mb-4" style={{ color: 'var(--green)' }}>{t.how_label}</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">{t.how_title}</h2>
          </div>

          <div className="space-y-16">

            {/* Step 01 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 flex flex-col items-center gap-3 md:w-24">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--green-light)' }}>
                  📸
                </div>
                <p className="text-xs font-black text-gray-300">01</p>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-black text-xl text-gray-800 mb-2">{t.step1_title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md">{t.step1_desc}</p>
              </div>
            </div>

            {/* Step 02 — two methods */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex-shrink-0 flex flex-col items-center gap-3 md:w-24">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--purple-light)' }}>
                  ✏️
                </div>
                <p className="text-xs font-black text-gray-300">02</p>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-gray-800 mb-1 text-center md:text-left">{t.step2_title}</h3>
                <p className="text-gray-400 text-sm mb-5 text-center md:text-left">{t.step2_desc}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Review mode */}
                  <div className="rounded-2xl p-5 space-y-2" style={{ background: 'var(--yellow-light)' }}>
                    <p className="font-black text-sm text-gray-800">{t.step2_rate_title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.step2_rate_desc}</p>
                  </div>
                  {/* Reading log */}
                  <div className="rounded-2xl p-5 space-y-2" style={{ background: 'var(--green-light)' }}>
                    <p className="font-black text-sm text-gray-800">{t.step2_log_title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.step2_log_desc}</p>
                    {/* Mini progress bar mockup */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{lang === 'ko' ? '진행률' : 'Progress'}</span>
                        <span>73%</span>
                      </div>
                      <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: '73%', background: 'var(--green)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 flex flex-col items-center gap-3 md:w-24">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--yellow-light)' }}>
                  📖
                </div>
                <p className="text-xs font-black text-gray-300">03</p>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-black text-xl text-gray-800 mb-2">{t.step3_title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md">{t.step3_desc}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Art Journal ── */}
      <section className="py-24" style={{ background: '#fefdf5' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-black tracking-widest mb-4" style={{ color: 'var(--purple)' }}>{t.art_label}</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">{t.art_title}</h2>
            <p className="text-sm text-gray-400 italic">{t.art_humor}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">

            {/* Left: screenshot */}
            <div className="w-full flex justify-center">
              <div className="relative w-[280px] md:w-[320px] drop-shadow-2xl">
                <Image
                  src="/Screenshot_art.png"
                  alt="Art journal screenshot"
                  width={320}
                  height={640}
                  className="rounded-3xl w-full h-auto"
                />
              </div>
            </div>

            {/* Right: feature list */}
            <div className="space-y-6">
              {[
                { icon: '🔲', title: t.art_feature1_title, desc: t.art_feature1_desc, color: 'var(--purple-light)' },
                { icon: '✨', title: t.art_feature2_title, desc: t.art_feature2_desc, color: 'var(--yellow-light)' },
                { icon: '📚', title: t.art_feature3_title, desc: t.art_feature3_desc, color: 'var(--green-light)' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-black text-gray-800 mb-1">{f.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust & Safety ── */}
      <section className="py-24" style={{ background: '#fefdf5' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-6">
            <p className="text-xs font-black tracking-widest mb-4" style={{ color: 'var(--green)' }}>{t.trust_label}</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">{t.trust_title}</h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">{t.trust_sub}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mt-14">
            {[
              { icon: '🙈', title: t.trust1_title, desc: t.trust1_desc, color: 'var(--pink-light)' },
              { icon: '🔒', title: t.trust2_title, desc: t.trust2_desc, color: 'var(--purple-light)' },
              { icon: '🗑️', title: t.trust3_title, desc: t.trust3_desc, color: 'var(--yellow-light)' },
              { icon: '🛡️', title: t.trust4_title, desc: t.trust4_desc, color: 'var(--green-light)' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: f.color }}
                >
                  {f.icon}
                </div>
                <p className="font-black text-gray-800 mb-2">{f.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={loggedIn ? '/bookshelf' : '/signup'}
              className="inline-block text-white font-bold px-8 py-4 rounded-full text-base shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--green)' }}
            >
              {t.hero_cta} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-gray-100 text-center bg-white">
        <img src="/booklool.png" alt="Booklool" className="h-6 w-auto object-contain mx-auto mb-3 opacity-40" />
        <p className="text-xs text-gray-400 mb-3">{t.footer_copy}</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition">
            {lang === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
          </Link>
          <Link href="/terms" className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition">
            {lang === 'ko' ? '이용약관' : 'Terms of Service'}
          </Link>
        </div>
      </footer>

    </div>
  )
}
