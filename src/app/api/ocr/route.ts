import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// COPPA: 사진(아이 얼굴 포함 가능)은 텍스트 추출 전용인 Google Vision에만 전달.
// OpenAI에는 추출된 텍스트만 보내 제목/저자를 구조화한다.
export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json()

  // 1. Google Vision — 이미지에서 텍스트만 추출
  const visionRes = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'TEXT_DETECTION' }],
        }],
      }),
    },
  )
  const visionData = await visionRes.json()
  const coverText: string = visionData?.responses?.[0]?.fullTextAnnotation?.text?.trim() || ''

  if (!coverText) return NextResponse.json({ title: '', author: '' })

  // 2. OpenAI — 텍스트에서 제목/저자 구조화 (이미지는 전송하지 않음)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `아래는 책 표지에서 OCR로 추출한 텍스트야. 책 제목과 저자 이름을 찾아서 다음 형식으로만 답해줘:
제목: xxx
저자: xxx
저자를 알 수 없으면 저자: 없음 으로 써줘.

--- 표지 텍스트 ---
${coverText.slice(0, 1500)}`,
    }],
  })

  const content = response.choices[0]?.message?.content?.trim() || ''
  const titleMatch = content.match(/제목:\s*(.+)/i)
  const authorMatch = content.match(/저자:\s*(.+)/i)
  const title = titleMatch?.[1]?.trim() || ''
  const author = authorMatch?.[1]?.trim().replace('없음', '') || ''
  return NextResponse.json({ title, author })
}
