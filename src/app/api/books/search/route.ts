import { NextRequest, NextResponse } from 'next/server'
import type { BookSearchResult } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  if (!query) return NextResponse.json({ results: [] })

  // Google Books API
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&orderBy=relevance&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  const results: BookSearchResult[] = (data.items || []).map((item: any) => {
    const info = item.volumeInfo
    const lang = info.language === 'ko' ? 'ko' : 'en'
    return {
      title: info.title || '',
      author: (info.authors || []).join(', '),
      publisher: info.publisher,
      cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
      // 잘림 없이 원문 저장 — 표시 단계에서 문장 단위로 자름
      description: info.description,
      isbn: info.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier,
      language: lang,
    }
  })

  return NextResponse.json({ results })
}
