'use client'

import { useState, useRef, useCallback } from 'react'
import { checkImageQuality } from './imageQuality'

type CheckResult = { keep: boolean; isLowRes: boolean }

// 사진 선택 직후 품질 체크: 어두우면 재촬영 여부를 물을 다이얼로그를 띄우고,
// 저해상도면 keep 여부와 별개로 isLowRes 플래그를 반환한다(업로드는 항상 허용).
// 한 훅 인스턴스로 여러 업로드 슬롯을 다뤄도 되도록, 슬롯별 상태는 호출부가 보관한다.
export function usePhotoQuality() {
  const [showDarkPrompt, setShowDarkPrompt] = useState(false)
  const resolveRef = useRef<((result: CheckResult) => void) | null>(null)
  const lowResRef = useRef(false)

  const checkFile = useCallback((file: File): Promise<CheckResult> => {
    return new Promise(resolve => {
      checkImageQuality(file).then(result => {
        if (result.isDark) {
          lowResRef.current = result.isLowRes
          resolveRef.current = resolve
          setShowDarkPrompt(true)
        } else {
          resolve({ keep: true, isLowRes: result.isLowRes })
        }
      }).catch(() => resolve({ keep: true, isLowRes: false })) // 검사 실패 시 통과
    })
  }, [])

  function confirmRetake() {
    setShowDarkPrompt(false)
    resolveRef.current?.({ keep: false, isLowRes: lowResRef.current })
    resolveRef.current = null
  }

  function confirmContinue() {
    setShowDarkPrompt(false)
    resolveRef.current?.({ keep: true, isLowRes: lowResRef.current })
    resolveRef.current = null
  }

  return { showDarkPrompt, checkFile, confirmRetake, confirmContinue }
}
