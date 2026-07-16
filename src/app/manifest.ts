import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Booklool',
    short_name: 'Booklool',
    description: '책 그림일기 - 아이와 함께 읽은 책을 기록해요',
    // 설치된 PWA 아이콘 실행 시 대상. 이미 로그인된 재방문 사용자가 압도적 다수이므로
    // '/'를 거쳐 미들웨어가 /bookshelf로 리다이렉트하는 왕복 한 번을 건너뛴다.
    // 로그아웃 상태라면 미들웨어가 /login으로 보내므로 그 경우에도 안전하다.
    start_url: '/bookshelf',
    display: 'standalone',
    background_color: '#fffbf5',
    theme_color: '#fffbf5',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
