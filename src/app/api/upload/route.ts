import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// GET: presigned URL 발급 (클라이언트가 S3에 직접 업로드)
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const profileId = searchParams.get('profileId')
  const contentType = searchParams.get('contentType') || 'image/jpeg'
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `books/${profileId}/${Date.now()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  })

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

  return NextResponse.json({ presignedUrl, publicUrl })
}
