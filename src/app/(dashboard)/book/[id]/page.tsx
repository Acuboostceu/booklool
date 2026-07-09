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

  // 같은 프로필의 책 목록(책장과 동일한 정렬)에서 이전/다음 id를 구해 스와이프 이동에 사용
  const { data: siblings } = await supabase
    .from('bl_books')
    .select('id')
    .eq('profile_id', book.profile_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  const ids = (siblings || []).map(s => s.id)
  const idx = ids.indexOf(id)
  const prevId = idx > 0 ? ids[idx - 1] : null
  const nextId = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null

  return <BookDetailView book={book} canDelete={session?.role === 'parent'} prevId={prevId} nextId={nextId} />
}
