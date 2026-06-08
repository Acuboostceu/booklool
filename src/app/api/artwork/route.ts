import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@/lib/supabase/server'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    profileId,
    title,
    keywords,
    imageBase64,
    captionCurator,
    captionParent,
    captionChild,
    selectedCaption,
  } = await req.json()

  if (!profileId || !title || !imageBase64) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Decode base64 and upload to S3
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
  const buffer = Buffer.from(base64Data, 'base64')
  const key = `artworks/${profileId}/${Date.now()}.jpg`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  }))

  const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

  const { data, error } = await supabase.from('bl_artworks').insert({
    profile_id: profileId,
    title,
    keywords: keywords || null,
    image_url: imageUrl,
    caption_curator: captionCurator || null,
    caption_parent: captionParent || null,
    caption_child: captionChild || null,
    selected_caption: selectedCaption || null,
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id, imageUrl })
}
