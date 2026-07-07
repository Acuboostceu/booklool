import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const langNames: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  es: 'Spanish',
}

// 책 소개(외부 API 원문, 보통 en/ko)를 앱 언어로 번역. 결과는 bl_books에 캐싱해
// 같은 책+로케일 조합에 대해 다시 호출하지 않는다.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookId, targetLocale } = await req.json() as { bookId: string; targetLocale: string }
  if (!bookId || !langNames[targetLocale]) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: book } = await supabase
    .from('bl_books')
    .select('description, description_translations')
    .eq('id', bookId)
    .single()

  if (!book?.description) return NextResponse.json({ error: 'No description' }, { status: 404 })

  const cached = book.description_translations?.[targetLocale]
  if (cached) return NextResponse.json({ description: cached, cached: true })

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Translate the following book description into ${langNames[targetLocale]}. Output only the translation, no preamble or quotes.\n\n${book.description}`,
    }],
  })

  const translated = completion.choices[0].message.content?.trim() || book.description

  const nextTranslations = { ...(book.description_translations || {}), [targetLocale]: translated }
  await supabase.from('bl_books').update({ description_translations: nextTranslations }).eq('id', bookId)

  return NextResponse.json({ description: translated, cached: false })
}
