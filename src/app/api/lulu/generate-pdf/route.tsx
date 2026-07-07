export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer, Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // 이 런타임에서 기본 CRC32 체크섬 계산 경로가 SharedArrayBuffer를 만들어
  // AWS SDK 자체 검증에 실패하는 문제 회피
  requestChecksumCalculation: 'WHEN_REQUIRED',
})

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 36 },
  coverPage: { backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  coverTitle: { fontSize: 32, fontWeight: 'bold', color: '#166534', marginBottom: 12, textAlign: 'center' },
  coverSub: { fontSize: 14, color: '#4b7c59', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#166534', marginBottom: 16 },
  bookCard: { marginBottom: 24, borderBottom: '1pt solid #e5e7eb', paddingBottom: 20 },
  bookTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  bookMeta: { fontSize: 10, color: '#9ca3af', marginBottom: 8 },
  bookComment: { fontSize: 11, color: '#374151', lineHeight: 1.5 },
  bookCover: { width: 80, height: 110, objectFit: 'cover', borderRadius: 4, marginBottom: 8 },
  artCard: { marginBottom: 24 },
  artImage: { width: '100%', height: 300, objectFit: 'contain', marginBottom: 8 },
  artTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  artCaption: { fontSize: 11, color: '#374151', lineHeight: 1.5 },
  row: { flexDirection: 'row', gap: 12 },
  stars: { fontSize: 11, color: '#f59e0b', marginBottom: 6 },
})

const S3_HOST_RE = /^https:\/\/booklool\.s3[.-][a-z0-9-]+\.amazonaws\.com\//

// S3 URL → presigned GET (버킷 비공개 전환 후에도 PDF 렌더러/Lulu가 접근 가능)
async function presignS3Url(url: string | null, expiresIn: number): Promise<string | null> {
  if (!url) return null
  const m = url.match(S3_HOST_RE)
  if (!m) return url
  const key = decodeURIComponent(url.slice(m[0].length).split('?')[0])
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }), { expiresIn })
}

function starRating(rating: number | null) {
  if (!rating) return ''
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

type Book = {
  id: string; title: string; author: string | null; cover_url: string | null
  rating: number | null; comment: string | null; read_at: string; ai_answer: string | null
}
type Artwork = {
  id: string; title: string; image_url: string | null; selected_caption: string | null; created_at: string
}

async function buildPdf(
  childName: string,
  books: Book[],
  artworks: Artwork[],
  contentType: 'books' | 'artwork' | 'both',
) {
  const includeBooks = contentType === 'books' || contentType === 'both'
  const includeArt = contentType === 'artwork' || contentType === 'both'
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  const doc = (
    <Document>
      {/* Cover */}
      <Page size={[576, 576]} style={[styles.page, styles.coverPage]}>
        <Text style={styles.coverTitle}>{childName}&apos;s Book</Text>
        <Text style={styles.coverSub}>{now}</Text>
      </Page>

      {/* Books pages */}
      {includeBooks && books.length > 0 && (
        <Page size={[576, 576]} style={styles.page}>
          <Text style={styles.sectionTitle}>📚 Books</Text>
          {books.map(book => (
            <View key={book.id} style={styles.bookCard}>
              <View style={styles.row}>
                {book.cover_url && (
                  <Image src={book.cover_url} style={styles.bookCover} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  {book.author && <Text style={styles.bookMeta}>{book.author}</Text>}
                  {book.rating && <Text style={styles.stars}>{starRating(book.rating)}</Text>}
                  {book.comment && <Text style={styles.bookComment}>{book.comment}</Text>}
                  {book.ai_answer && (
                    <Text style={[styles.bookComment, { color: '#6b7280', marginTop: 6 }]}>
                      💭 {book.ai_answer}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </Page>
      )}

      {/* Artwork pages */}
      {includeArt && artworks.map(art => (
        <Page key={art.id} size={[576, 576]} style={styles.page}>
          {art.image_url && <Image src={art.image_url} style={styles.artImage} />}
          <Text style={styles.artTitle}>{art.title}</Text>
          {art.selected_caption && (
            <Text style={styles.artCaption}>{art.selected_caption}</Text>
          )}
        </Page>
      ))}

      {/* Back cover */}
      <Page size={[576, 576]} style={[styles.page, styles.coverPage]}>
        <Text style={styles.coverSub}>Made with booklool 🌿</Text>
      </Page>
    </Document>
  )

  return renderToBuffer(doc)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, contentType } = await req.json() as {
    profileId: string
    contentType: 'books' | 'artwork' | 'both'
  }

  // Load profile
  const { data: profile } = await supabase
    .from('bl_profiles').select('name').eq('id', profileId).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Load books
  const books: Book[] = []
  if (contentType === 'books' || contentType === 'both') {
    const { data } = await supabase
      .from('bl_books')
      .select('id, title, author, cover_url, rating, comment, read_at, ai_answer')
      .eq('profile_id', profileId)
      .is('deleted_at', null)
      .order('read_at', { ascending: true })
    books.push(...(data || []))
  }

  // Load artworks
  const artworks: Artwork[] = []
  if (contentType === 'artwork' || contentType === 'both') {
    const { data } = await supabase
      .rpc('get_family_artworks', { profile_ids: [profileId] })
    artworks.push(...(data || []).filter((a: { deleted_at?: string | null }) => !a.deleted_at))
  }

  if (books.length + artworks.length === 0) {
    return NextResponse.json({ error: 'No content found' }, { status: 400 })
  }

  // PDF에 들어갈 S3 이미지는 presigned URL로 (렌더 중에만 유효하면 됨)
  for (const art of artworks) {
    art.image_url = await presignS3Url(art.image_url, 15 * 60)
  }
  for (const book of books) {
    book.cover_url = await presignS3Url(book.cover_url, 15 * 60)
  }

  // Generate PDF
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await buildPdf(profile.name, books, artworks, contentType)
  } catch (e) {
    console.error('PDF generation error:', e)
    return NextResponse.json({ error: `PDF generation failed: ${String(e)}` }, { status: 500 })
  }

  // Upload interior to S3
  const key = `print/${profileId}/${Date.now()}-interior.pdf`
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
  }))

  // Lulu가 인쇄 시점에 가져갈 수 있도록 24시간 presigned URL
  const interiorUrl = await getSignedUrl(
    s3, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }), { expiresIn: 24 * 3600 })

  // Generate simple cover PDF
  const coverBuffer = await renderToBuffer(
    <Document>
      <Page size={[576, 576]} style={[styles.page, styles.coverPage]}>
        <Text style={styles.coverTitle}>{profile.name}&apos;s Book</Text>
      </Page>
    </Document>
  )

  const coverKey = `print/${profileId}/${Date.now()}-cover.pdf`
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: coverKey,
    Body: coverBuffer,
    ContentType: 'application/pdf',
  }))

  const coverUrl = await getSignedUrl(
    s3, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: coverKey }), { expiresIn: 24 * 3600 })

  return NextResponse.json({
    interiorUrl,
    coverUrl,
    pageCount: 2 + (contentType === 'both' ? books.length > 0 ? 1 : 0 : contentType === 'books' ? 1 : 0) + artworks.length + 1,
    childName: profile.name,
  })
}
