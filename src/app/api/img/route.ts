import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
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

const SIGN_TTL_SECONDS = 10 * 60 // 10분 (≤15분 권장)
const KEY_RE = /^(books|artworks|print)\/([0-9a-f-]{36})\//

// 인증된 가족 구성원에게만 presigned GET으로 리다이렉트
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!key || key.includes('..')) return new NextResponse('Bad request', { status: 400 })

  const m = key.match(KEY_RE)
  if (!m) return new NextResponse('Bad request', { status: 400 })
  const ownerProfileId = m[2]

  const supabase = await createClient()
  const session = await getSessionProfile(supabase)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const admin = createAdminClient()
  const familyIds = await getFamilyProfileIds(admin, session)
  if (!familyIds.includes(ownerProfileId)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }),
    { expiresIn: SIGN_TTL_SECONDS },
  )

  return NextResponse.redirect(signedUrl, {
    // presigned 만료보다 짧게 브라우저 캐시 허용 (재로드 시 프록시 재검증)
    headers: { 'Cache-Control': 'private, max-age=300' },
  })
}
