import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookDetailView from './BookDetailView'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase.from('bl_books').select('*').eq('id', id).single()
  if (!book) notFound()

  return <BookDetailView book={book} />
}
