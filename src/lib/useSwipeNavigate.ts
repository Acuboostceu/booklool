import { useRef, useState } from 'react'

const SWIPE_THRESHOLD = 50
const FLASH_DURATION_MS = 130 // 페이지 전환 전 잠깐 보여줄 방향 플래시

// 상세 화면에서 좌/우 스와이프로 이전/다음 레코드로 이동.
// 하드 네비게이션이라 전환이 안 느껴지는 문제를 완화하기 위해,
// 이동 직전 짧게 방향 플래시(반투명 오버레이)를 보여준다.
export function useSwipeNavigate(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const startX = useRef<number | null>(null)
  const [flash, setFlash] = useState<'left' | 'right' | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD) return

    const direction = dx < 0 ? 'left' : 'right'
    const callback = dx < 0 ? onSwipeLeft : onSwipeRight
    if (!callback) return

    setFlash(direction)
    setTimeout(callback, FLASH_DURATION_MS)
  }

  return { onTouchStart, onTouchEnd, flash }
}
