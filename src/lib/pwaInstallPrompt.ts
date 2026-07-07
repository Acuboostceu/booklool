// beforeinstallprompt는 페이지 로드당 한 번만, 언제 뜰지 예측 불가하게 발생한다.
// 이 모듈이 처음 import되는 시점(레이아웃/네비 로드 시)에 즉시 리스너를 등록해
// 이후 어느 컴포넌트에서든 캡처된 이벤트를 꺼내 쓸 수 있게 한다.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners: Array<() => void> = []

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    listeners.forEach(fn => fn())
  })
}

export function getDeferredInstallPrompt() {
  return deferredPrompt
}

export function onInstallPromptAvailable(fn: () => void) {
  listeners.push(fn)
  return () => {
    const i = listeners.indexOf(fn)
    if (i >= 0) listeners.splice(i, 1)
  }
}

export function clearDeferredInstallPrompt() {
  deferredPrompt = null
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

export function getPwaPlatform(): 'ios' | 'android' | 'other' {
  if (typeof window === 'undefined') return 'other'
  const ua = window.navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'other'
}
