// 어두운 사진(재촬영 권장) / 저해상도(인쇄 경고) 판정 기준
const DARK_THRESHOLD = 80 // 0-255 평균 휘도
const MIN_LONG_EDGE = 1600 // px, 인쇄 품질 최소 권장 긴 변

export type ImageQualityResult = {
  brightness: number
  width: number
  height: number
  isDark: boolean
  isLowRes: boolean
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function averageBrightness(img: HTMLImageElement): number {
  const canvas = document.createElement('canvas')
  // 성능을 위해 축소해서 샘플링
  const sample = 100
  const ratio = Math.min(sample / img.naturalWidth, sample / img.naturalHeight, 1)
  canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio))
  const ctx = canvas.getContext('2d')
  if (!ctx) return 255 // 캔버스 사용 불가 시 통과 처리
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let total = 0
  const pixelCount = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return pixelCount > 0 ? total / pixelCount : 255
}

export async function checkImageQuality(file: File): Promise<ImageQualityResult> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const { naturalWidth: width, naturalHeight: height } = img
    const brightness = averageBrightness(img)
    const longEdge = Math.max(width, height)
    return {
      brightness,
      width,
      height,
      isDark: brightness < DARK_THRESHOLD,
      isLowRes: longEdge < MIN_LONG_EDGE,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}
