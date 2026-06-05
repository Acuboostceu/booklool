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
            text: '이 책 표지에서 책 제목과 저자 이름을 추출해줘. 다음 형식으로만 답해줘:\n제목: xxx\n저자: xxx\n저자가 안 보이면 저자: 없음 으로 써줘.',
          },
        ],
      },
    ],
    max_tokens: 100,
  })

  const content = response.choices[0]?.message?.content?.trim() || ''
  const titleMatch = content.match(/제목:\s*(.+)/i)
  const authorMatch = content.match(/저자:\s*(.+)/i)
  const title = titleMatch?.[1]?.trim() || ''
  const author = authorMatch?.[1]?.trim().replace('없음', '') || ''
  return NextResponse.json({ title, author })
}
