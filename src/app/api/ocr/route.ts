import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json()

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
              detail: 'low',
            },
          },
          {
            type: 'text',
            text: '이 책 표지에서 책 제목만 추출해줘. 제목만 딱 한 줄로 답해줘. 부제목이나 저자는 빼고 메인 제목만.',
          },
        ],
      },
    ],
    max_tokens: 100,
  })

  const title = response.choices[0]?.message?.content?.trim() || ''
  return NextResponse.json({ title })
}
