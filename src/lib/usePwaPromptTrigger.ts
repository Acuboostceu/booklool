'use client'

import { useState, useEffect } from 'react'

// 회원가입 직후 / 책·아트 저장 직후처럼 별도 "완료" 화면이 없는 지점에서
// 다음 페이지가 PwaInstallCard를 띄울지 판단하기 위한 1회성 세션 플래그.
export function usePwaPromptTrigger(): boolean {
  const [trigger, setTrigger] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('bl_show_pwa_prompt') === '1') {
      sessionStorage.removeItem('bl_show_pwa_prompt')
      setTrigger(true)
    }
  }, [])

  return trigger
}
