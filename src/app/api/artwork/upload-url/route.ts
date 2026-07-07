import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionProfile } from '@/lib/session'
import { getFamilyProfileIds } from '@/lib/recordAccess'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!
const S3_BASE = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`

// 원본(인쇄용) + 썸네일(화면용) presigned URL 쌍 발급
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, contentType = 'image/jpeg', originalContentType } = await req.json()
  if (!profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })

  // 요청자 가족 소속 프로필에만 발급
  const familyIds = await getFamilyProfileIds(createAdminClient(), session)
  if (!familyIds.includes(profileId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const recordKey = `artworks/${profileId}/${Date.now()}`

  const origType = originalContentType || contentType
  const origExt = (origType.split('/')[1] || 'jpg').replace('jpeg', 'jpg')

  const [originalUploadUrl, thumbUploadUrl] = await Promise.all([
    getSignedUrl(s3, new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${recordKey}/original.${origExt}`,
      ContentType: origType,
    }), { expiresIn: 300 }),
    getSignedUrl(s3, new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${recordKey}/thumb.jpg`,
      ContentType: 'image/jpeg',
    }), { expiresIn: 300 }),
  ])

  return NextResponse.json({
    originalUploadUrl,
    thumbUploadUrl,
    originalUrl: `${S3_BASE}/${recordKey}/original.${origExt}`,
    thumbUrl: `${S3_BASE}/${recordKey}/thumb.jpg`,
    // 기존 호출부 호환용
    uploadUrl: thumbUploadUrl,
    imageUrl: `${S3_BASE}/${recordKey}/thumb.jpg`,
  })
}
