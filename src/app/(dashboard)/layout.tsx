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
        <DashboardNav />
        <main className="flex-1 md:ml-56 w-full px-4 py-6 max-w-3xl md:max-w-4xl mx-auto md:mx-0 md:px-10">
          {children}
        </main>
      </div>
    </LocaleProvider>
  )
}
