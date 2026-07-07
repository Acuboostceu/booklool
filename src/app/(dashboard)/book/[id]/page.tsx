import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getSessionProfile } from '@/lib/session'
import BookDetailView from './BookDetailView'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('bl_books')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (!book) notFound()

  const session = await getSessionProfile(supabase)

  return <BookDetailView book={book} canDelete={session?.role === 'parent'} />
}
