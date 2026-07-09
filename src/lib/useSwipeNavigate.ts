import { useRef } from 'react'

const SWIPE_THRESHOLD = 50

// 상세 화면에서 좌/우 스와이프로 이전/다음 레코드로 이동
export function useSwipeNavigate(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const startX = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    if (dx < 0) onSwipeLeft?.()
    if (dx > 0) onSwipeRight?.()
  }

  return { onTouchStart, onTouchEnd }
}
