import { useEffect, useRef } from 'react'

interface Blob {
  x: number   // 0..1 relative
  y: number
  vx: number
  vy: number
  radius: number  // relative to min(W,H)
  hue: number
  hueSpeed: number
  alpha: number
}

const BLOBS: Blob[] = [
  { x: 0.25, y: 0.15, vx:  0.00028, vy:  0.00018, radius: 0.52, hue: 195, hueSpeed:  0.018, alpha: 0.52 },
  { x: 0.75, y: 0.35, vx: -0.00020, vy:  0.00025, radius: 0.44, hue: 270, hueSpeed: -0.024, alpha: 0.46 },
  { x: 0.50, y: 0.80, vx:  0.00014, vy: -0.00020, radius: 0.48, hue: 330, hueSpeed:  0.020, alpha: 0.42 },
  { x: 0.10, y: 0.65, vx:  0.00022, vy:  0.00012, radius: 0.38, hue: 165, hueSpeed: -0.016, alpha: 0.38 },
  { x: 0.85, y: 0.70, vx: -0.00018, vy: -0.00022, radius: 0.36, hue: 240, hueSpeed:  0.022, alpha: 0.34 },
]

export function HeroGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    // Deep-copy blobs so state is per-mount
    const blobs: Blob[] = BLOBS.map(b => ({ ...b }))

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf: number

    const draw = () => {
      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      for (const b of blobs) {
        // Move
        b.x += b.vx
        b.y += b.vy
        // Bounce softly
        if (b.x < -0.05 || b.x > 1.05) b.vx *= -1
        if (b.y < -0.05 || b.y > 1.05) b.vy *= -1
        // Shift hue
        b.hue = (b.hue + b.hueSpeed + 360) % 360

        const cx = b.x * W
        const cy = b.y * H
        const r  = b.radius * Math.min(W, H)

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad.addColorStop(0,   `hsla(${b.hue}, 85%, 62%, ${b.alpha})`)
        grad.addColorStop(0.4, `hsla(${b.hue + 20}, 80%, 58%, ${b.alpha * 0.5})`)
        grad.addColorStop(1,   `hsla(${b.hue + 40}, 75%, 55%, 0)`)

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }

      raf = requestAnimationFrame(draw)
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
