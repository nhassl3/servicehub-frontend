import { useEffect, useRef } from 'react'

type Shape = 'hub' | 'api' | 'parsers' | 'scripts'
type Point = readonly [x: number, y: number, z: number]
type RGB = readonly [red: number, green: number, blue: number]

const turn = Math.PI * 2
const palettes: Record<Shape, readonly RGB[]> = {
  hub: [[35, 85, 207], [50, 132, 242], [119, 112, 219], [174, 136, 213], [241, 139, 92]],
  api: [[32, 70, 168], [60, 104, 211], [123, 143, 229]],
  parsers: [[21, 95, 88], [35, 143, 128], [87, 173, 148]],
  scripts: [[151, 69, 48], [209, 99, 68], [233, 149, 89]],
}

// Each illustration is a surface sampled along its contour. Short tangent
// strokes keep the same printed texture at every canvas size.
function surface(shape: Shape, u: number, v: number, layer: number): Point {
  switch (shape) {
    case 'hub': {
      const radius = 0.83 + 0.39 * Math.cos(3 * u) + 0.22 * Math.cos(v)
      return [radius * Math.cos(2 * u), radius * Math.sin(2 * u), 0.53 * Math.sin(3 * u) + 0.22 * Math.sin(v)]
    }
    case 'api': {
      const radius = 0.65 + 0.16 * Math.cos(v)
      const x = radius * Math.cos(u)
      const y = radius * Math.sin(u)
      const z = 0.16 * Math.sin(v)
      return layer === 0 ? [x - 0.4, y, z] : [x + 0.4, y * 0.28 - z * 0.96, y * 0.96 + z * 0.28]
    }
    case 'parsers': {
      const x = (u / Math.PI - 1) * 0.92
      const y = (v / Math.PI - 1) * 0.79
      return [x, y, (layer - 1) * 0.35 + 0.13 * Math.sin(x * 3 + y * 1.8)]
    }
    case 'scripts': {
      const radius = 0.5 + 0.12 * Math.cos(v)
      return [(u / Math.PI - 1) * 1.02 + 0.13 * Math.sin(v), radius * Math.cos(2.65 * u), radius * Math.sin(2.65 * u)]
    }
  }
}

function project([x, y, z]: Point): Point {
  const height = y * 0.66 - z * 0.75
  return [x * 0.9 + height * 0.44, -x * 0.44 + height * 0.9, y * 0.75 + z * 0.66]
}

function makeStrokes(shape: Shape) {
  const palette = palettes[shape]
  const rows = shape === 'hub' ? 36 : 24
  const columns = { hub: 220, api: 100, parsers: 40, scripts: 170 }[shape]
  const layers = { hub: 1, api: 2, parsers: 3, scripts: 1 }[shape]
  let seed = 217
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }

  const strokes = []
  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity
  for (let layer = 0; layer < layers; layer++) {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const u = (column + (row % 2) * 0.45 + random() * 0.4) * turn / columns
        const v = (row + random() * 0.35) * turn / rows
        const [x, y, depth] = project(surface(shape, u, v, layer))
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
        const [endX, endY] = project(surface(shape, u + (0.28 + random() * 0.36) * turn / columns, v, layer))
        const loose = shape === 'hub' && random() < 0.045
        const dx = loose ? (random() - 0.5) * 0.96 : 0
        const dy = loose ? (random() - 0.5) * 0.96 : 0
        const position = Math.max(0, Math.min(0.999, 0.45 + x * 0.32 - y * 0.2)) * (palette.length - 1)
        const start = Math.floor(position)
        const mix = position - start
        const shade = 0.89 + 0.13 * Math.sin(v) + random() * 0.09
        const rgb = palette[start].map((value, i) => Math.round((value + (palette[start + 1][i] - value) * mix) * shade))
        const opacity = loose ? 0.22 + random() * 0.47 : Math.min(1, 0.69 + depth * 0.16 + random() * 0.17)
        strokes.push({
          x: x + dx, y: y + dy, endX: endX + dx, endY: endY + dy, depth,
          width: (shape === 'hub' ? 0.0056 : 0.009) * (0.7 + random() * 0.8),
          color: `rgba(${rgb.join(',')},${opacity})`,
        })
      }
    }
  }
  return { strokes: strokes.sort((a, b) => a.depth - b.depth), left, right, top, bottom }
}

export function ParticleArt({ shape }: { shape: Shape }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    let artwork: ReturnType<typeof makeStrokes> | undefined
    // CSS handles motion. The observer draws once on mount and again on resize.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) return
      artwork ??= makeStrokes(shape)
      const { left, right, top, bottom, strokes } = artwork
      const pixels = Math.min(window.devicePixelRatio || 1, 2)
      const scale = Math.min(width / (right - left), height / (bottom - top)) * (shape === 'hub' ? 0.83 : 0.77)
      canvas.width = Math.round(width * pixels)
      canvas.height = Math.round(height * pixels)
      const cx = (width - (left + right) * scale) / 2
      const cy = (height - (top + bottom) * scale) / 2
      context.setTransform(scale * pixels, 0, 0, scale * pixels, cx * pixels, cy * pixels)
      context.lineCap = 'round'
      for (const stroke of strokes) {
        context.lineWidth = stroke.width
        context.strokeStyle = stroke.color
        context.beginPath()
        context.moveTo(stroke.x, stroke.y)
        context.lineTo(stroke.endX, stroke.endY)
        context.stroke()
      }
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [shape])

  return <canvas className="pv-art" ref={ref} aria-hidden="true" />
}

// Low-discrepancy spacing keeps the field stable on rerenders and language changes.
const flecks = Array.from({ length: 76 }, (_, i) => {
  const x = (i * 0.618034) % 1
  const lane = (i * 0.414214) % 1
  const y = lane + 0.09 * Math.sin(x * turn + lane * 3)
  return <i key={i} style={{
    left: `${x * 100}%`, top: `${y * 100}%`,
    rotate: `${Math.cos(x * turn + lane * 3) * 32 - 20}deg`,
    width: 2.5 + i % 4, backgroundColor: ['#5b83e9', '#a897df', '#f2a786', '#64b4bf'][i % 4],
    animationDelay: `-${i % 13}s`, animationDuration: `${7 + i % 6}s`,
  }} />
})

export function ParticleField() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const field = ref.current
    if (!field) return
    const observer = new IntersectionObserver(([entry]) => field.toggleAttribute('data-visible', entry.isIntersecting))
    observer.observe(field)
    return () => observer.disconnect()
  }, [])
  return <div className="pv-field" aria-hidden="true" ref={ref}>{flecks}</div>
}
