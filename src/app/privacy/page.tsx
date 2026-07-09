'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const copy = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: July 9, 2026',
    back: '← Back to home',
    sections: [
      {
        h: 'What we collect',
        body: [
          'Parent account: name and email address.',
          "Child profiles: name, and optionally a birth year/month (used only to tailor AI reading-question difficulty to your child's age).",
          'Content you add: book records, ratings, comments, AI-generated questions and answers, artwork photos, book cover photos, and photos of your child with a book.',
          'If you set up a login for your child, we store a username and password for that child account.',
        ],
      },
      {
        h: 'How we use it',
        body: [
          'To provide the reading and art journal service you use.',
          "To generate AI reading questions and artwork captions — only the book title/author or artwork keywords are sent to our AI provider, never your child's photo or name. Book cover text is extracted with an image-to-text service and only the extracted text (not the photo) is sent to our AI provider.",
          'To fulfill print orders if you use the (currently unreleased) print feature — order content is shared only with our print fulfillment partner for that purpose.',
        ],
      },
      {
        h: 'Photo & file storage',
        body: [
          'All photos and files are stored in access-controlled cloud storage that is not publicly accessible.',
          'Only authenticated members of your family account can view your photos. There are no public links.',
          'Deleted books and artwork are kept recoverable for 30 days before being permanently removed.',
        ],
      },
      {
        h: 'Service providers we use',
        body: [
          'Supabase — authentication and database.',
          'Amazon Web Services (S3) — private file storage.',
          'OpenAI — generates reading questions, artwork captions, and translations from text you provide (never photos of your child).',
          'Google Cloud Vision — extracts text from book cover photos so we can identify the book; the photo itself is not shared with our AI text-generation provider.',
          'Vercel — application hosting.',
          "Lulu Direct — print order fulfillment, only used if you place a print order (feature not yet publicly available).",
        ],
      },
      {
        h: "Children's privacy",
        body: [
          'Booklool is designed to be set up and managed by a parent or guardian, who creates the family account and any child profiles or child logins.',
          'We do not knowingly collect information directly from a child without a parent-created account.',
          "We do not run behavioral advertising, do not sell personal data, and do not market directly to children.",
        ],
      },
      {
        h: 'Your rights',
        body: [
          'You can edit or delete your child\'s profile, books, and artwork at any time from within the app.',
          'To request a copy of your data, a correction, or full account deletion, contact us at the email below.',
        ],
      },
      {
        h: 'Cookies & local storage',
        body: [
          'We use authentication session cookies (via Supabase) required to keep you signed in, and local storage to remember your language preference.',
          'We do not use third-party advertising or tracking cookies.',
        ],
      },
      {
        h: 'Changes to this policy',
        body: ['If we make material changes to this policy, we will update the date above.'],
      },
      {
        h: 'Contact',
        body: ['Questions about this policy? Email us at hello@booklool.com.'],
      },
    ],
  },
  ko: {
    title: '개인정보처리방침',
    updated: '최종 업데이트: 2026년 7월 9일',
    back: '← 홈으로',
    sections: [
      {
        h: '수집하는 정보',
        body: [
          '부모 계정: 이름, 이메일 주소.',
          '아이 프로필: 이름, 그리고 선택적으로 태어난 년월 (AI 독후 질문의 난이도를 아이 나이에 맞추는 용도로만 사용돼요).',
          '기록하는 콘텐츠: 책 기록, 별점, 감상, AI가 생성한 질문과 답변, 그림 작품 사진, 책 표지 사진, 아이가 책과 함께 찍은 사진.',
          '아이 전용 로그인을 만드시면, 그 계정의 아이디와 비밀번호를 저장해요.',
        ],
      },
      {
        h: '이용 목적',
        body: [
          '이용 중인 독서/아트 저널 서비스를 제공하기 위해서예요.',
          'AI 독후 질문과 그림 캡션을 생성하기 위해서 — 책 제목/저자나 그림 키워드만 AI에 전송되고, 아이의 사진이나 이름은 절대 전송되지 않아요. 책 표지 텍스트는 이미지-텍스트 인식 서비스로 추출되고, 추출된 텍스트만(사진 자체는 아님) AI에 전달돼요.',
          '(현재 미출시 상태인) 프린트 기능을 이용하실 경우 주문 이행을 위해, 해당 목적에 한해 인쇄 협력사에 주문 내용이 공유돼요.',
        ],
      },
      {
        h: '사진 및 파일 저장',
        body: [
          '모든 사진과 파일은 외부에 공개되지 않는, 접근이 통제된 클라우드 저장소에 보관돼요.',
          '인증된 가족 구성원만 사진을 볼 수 있어요. 공개 링크는 존재하지 않아요.',
          '삭제한 책과 작품은 30일 동안 복구 가능한 상태로 보관된 후 완전히 삭제돼요.',
        ],
      },
      {
        h: '이용 중인 서비스 제공업체',
        body: [
          'Supabase — 인증 및 데이터베이스.',
          'Amazon Web Services (S3) — 비공개 파일 저장소.',
          'OpenAI — 텍스트 정보를 바탕으로 독후 질문, 그림 캡션, 번역을 생성해요 (아이 사진은 절대 전달되지 않아요).',
          'Google Cloud Vision — 책 표지 사진에서 텍스트만 추출해 책을 식별해요. 사진 자체는 AI 텍스트 생성 서비스에 공유되지 않아요.',
          'Vercel — 애플리케이션 호스팅.',
          'Lulu Direct — 프린트 주문 이행 (프린트 주문을 하실 경우에만, 현재 미출시).',
        ],
      },
      {
        h: '아동 개인정보 보호',
        body: [
          'booklool은 부모 또는 보호자가 가족 계정을 만들고 아이 프로필/로그인을 직접 설정 및 관리하는 구조로 설계됐어요.',
          '부모가 만든 계정 없이 아이로부터 직접 정보를 수집하지 않아요.',
          '행동 기반 광고를 운영하지 않고, 개인정보를 판매하지 않으며, 아이에게 직접 마케팅하지 않아요.',
        ],
      },
      {
        h: '이용자의 권리',
        body: [
          '앱 안에서 언제든 아이 프로필, 책 기록, 작품을 수정하거나 삭제할 수 있어요.',
          '데이터 사본 요청, 정정, 계정 전체 삭제를 원하시면 아래 이메일로 연락해주세요.',
        ],
      },
      {
        h: '쿠키 및 로컬 저장소',
        body: [
          '로그인 상태 유지를 위한 인증 세션 쿠키(Supabase)와, 언어 설정을 기억하기 위한 로컬 저장소를 사용해요.',
          '제3자 광고/추적 쿠키는 사용하지 않아요.',
        ],
      },
      {
        h: '정책 변경',
        body: ['이 정책에 중요한 변경이 있을 경우, 상단의 날짜를 업데이트해요.'],
      },
      {
        h: '문의',
        body: ['이 정책에 대해 궁금하신 점은 hello@booklool.com으로 연락해주세요.'],
      },
    ],
  },
}

export default function PrivacyPage() {
  const [lang, setLang] = useState<'en' | 'ko'>('en')
  const t = copy[lang]

  useEffect(() => {
    const saved = localStorage.getItem('bl_locale')
    if (saved === 'ko') setLang('ko')
  }, [])

  return (
    <div className="min-h-screen bg-white px-6 py-12" style={{ fontFamily: 'var(--font-nunito), var(--font-noto), sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
            {t.back}
          </Link>
          <button
            onClick={() => setLang(l => (l === 'en' ? 'ko' : 'en'))}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 transition"
          >
            {lang === 'en' ? '한국어' : 'English'}
          </button>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-1">{t.title}</h1>
        <p className="text-sm text-gray-400 mb-10">{t.updated}</p>

        <div className="space-y-8">
          {t.sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-black text-lg text-gray-800 mb-2">{s.h}</h2>
              <ul className="space-y-2">
                {s.body.map((line, j) => (
                  <li key={j} className="text-sm text-gray-600 leading-relaxed">{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
