'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

type Point = { x: number; y: number }

interface Props {
  imageUrl: string
  onFlattened: (dataUrl: string) => void
  locale?: string
}

// Solve Ax = b via Gaussian elimination; returns x or null
function gaussianElimination(A: number[][], b: number[]): number[] | null {
  const n = A.length
  // Augmented matrix
  const M = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row
    }
    ;[M[col], M[maxRow]] = [M[maxRow], M[col]]
    if (Math.abs(M[col][col]) < 1e-10) return null

    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const factor = M[row][col] / M[col][col]
      for (let k = col; k <= n; k++) {
        M[row][k] -= factor * M[col][k]
      }
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

// Compute 3x3 homography from src[4] → dst[4]
function computeHomography(src: Point[], dst: Point[]): number[] | null {
  const rows: number[][] = []
  const rhs: number[] = []
  for (let i = 0; i < 4; i++) {
    const { x: sx, y: sy } = src[i]
    const { x: dx, y: dy } = dst[i]
    rows.push([-sx, -sy, -1, 0, 0, 0, dx * sx, dx * sy, dx])
    rows.push([0, 0, 0, -sx, -sy, -1, dy * sx, dy * sy, dy])
    rhs.push(0, 0)
  }
  // The last equation: set h22 = 1 (normalization)
  // We solve for 8 unknowns [h00..h21] with h22 = 1 fixed
  // Rearrange: rhs = -last_col * 1
  const A: number[][] = rows.map(r => r.slice(0, 8))
  const b: number[] = rhs.map((v, i) => v - rows[i][8] * 1)
  const h = gaussianElimination(A, b)
  if (!h) return null
  return [...h, 1]
}

// 3x3 matrix inverse
function invertMatrix3(m: number[]): number[] | null {
  const [a, b, c, d, e, f, g, h, k] = m
  const det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g)
  if (Math.abs(det) < 1e-10) return null
  const inv = [
    (e * k - f * h) / det, (c * h - b * k) / det, (b * f - c * e) / det,
    (f * g - d * k) / det, (a * k - c * g) / det, (c * d - a * f) / det,
    (d * h - e * g) / det, (b * g - a * h) / det, (a * e - b * d) / det,
  ]
  return inv
}

// Apply homography to a point
function applyH(h: number[], x: number, y: number): Point {
  const w = h[6] * x + h[7] * y + h[8]
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w }
}

function dist(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export default function PerspectiveEditor({ imageUrl, onFlattened, locale = 'en' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // display dimensions (canvas coordinate space)
  const [displayW, setDisplayW] = useState(0)
  const [displayH, setDisplayH] = useState(0)
  // natural image dimensions
  const [imgW, setImgW] = useState(0)
  const [imgH, setImgH] = useState(0)

  // corners in display-coordinate space (TL, TR, BR, BL)
  const [corners, setCorners] = useState<Point[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [flattening, setFlattening] = useState(false)

  const HANDLE_R = 18

  // Compute display size fitting container
  const computeDisplay = useCallback((natW: number, natH: number) => {
    const container = containerRef.current
    if (!container) return { w: natW, h: natH }
    const maxW = container.clientWidth || 360
    const ratio = Math.min(maxW / natW, 1)
    return { w: Math.round(natW * ratio), h: Math.round(natH * ratio) }
  }, [])

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setImgW(img.naturalWidth)
      setImgH(img.naturalHeight)
      const { w, h } = computeDisplay(img.naturalWidth, img.naturalHeight)
      setDisplayW(w)
      setDisplayH(h)
      setCorners([
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h },
        { x: 0, y: h },
      ])
    }
    img.src = imageUrl
  }, [imageUrl, computeDisplay])

  // Draw onto canvas whenever corners/dimensions change
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || displayW === 0) return
    canvas.width = displayW
    canvas.height = displayH
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, displayW, displayH)

    if (corners.length !== 4) return

    // Draw polygon lines
    ctx.strokeStyle = 'rgba(59,130,246,0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y)
    ctx.closePath()
    ctx.stroke()

    // Draw handles
    corners.forEach((c, i) => {
      ctx.beginPath()
      ctx.arc(c.x, c.y, HANDLE_R, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(59,130,246,0.85)'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
      // Index label
      ctx.fillStyle = 'white'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(i + 1), c.x, c.y)
    })
  }, [corners, displayW, displayH])

  // Pointer event helpers
  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = displayW / rect.width
    const scaleY = displayH / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const p = getCanvasPoint(e)
    const idx = corners.findIndex(c => dist(c, p) < HANDLE_R * 1.5)
    if (idx !== -1) {
      setDragging(idx)
      canvasRef.current!.setPointerCapture(e.pointerId)
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (dragging === null) return
    const p = getCanvasPoint(e)
    const clamped = {
      x: Math.max(0, Math.min(displayW, p.x)),
      y: Math.max(0, Math.min(displayH, p.y)),
    }
    setCorners(prev => prev.map((c, i) => (i === dragging ? clamped : c)))
  }

  function onPointerUp() {
    setDragging(null)
  }

  async function handleFlatten() {
    if (!imgRef.current || corners.length !== 4) return
    setFlattening(true)

    await new Promise<void>(resolve => setTimeout(resolve, 50))

    // Scale corners from display to natural image coords
    const scaleX = imgW / displayW
    const scaleY = imgH / displayH
    const srcPts = corners.map(c => ({ x: c.x * scaleX, y: c.y * scaleY }))

    // Compute output rectangle size (average of opposite edge lengths)
    const outW = Math.round((dist(srcPts[0], srcPts[1]) + dist(srcPts[3], srcPts[2])) / 2)
    const outH = Math.round((dist(srcPts[0], srcPts[3]) + dist(srcPts[1], srcPts[2])) / 2)

    const dstPts: Point[] = [
      { x: 0, y: 0 },
      { x: outW, y: 0 },
      { x: outW, y: outH },
      { x: 0, y: outH },
    ]

    // Forward homography dst→src, then invert for backward mapping
    const H_fwd = computeHomography(dstPts, srcPts)
    if (!H_fwd) { setFlattening(false); return }

    // Render output
    const outCanvas = document.createElement('canvas')
    outCanvas.width = outW
    outCanvas.height = outH
    const outCtx = outCanvas.getContext('2d')!

    // Draw source to offscreen canvas for pixel access
    const srcCanvas = document.createElement('canvas')
    srcCanvas.width = imgW
    srcCanvas.height = imgH
    const srcCtx = srcCanvas.getContext('2d')!
    srcCtx.drawImage(imgRef.current, 0, 0)
    const srcData = srcCtx.getImageData(0, 0, imgW, imgH)
    const outData = outCtx.createImageData(outW, outH)

    const sw = srcData.width
    const sh = srcData.height
    const sd = srcData.data
    const od = outData.data

    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) {
        const { x: sx, y: sy } = applyH(H_fwd, x, y)
        // Bilinear interpolation
        const x0 = Math.floor(sx), y0 = Math.floor(sy)
        const x1 = x0 + 1, y1 = y0 + 1
        const fx = sx - x0, fy = sy - y0
        if (x0 < 0 || y0 < 0 || x1 >= sw || y1 >= sh) continue
        const i00 = (y0 * sw + x0) * 4
        const i10 = (y0 * sw + x1) * 4
        const i01 = (y1 * sw + x0) * 4
        const i11 = (y1 * sw + x1) * 4
        const oi = (y * outW + x) * 4
        for (let c = 0; c < 3; c++) {
          od[oi + c] = Math.round(
            sd[i00 + c] * (1 - fx) * (1 - fy) +
            sd[i10 + c] * fx * (1 - fy) +
            sd[i01 + c] * (1 - fx) * fy +
            sd[i11 + c] * fx * fy
          )
        }
        od[oi + 3] = 255
      }
    }

    outCtx.putImageData(outData, 0, 0)
    const dataUrl = outCanvas.toDataURL('image/jpeg', 0.92)
    setFlattening(false)
    onFlattened(dataUrl)
  }

  return (
    <div ref={containerRef} className="w-full space-y-3">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', touchAction: 'none', borderRadius: 16, display: 'block', cursor: dragging !== null ? 'grabbing' : 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <p className="text-xs text-gray-400 text-center">
        {locale === 'ko' ? '모서리를 드래그해서 작품 영역을 맞추세요'
          : locale === 'es' ? 'Arrastra las esquinas para ajustar el área de la obra'
          : 'Drag the corners to align with the artwork'}
      </p>
      <button
        onClick={handleFlatten}
        disabled={flattening || corners.length !== 4}
        className="w-full font-bold rounded-2xl py-3 transition disabled:opacity-50"
        style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)' }}
      >
        {flattening
          ? (locale === 'ko' ? '처리 중...' : locale === 'es' ? 'Procesando...' : 'Processing...')
          : (locale === 'ko' ? '📐 평면으로 펴기' : locale === 'es' ? '📐 Aplanar' : '📐 Flatten')}
      </button>
    </div>
  )
}
