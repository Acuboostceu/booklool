import { Suspense } from 'react'
import DashboardNav from '@/components/layout/DashboardNav'
import { LocaleProvider } from '@/lib/i18n/LocaleContext'

// 인증 여부는 미들웨어(proxy.ts)가 이미 모든 대시보드 라우트에서 체크하므로
// 여기서 다시 Supabase를 호출하지 않는다 (왕복 하나 절약 → 첫 화면 표시 지연 감소).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className="min-h-screen bg-[#fffbf5] flex flex-col">
        <Suspense fallback={null}>
          <DashboardNav />
        </Suspense>
        <main className="flex-1 w-full px-4 pt-6 pb-24 max-w-2xl mx-auto">
          {children}
        </main>
      </div>
    </LocaleProvider>
  )
}
