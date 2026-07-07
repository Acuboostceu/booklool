import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 텍스트를 대략 maxLen 근처의 마지막 "완결 문장" 경계에서 자른다.
// 문장부호(.!?)를 못 찾으면 단어 중간을 끊지 않도록 마지막 공백에서 자른다.
export function truncateToSentence(text: string, maxLen: number): { text: string; truncated: boolean } {
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return { text: trimmed, truncated: false }

  const slice = trimmed.slice(0, maxLen)
  const sentenceEnds = [...slice.matchAll(/[.!?][")]?(?=\s|$)/g)]
  if (sentenceEnds.length > 0) {
    const last = sentenceEnds[sentenceEnds.length - 1]
    const cut = last.index! + last[0].length
    return { text: slice.slice(0, cut).trim(), truncated: true }
  }

  const lastSpace = slice.lastIndexOf(' ')
  const safeCut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice
  return { text: safeCut.trim(), truncated: true }
}
