'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

// 스와이프가 인식됐음을 짧게 알려주는 반투명 플래시.
// 페이지 전환이 즉시 일어나 애니메이션이 없다 보니, 조작이 반영됐다는 시각적 피드백 용도.
export default function SwipeFlash({ direction }: { direction: 'left' | 'right' | null }) {
  if (!direction) return null

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center bg-black/10 animate-swipe-flash">
      <div className="w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center">
        {direction === 'left'
          ? <ChevronLeft className="w-5 h-5 text-gray-600" />
          : <ChevronRight className="w-5 h-5 text-gray-600" />}
      </div>
    </div>
  )
}
