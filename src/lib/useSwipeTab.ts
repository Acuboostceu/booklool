import { useRef } from 'react'

const SWIPE_THRESHOLD = 50

export function useSwipeTab(
  current: 'books' | 'art',
  onChange: (tab: 'books' | 'art') => void,
) {
  const startX = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    if (dx < 0 && current === 'books') onChange('art')
    if (dx > 0 && current === 'art') onChange('books')
  }

  return { onTouchStart, onTouchEnd }
}
