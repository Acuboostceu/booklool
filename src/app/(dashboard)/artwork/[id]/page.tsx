import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rows } = await supabase
    .rpc('get_artwork_by_id', { artwork_id: id })
  const artwork = rows?.[0] ?? null

  if (!artwork) notFound()

  const formattedDate = new Date(artwork.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto">
      {/* Back button */}
      <Link
        href="/bookshelf"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground/90 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        <span>책장으로</span>
      </Link>

      {/* Framed artwork */}
      <div className="flex justify-center mb-8">
        <div
          className="rounded-sm overflow-hidden"
          style={{
            boxShadow:
              '0 0 0 10px #1a1a1a, 0 0 0 18px #2e2e2e, 0 0 0 22px #111, 0 16px 48px rgba(0,0,0,0.45)',
          }}
        >
          <Image
            src={artwork.image_url}
            alt={artwork.title ?? '작품 이미지'}
            width={320}
            height={320}
            className="block object-cover"
            unoptimized
            style={{ display: 'block' }}
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center text-foreground mb-1">
        {artwork.title ?? '제목 없음'}
      </h1>

      {/* Date */}
      <p className="text-center text-sm text-foreground/50 mb-6">{formattedDate}</p>

      {/* Caption card */}
      {artwork.selected_caption && (
        <div className="bg-bl-yellow-light border border-bl-yellow rounded-2xl px-5 py-4">
          <div className="flex gap-2 items-start">
            <span className="text-xl leading-snug">🎨</span>
            <p className="text-foreground/80 text-sm leading-relaxed italic">
              &ldquo;{artwork.selected_caption}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
