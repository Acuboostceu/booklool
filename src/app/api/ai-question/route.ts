import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { title, author, language } = await req.json()

  const isKorean = language === 'ko'

  const prompt = isKorean
    ? `책 제목: "${title}"${author ? `, 저자: ${author}` : ''}
이 책을 읽은 아이에게 독후 질문 하나를 만들어주세요.
- 짧고 쉬운 한국어로 (한 문장)
- 아이가 자신의 생각을 말할 수 있는 열린 질문
- 물음표로 끝내기
질문만 출력하세요.`
    : `Book: "${title}"${author ? ` by ${author}` : ''}
Create one reading comprehension question for a young reader.
- Short and simple (one sentence)
- Open-ended question that encourages personal reflection
- End with a question mark
Output only the question.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  })

  const question = completion.choices[0].message.content?.trim() || ''
  return NextResponse.json({ question })
}
