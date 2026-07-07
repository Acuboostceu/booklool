import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { calcAge } from '@/lib/utils'

const langMap: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  es: 'Spanish',
}

function ageTierGuidance(age: number | null): string {
  if (age === null) {
    return 'The child\'s exact age is unknown. Ask a simple, open-ended question about their favorite part or character.'
  }
  if (age <= 6) {
    return 'The child is 4-6 years old. Ask ONE simple, concrete question about a favorite scene or character. Use easy, everyday words a young child understands.'
  }
  if (age <= 9) {
    return 'The child is 7-9 years old. Ask about feelings, or a "why do you think that happened?" style question about the story.'
  }
  return 'The child is 10 or older. Ask about a character\'s motivation, a choice they made, or connect the story to the child\'s own life.'
}

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { title, author, language, birthYear, birthMonth } = await req.json()

  const appLanguage = langMap[language] ?? 'Korean'
  const age = calcAge(birthYear, birthMonth)

  const systemPrompt = `You write one reading-comprehension question for a child who just finished a book.
${ageTierGuidance(age)}

Rules:
- Output ONLY the question, nothing else (no preamble, no quotes).
- Exactly one sentence, ending with a question mark.
- Respond in ${appLanguage}, regardless of the language of the book title/author below.`

  const userPrompt = `Book: "${title}"${author ? ` by ${author}` : ''}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 100,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const question = completion.choices[0].message.content?.trim() || ''
  return NextResponse.json({ question })
}
