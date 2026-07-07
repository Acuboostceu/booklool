import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const langMap: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  es: 'español',
}

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { title, keywords, profileName, locale = 'ko' } = await req.json()

  const lang = langMap[locale] ?? 'Korean'
  // COPPA: 아이 이름은 OpenAI로 보내지 않음 — {child} 플레이스홀더를 응답 후 치환
  const artDesc = `Artwork title: "${title}"${keywords ? `, keywords: ${keywords}` : ''}`
  const guardrails = `Rules:
- Only reference artists or art movements if the user explicitly named them in the keywords above. Never invent or assume an artistic influence.
- End the caption on a concrete, specific visual detail from the artwork itself (e.g. the character's expression, the energy of the linework, a specific color choice) — never end on an abstract closing line like "a shared human experience" or "the wonder of childhood."
- Respond in ${lang}. If you refer to the child, use the literal placeholder {child} instead of a name.`

  const [curator, parent, child] = await Promise.all([
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Write a short art curator-style caption (2-3 sentences, formal and aesthetic language) for this child's artwork. ${artDesc}.\n${guardrails}\nOutput only the caption.`,
      }],
    }),
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Write a short warm parent diary-style caption (2-3 sentences, personal and loving) about this child's artwork, referring to the child as {child}. ${artDesc}.\n${guardrails}\nOutput only the caption.`,
      }],
    }),
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Write a short caption in a child's voice (simple, excited, first-person, like the child is describing their own drawing). ${artDesc}.\n${guardrails}\nOutput only the caption.`,
      }],
    }),
  ])

  // 응답 후 서버에서 이름 치환 (API 전송 데이터에는 이름 미포함)
  const fill = (text: string | null | undefined) =>
    (text?.trim() || '').replaceAll('{child}', profileName || (locale === 'ko' ? '아이' : locale === 'es' ? 'mi peque' : 'my little one'))

  return NextResponse.json({
    curator: fill(curator.choices[0].message.content),
    parent: fill(parent.choices[0].message.content),
    child: fill(child.choices[0].message.content),
  })
}
