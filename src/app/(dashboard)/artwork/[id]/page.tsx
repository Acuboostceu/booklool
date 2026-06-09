import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ArtworkDetailView from './ArtworkDetailView'

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rows } = await supabase.rpc('get_artwork_by_id', { artwork_id: id })
  const artwork = rows?.[0] ?? null

  if (!artwork) notFound()

  return <ArtworkDetailView artwork={artwork} />
}
