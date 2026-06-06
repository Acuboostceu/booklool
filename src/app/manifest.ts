import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Booklool',
    short_name: 'Booklool',
    description: '책 그림일기 - 아이와 함께 읽은 책을 기록해요',
    start_url: '/',
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
