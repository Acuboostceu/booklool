import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer, Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
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
      .order('read_at', { ascending: true })
    books.push(...(data || []))
  }

  // Load artworks
  const artworks: Artwork[] = []
  if (contentType === 'artwork' || contentType === 'both') {
    const { data } = await supabase
      .rpc('get_family_artworks', { profile_ids: [profileId] })
    artworks.push(...(data || []))
  }

  if (books.length + artworks.length === 0) {
    return NextResponse.json({ error: 'No content found' }, { status: 400 })
  }

  // Generate PDF
  const pdfBuffer = await buildPdf(profile.name, books, artworks, contentType)

  // Upload interior to S3
  const key = `print/${profileId}/${Date.now()}-interior.pdf`
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
    ACL: 'public-read',
  }))

  const interiorUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

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
    ACL: 'public-read',
  }))

  const coverUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${coverKey}`

  return NextResponse.json({
    interiorUrl,
    coverUrl,
    pageCount: 2 + (contentType === 'both' ? books.length > 0 ? 1 : 0 : contentType === 'books' ? 1 : 0) + artworks.length + 1,
    childName: profile.name,
  })
}
