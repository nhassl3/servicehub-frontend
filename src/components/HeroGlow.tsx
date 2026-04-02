import { useEffect, useRef } from 'react'

interface Blob {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  hue: number
  hueSpeed: number
  alpha: number
}

const BLOBS: Blob[] = [
  { x: 0.25, y: 0.15, vx:  0.00028, vy:  0.00018, radius: 0.62, hue: 195, hueSpeed:  1, alpha: 0.45 },
  { x: 0.75, y: 0.35, vx: -0.00020, vy:  0.00025, radius: 0.54, hue: 270, hueSpeed: -1, alpha: 0.40 },
  { x: 0.50, y: 0.80, vx:  0.00014, vy: -0.00020, radius: 0.58, hue: 330, hueSpeed:  1, alpha: 0.36 },
  { x: 0.10, y: 0.65, vx:  0.00022, vy:  0.00012, radius: 0.48, hue: 165, hueSpeed: -1, alpha: 0.32 },
  { x: 0.85, y: 0.70, vx: -0.00018, vy: -0.00022, radius: 0.46, hue: 240, hueSpeed:  1, alpha: 0.28 },
]

const SCALE = 0.25          // render at 1/4 resolution
const TARGET_FPS = 15
const FRAME_MS = 1000 / TARGET_FPS

export function HeroGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const blobs: Blob[] = BLOBS.map(b => ({ ...b }))

    const resize = () => {
      canvas.width  = Math.round(canvas.offsetWidth * SCALE)
      canvas.height = Math.round(canvas.offsetHeight * SCALE)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf: number
    let last = 0

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)

      if (time - last < FRAME_MS) return
      last = time

      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      for (const b of blobs) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < -0.05 || b.x > 1.05) b.vx *= -1
        if (b.y < -0.05 || b.y > 1.05) b.vy *= -1
        b.hue = (b.hue + b.hueSpeed + 360) % 360

        const cx = b.x * W
        const cy = b.y * H
        const r  = b.radius * Math.min(W, H)

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad.addColorStop(0,   `hsla(${b.hue}, 85%, 62%, ${b.alpha})`)
        grad.addColorStop(0.35, `hsla(${b.hue + 20}, 80%, 58%, ${b.alpha * 0.4})`)
        grad.addColorStop(0.7, `hsla(${b.hue + 30}, 75%, 55%, ${b.alpha * 0.01})`)
        grad.addColorStop(1,   `hsla(${b.hue + 40}, 75%, 55%, 0)`)

        // Draw only in blob bounding box, not full canvas
        const x0 = Math.max(0, Math.floor(cx - r))
        const y0 = Math.max(0, Math.floor(cy - r))
        const x1 = Math.min(W, Math.ceil(cx + r))
        const y1 = Math.min(H, Math.ceil(cy + r))

        ctx.fillStyle = grad
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
      }
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="hero__glow-canvas"
    />
  )
}
