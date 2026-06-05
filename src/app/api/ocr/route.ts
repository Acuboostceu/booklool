import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json()

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
    }
  )

  const data = await response.json()
  const text = data.responses?.[0]?.fullTextAnnotation?.text || ''

  // Extract likely title: first meaningful line
  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean)
  const title = lines[0] || ''

  return NextResponse.json({ text, title })
}
