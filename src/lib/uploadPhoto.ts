// 화면용 썸네일 생성 — 긴 변 1200px, JPEG q80
function makeThumbBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(1200 / Math.max(img.width, img.height), 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.8)
    }
    img.onerror = reject
    img.src = url
  })
}

// 원본(무손실, 인쇄용) + 썸네일(화면용)을 presigned URL로 S3에 직접 업로드.
// 서버(Vercel 함수)를 거치지 않아 함수 요청 본문 크기 제한에 걸리지 않는다.
export async function uploadPhoto(
  file: File,
  profileId: string,
  kind: 'books' | 'artworks',
): Promise<{ thumbUrl: string; originalUrl: string }> {
  const urlRes = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, kind, originalContentType: file.type || 'image/jpeg' }),
  })
  if (!urlRes.ok) throw new Error(`Failed to get upload URL: ${urlRes.status}`)
  const { originalUploadUrl, thumbUploadUrl, originalUrl, thumbUrl } = await urlRes.json()

  const thumbBlob = await makeThumbBlob(file)

  const [originalRes, thumbRes] = await Promise.all([
    fetch(originalUploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'image/jpeg' }, body: file }),
    fetch(thumbUploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: thumbBlob }),
  ])
  if (!originalRes.ok) throw new Error(`Original upload to S3 failed: ${originalRes.status}`)
  if (!thumbRes.ok) throw new Error(`Thumbnail upload to S3 failed: ${thumbRes.status}`)

  return { thumbUrl, originalUrl }
}
