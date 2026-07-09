'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const copy = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: July 9, 2026',
    back: '← Back to home',
    sections: [
      {
        h: 'Acceptance of terms',
        body: ['By creating an account or using Booklool, you agree to these terms. If you do not agree, please do not use the service.'],
      },
      {
        h: 'The service',
        body: [
          'Booklool is a family reading and art journal. Core features — book tracking, AI reading questions, artwork journaling, family sharing — are free.',
          'A print-book feature is planned as a paid add-on but is not yet publicly available. These terms will be updated before it launches.',
        ],
      },
      {
        h: 'Accounts',
        body: [
          'A parent or guardian creates the family account and is responsible for any child profiles or child logins created under it.',
          'You are responsible for keeping your login credentials confidential and for all activity under your account.',
        ],
      },
      {
        h: 'Acceptable use',
        body: [
          "Don't attempt to access another family's data, interfere with the service, or use it for anything illegal.",
          "Don't upload content you don't have the right to upload.",
        ],
      },
      {
        h: 'Your content',
        body: [
          'You retain ownership of the photos, text, and other content you add.',
          'You grant us the license needed to store, process, and display that content back to you — including sending relevant text to AI services to generate reading questions, captions, or translations, as described in our Privacy Policy.',
        ],
      },
      {
        h: 'Service availability',
        body: ['We aim to keep Booklool available and reliable but do not guarantee uninterrupted access. The service is provided "as is," without warranties of any kind.'],
      },
      {
        h: 'Limitation of liability',
        body: ['To the extent permitted by law, Booklool is not liable for indirect, incidental, or consequential damages arising from your use of the service.'],
      },
      {
        h: 'Termination',
        body: ['You may delete your account at any time. We may suspend or terminate accounts that violate these terms.'],
      },
      {
        h: 'Changes to these terms',
        body: ['If we make material changes, we will update the date above.'],
      },
      {
        h: 'Contact',
        body: ['Questions about these terms? Email us at support@acuboostceu.com.'],
      },
    ],
  },
  ko: {
    title: '이용약관',
    updated: '최종 업데이트: 2026년 7월 9일',
    back: '← 홈으로',
    sections: [
      {
        h: '약관 동의',
        body: ['계정을 만들거나 booklool을 이용하시면 본 약관에 동의하는 것으로 간주돼요. 동의하지 않으시면 서비스를 이용하지 말아주세요.'],
      },
      {
        h: '서비스 소개',
        body: [
          'booklool은 가족 독서/아트 저널 서비스예요. 책 기록, AI 독후 질문, 그림 저널, 가족 공유 등 핵심 기능은 무료예요.',
          '프린트 북 기능은 유료 부가 서비스로 계획 중이지만 아직 공개되지 않았어요. 출시 전에 본 약관을 업데이트할게요.',
        ],
      },
      {
        h: '계정',
        body: [
          '부모 또는 보호자가 가족 계정을 만들고, 그 아래 만들어진 아이 프로필과 아이 로그인에 대한 책임을 져요.',
          '로그인 정보를 안전하게 관리하고, 본인 계정에서 일어나는 모든 활동에 대한 책임은 이용자 본인에게 있어요.',
        ],
      },
      {
        h: '이용 수칙',
        body: [
          '다른 가족의 데이터에 접근을 시도하거나, 서비스 운영을 방해하거나, 불법적인 목적으로 이용하지 말아주세요.',
          '업로드할 권리가 없는 콘텐츠는 업로드하지 말아주세요.',
        ],
      },
      {
        h: '이용자의 콘텐츠',
        body: [
          '직접 등록한 사진, 텍스트 등 콘텐츠의 소유권은 이용자에게 있어요.',
          '해당 콘텐츠를 저장, 처리, 다시 보여드리는 데 필요한 라이선스를 저희에게 부여하는 것으로 간주돼요 — 개인정보처리방침에 설명된 대로, 독후 질문·캡션·번역 생성을 위해 관련 텍스트를 AI 서비스에 전송하는 것도 포함돼요.',
        ],
      },
      {
        h: '서비스 제공',
        body: ['booklool을 안정적으로 유지하기 위해 노력하지만, 중단 없는 서비스를 보장하지는 않아요. 서비스는 "있는 그대로" 제공되며 어떠한 보증도 하지 않아요.'],
      },
      {
        h: '책임 제한',
        body: ['법이 허용하는 범위 내에서, booklool은 서비스 이용으로 인한 간접적·부수적 손해에 대해 책임지지 않아요.'],
      },
      {
        h: '이용 종료',
        body: ['언제든 계정을 삭제할 수 있어요. 본 약관을 위반한 계정은 정지되거나 종료될 수 있어요.'],
      },
      {
        h: '약관 변경',
        body: ['중요한 변경이 있을 경우 상단의 날짜를 업데이트해요.'],
      },
      {
        h: '문의',
        body: ['본 약관에 대해 궁금하신 점은 support@acuboostceu.com으로 연락해주세요.'],
      },
    ],
  },
}

export default function TermsPage() {
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
