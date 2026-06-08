import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { title, keywords, profileName } = await req.json()

  const artDesc = `Artwork title: "${title}"${keywords ? `, keywords: ${keywords}` : ''}${profileName ? `, by child: ${profileName}` : ''}`

  const [curator, parent, child] = await Promise.all([
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `Write a short art curator-style caption (2-3 sentences, formal and aesthetic language) for this child's artwork. ${artDesc}. Output only the caption.`,
      }],
    }),
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `Write a short warm parent diary-style caption (2-3 sentences, personal and loving) about this child's artwork. ${artDesc}. Output only the caption.`,
      }],
    }),
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `Write a short caption in a child's voice (simple, excited, first-person, like the child is describing their own drawing) for this artwork. ${artDesc}. Output only the caption.`,
      }],
    }),
  ])

  return NextResponse.json({
    curator: curator.choices[0].message.content?.trim() || '',
    parent: parent.choices[0].message.content?.trim() || '',
    child: child.choices[0].message.content?.trim() || '',
  })
}
