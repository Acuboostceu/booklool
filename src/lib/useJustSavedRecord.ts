'use client'

import { useState, useEffect } from 'react'

// add/page.tsx가 책 저장 직후 세팅하는 1회성 플래그.
// 별도 "완료" 화면이 없는 책 저장 플로우에서, 도착한 다음 페이지가
// 이 훅으로 PwaInstallCard를 띄울지 판단한다.
export function useJustSavedRecord(): boolean {
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('bl_show_pwa_prompt') === '1') {
      sessionStorage.removeItem('bl_show_pwa_prompt')
      setJustSaved(true)
    }
  }, [])

  return justSaved
}
