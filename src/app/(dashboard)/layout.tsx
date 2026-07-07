import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/layout/DashboardNav'
import { LocaleProvider } from '@/lib/i18n/LocaleContext'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
