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
  // 이 런타임에서 기본 CRC32 체크섬 계산 경로가 SharedArrayBuffer를 만들어
  // AWS SDK 자체 검증에 실패하는 문제 회피
  requestChecksumCalculation: 'WHEN_REQUIRED',
})

const BUCKET = process.env.AWS_S3_BUCKET!
const S3_BASE = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`

// 원본(인쇄용) + 썸네일(화면용) presigned URL 쌍 발급.
// 서버(Vercel 함수)를 거치지 않고 브라우저가 S3에 직접 PUT하므로
// 함수 요청 본문 크기 제한(~4.5MB)에 걸리지 않는다 — 폰 카메라 원본 그대로 업로드 가능.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const session = await getSessionProfile(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, kind, contentType = 'image/jpeg', originalContentType } = await req.json() as {
    profileId: string
    kind: 'books' | 'artworks'
    contentType?: string
    originalContentType?: string
  }
  if (!profileId || (kind !== 'books' && kind !== 'artworks')) {
    return NextResponse.json({ error: 'Missing or invalid profileId/kind' }, { status: 400 })
  }

  // 요청자 가족 소속 프로필에만 발급
  const familyIds = await getFamilyProfileIds(createAdminClient(), session)
  if (!familyIds.includes(profileId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const recordKey = `${kind}/${profileId}/${Date.now()}`

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
  })
}
