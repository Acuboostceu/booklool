export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionProfile } from '@/lib/session'
import { getFamilyProfileIds } from '@/lib/recordAccess'
import sharp from 'sharp'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!
const S3_BASE = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`

// POST: 서버에서 S3에 직접 업로드 (CORS 문제 없음)
// 원본은 무손실 보존(인쇄용), 썸네일(1200px q80)은 화면용
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const profileId = formData.get('profileId') as string

  if (!file || !profileId) return NextResponse.json({ error: 'Missing file or profileId' }, { status: 400 })

  // 요청자 가족 소속 프로필에만 업로드 허용
  const familyIds = await getFamilyProfileIds(createAdminClient(), session)
  if (!familyIds.includes(profileId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const contentType = file.type || 'image/jpeg'
  const ext = contentType.split('/')[1] || 'jpg'
  const recordKey = `books/${profileId}/${Date.now()}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 썸네일 생성 — 긴 변 1200px, JPEG q80. 실패해도 원본 업로드는 진행
  let thumbBuffer: Buffer | null = null
  try {
    thumbBuffer = await sharp(buffer)
      .rotate() // EXIF 회전 반영
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
  } catch (e) {
    console.error('Thumbnail generation failed:', e)
  }

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${recordKey}/original.${ext}`,
      Body: buffer,
      ContentType: contentType,
    }))

    if (thumbBuffer) {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: `${recordKey}/thumb.jpg`,
        Body: thumbBuffer,
        ContentType: 'image/jpeg',
      }))
    }
  } catch (e) {
    console.error('S3 upload failed:', e)
    return NextResponse.json({ error: `S3 upload failed: ${String(e)}` }, { status: 500 })
  }

  const originalUrl = `${S3_BASE}/${recordKey}/original.${ext}`
  const thumbUrl = thumbBuffer ? `${S3_BASE}/${recordKey}/thumb.jpg` : originalUrl

  // publicUrl은 기존 호출부 호환용 (화면용 썸네일)
  return NextResponse.json({ publicUrl: thumbUrl, thumbUrl, originalUrl })
}
