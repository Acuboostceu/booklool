// S3에 저장된 이미지 URL을 인증 프록시(/api/img) 경유로 변환.
// 외부 URL(구글북스 표지 등)은 그대로 통과.
const S3_HOST_RE = /^https:\/\/booklool\.s3[.-][a-z0-9-]+\.amazonaws\.com\//

export function toImgSrc(url: string | null | undefined): string | null {
  if (!url) return null
  const m = url.match(S3_HOST_RE)
  if (!m) return url
  const key = decodeURIComponent(url.slice(m[0].length).split('?')[0])
  return `/api/img?key=${encodeURIComponent(key)}`
}
