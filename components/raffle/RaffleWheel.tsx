'use client'

import { useAnimate } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type RaffleEntry = { id: string; name: string; weight?: number }
export type RaffleTheme = 'little-paws' | 'iridescent' | 'aurora' | 'candy'

type ThemeTokens = {
  surface: string
  ink: string
  muted: string
  accent: string
  accentShadow: string
  button: string
  sliceMode: 'solid' | 'holo' | 'neon'
  slices?: string[]
  hueOffset?: number
  text: string
  sep: string
  rimGlow: string | null
  hub: { fill: string; stroke: string; paw: string }
  pointer: string
  pointerKnob: string
  confetti: string[]
}

const THEMES: Record<RaffleTheme, ThemeTokens> = {
  'little-paws': {
    surface: '#fdf7ee',
    ink: '#3a2a22',
    muted: '#8a776b',
    accent: '#c0603a',
    accentShadow: '#8f4328',
    button: '#c0603a',
    sliceMode: 'solid',
    slices: ['#c96a3f', '#7a8f57', '#b2473f', '#4f7a6b', '#d98b4a', '#8a5a3c'],
    text: '#fff',
    sep: 'rgba(255,255,255,0.65)',
    rimGlow: null,
    hub: { fill: '#fffdf9', stroke: '#a5423e', paw: '#a5423e' },
    pointer: '#a5423e',
    pointerKnob: '#f3c969',
    confetti: ['#c96a3f', '#7a8f57', '#f3c969', '#4f7a6b', '#fff']
  },
  iridescent: {
    surface: 'radial-gradient(900px 700px at 25% -10%, #241b3a, #0c0a1a 60%, #060510)',
    ink: '#f2ecff',
    muted: '#a99fd6',
    accent: '#ff3ea5',
    accentShadow: '#7a1e68',
    button: 'linear-gradient(92deg,#ff3ea5,#8a5cff,#53e8ff)',
    sliceMode: 'holo',
    hueOffset: 0,
    text: '#fff',
    sep: 'rgba(255,255,255,0.85)',
    rimGlow: '#8affff',
    hub: { fill: '#0c0a1a', stroke: '#53e8ff', paw: '#ff3ea5' },
    pointer: '#53e8ff',
    pointerKnob: '#ff3ea5',
    confetti: ['#ff3ea5', '#53e8ff', '#9b6bff', '#8affc0', '#fff176', '#fff']
  },
  aurora: {
    surface: 'radial-gradient(900px 700px at 50% -20%, #0b2a3a, #071a2a 55%, #040d18)',
    ink: '#e9fbff',
    muted: '#8fb4c4',
    accent: '#2fe6c0',
    accentShadow: '#0f6b5a',
    button: 'linear-gradient(92deg,#2fe6c0,#4aa8ff,#9b6bff)',
    sliceMode: 'holo',
    hueOffset: 150,
    text: '#fff',
    sep: 'rgba(255,255,255,0.8)',
    rimGlow: '#7fffe6',
    hub: { fill: '#061420', stroke: '#2fe6c0', paw: '#8ab6ff' },
    pointer: '#8ab6ff',
    pointerKnob: '#2fe6c0',
    confetti: ['#2fe6c0', '#8ab6ff', '#b57aff', '#7fffe6', '#fff']
  },
  candy: {
    surface: '#fff6fb',
    ink: '#2a1636',
    muted: '#9a7aa8',
    accent: '#ff2d8e',
    accentShadow: '#b31e66',
    button: 'linear-gradient(92deg,#ff2d8e,#9b5cff,#18c7ff)',
    sliceMode: 'neon',
    slices: ['#ff2d8e', '#18c7ff', '#9b5cff', '#2fd56b', '#ffb020', '#ff5ec4', '#4a7bff'],
    text: '#fff',
    sep: 'rgba(255,255,255,0.9)',
    rimGlow: '#ff7ad4',
    hub: { fill: '#fff', stroke: '#ff2d8e', paw: '#9b5cff' },
    pointer: '#ff2d8e',
    pointerKnob: '#18c7ff',
    confetti: ['#ff2d8e', '#18c7ff', '#9b5cff', '#2fd56b', '#ffb020', '#fff']
  }
}

type Slice = { entry: RaffleEntry; startDeg: number; angleDeg: number; centerDeg: number }

type RaffleWheelProps = {
  entries: RaffleEntry[]
  theme?: RaffleTheme
  size?: number
  // The server action plugs in here. It must resolve to one of `entries`.
  // Left off, the wheel picks a weighted winner on the client so it runs on its own.
  onDraw?: () => Promise<RaffleEntry>
  onWinner?: (entry: RaffleEntry) => void
}

export default function RaffleWheel({ entries, theme = 'little-paws', onDraw, onWinner }: RaffleWheelProps) {
  const t = THEMES[theme]
  const [scope, animate] = useAnimate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<RaffleEntry | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      const h = el.clientHeight
      const s = Math.floor(h > 0 ? Math.min(w, h) : w)
      if (s > 0) setSize(s)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const slices = useMemo<Slice[]>(() => {
    const total = entries.reduce((a, e) => a + (e.weight ?? 1), 0) || 1
    const out: Slice[] = []
    let cursor = 0
    for (const entry of entries) {
      const angle = ((entry.weight ?? 1) / total) * 360
      out.push({ entry, startDeg: cursor, angleDeg: angle, centerDeg: cursor + angle / 2 })
      cursor += angle
    }
    return out
  }, [entries])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || size === 0) return
    const dpr = window.devicePixelRatio || 1
    const R = size / 2
    const HUB = R * 0.17
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    const rad = (d: number) => ((d - 90) * Math.PI) / 180

    slices.forEach((s, i) => {
      ctx.beginPath()
      ctx.moveTo(R, R)
      ctx.arc(R, R, R - 6, rad(s.startDeg), rad(s.startDeg + s.angleDeg))
      ctx.closePath()
      if (t.sliceMode === 'holo') {
        const a = rad(s.startDeg),
          b = rad(s.startDeg + s.angleDeg)
        const g = ctx.createLinearGradient(R + Math.cos(a) * R, R + Math.sin(a) * R, R + Math.cos(b) * R, R + Math.sin(b) * R)
        const h = (s.centerDeg + (t.hueOffset ?? 0)) % 360
        g.addColorStop(0, `hsl(${(h + 30) % 360},95%,68%)`)
        g.addColorStop(0.5, `hsl(${h},92%,58%)`)
        g.addColorStop(1, `hsl(${(h + 330) % 360},95%,70%)`)
        ctx.fillStyle = g
      } else {
        ctx.fillStyle = t.slices![i % t.slices!.length]
      }
      if (t.sliceMode === 'neon') {
        ctx.shadowColor = ctx.fillStyle as string
        ctx.shadowBlur = 16
      }
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.lineWidth = 2.5
      ctx.strokeStyle = t.sep
      ctx.stroke()
    })

    const fs = Math.max(size * 0.028, Math.min(size * 0.06, (size * 0.92) / Math.max(6, slices.length)))
    ctx.font = `700 ${fs}px Fredoka, system-ui, sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    slices.forEach((s) => {
      ctx.save()
      ctx.translate(R, R)
      ctx.rotate(((s.centerDeg - 90) * Math.PI) / 180)
      ctx.fillStyle = t.text
      ctx.shadowColor = 'rgba(0,0,0,0.45)'
      ctx.shadowBlur = 4
      const max = Math.max(6, Math.floor(26 - slices.length * 0.6))
      const label = s.entry.name.length > max ? s.entry.name.slice(0, max - 1) + '\u2026' : s.entry.name
      ctx.fillText(label, R - size * 0.06, 0)
      ctx.restore()
    })
    ctx.shadowBlur = 0

    if (t.rimGlow) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(R, R, R - 7, 0, Math.PI * 2)
      ctx.lineWidth = 8
      ctx.strokeStyle = t.rimGlow
      ctx.shadowColor = t.rimGlow
      ctx.shadowBlur = 24
      ctx.stroke()
      ctx.restore()
    }

    ctx.beginPath()
    ctx.arc(R, R, HUB, 0, Math.PI * 2)
    ctx.fillStyle = t.hub.fill
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = t.hub.stroke
    ctx.stroke()
    ctx.fillStyle = t.hub.paw
    const pr = HUB * 0.22
    ctx.beginPath()
    ctx.arc(R, R + pr * 0.6, pr * 1.15, 0, Math.PI * 2)
    ctx.fill()
    ;[
      [-1.3, -0.6],
      [-0.5, -1.25],
      [0.5, -1.25],
      [1.3, -0.6]
    ].forEach(([dx, dy]) => {
      ctx.beginPath()
      ctx.arc(R + dx * pr, R + dy * pr, pr * 0.55, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [slices, t, size])

  useEffect(() => {
    draw()
  }, [draw])

  const burstConfetti = useCallback(() => {
    const canvas = confettiRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const parts = Array.from({ length: 140 }, () => ({
      x: size / 2 + (Math.random() - 0.5) * 120,
      y: size * 0.12,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -6 - 2,
      g: 0.3,
      s: 4 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: t.confetti[(Math.random() * t.confetti.length) | 0],
      life: 95 + Math.random() * 35
    }))
    let raf = 0
    const tick = () => {
      ctx.clearRect(0, 0, size, size)
      let alive = false
      for (const p of parts) {
        if (p.life <= 0) continue
        alive = true
        p.life--
        p.vy += p.g
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40))
        ctx.fillStyle = p.c
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6)
        ctx.restore()
      }
      if (alive) raf = requestAnimationFrame(tick)
      else cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(tick)
  }, [t, size])

  const spin = useCallback(async () => {
    if (spinning || slices.length < 2) return
    setSpinning(true)
    setWinner(null)

    const localPick = () => {
      const total = slices.reduce((a, s) => a + (s.entry.weight ?? 1), 0)
      let r = Math.random() * total
      for (const s of slices) {
        r -= s.entry.weight ?? 1
        if (r <= 0) return s.entry
      }
      return slices[slices.length - 1].entry
    }

    const drawn = onDraw ? await onDraw() : localPick()
    const slice = slices.find((s) => s.entry.id === drawn.id)
    if (!slice) {
      setSpinning(false)
      return
    }

    // Always animate to a predetermined winner so the server can own the real draw.
    const base = 360 * 5
    const targetMod = (360 - slice.centerDeg) % 360
    const jitter = (Math.random() - 0.5) * slice.angleDeg * 0.6
    const currentMod = (((rotationRef.current + base) % 360) + 360) % 360
    const needed = (targetMod - currentMod + 360) % 360
    rotationRef.current += base + needed + jitter

    await animate(scope.current, { rotate: rotationRef.current }, { duration: 5.2, ease: [0.16, 0.73, 0.1, 1] })

    setWinner(drawn)
    setSpinning(false)
    onWinner?.(drawn)
    burstConfetti()
  }, [spinning, slices, onDraw, onWinner, animate, scope, burstConfetti])

  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl p-6" style={{ background: t.surface, color: t.ink }}>
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute left-1/2 -top-1 z-10 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: `34px solid ${t.pointer}`,
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))'
          }}
        >
          <div
            className="absolute"
            style={{
              top: -40,
              left: -9,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: t.pointerKnob,
              border: `3px solid ${t.pointer}`
            }}
          />
        </div>
        <div ref={scope} className="h-full w-full">
          <canvas
            ref={canvasRef}
            onClick={spin}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: t.rimGlow ? `0 0 40px ${t.rimGlow}55, 0 16px 44px rgba(0,0,0,0.3)` : '0 16px 44px rgba(0,0,0,0.3)'
            }}
          />
        </div>
        <canvas ref={confettiRef} className="pointer-events-none absolute inset-0 z-20" style={{ width: size, height: size }} />
      </div>

      <button
        onClick={spin}
        disabled={spinning || slices.length < 2}
        className="rounded-full px-12 py-3.5 text-lg font-semibold text-white transition disabled:opacity-60"
        style={{
          background: t.button,
          boxShadow: `0 6px 0 ${t.accentShadow}, 0 12px 22px rgba(0,0,0,0.22)`,
          fontFamily: 'Fredoka, system-ui, sans-serif'
        }}
      >
        {spinning ? 'Drawing...' : 'Spin'}
      </button>

      <div className="min-h-13 text-center">
        {winner ? (
          <>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.muted }}>
              Winner
            </div>
            <div className="text-3xl font-bold" style={{ color: t.accent, fontFamily: 'Fredoka, system-ui, sans-serif' }}>
              {winner.name}
            </div>
          </>
        ) : (
          <div style={{ color: t.muted }}>{slices.length < 2 ? 'Add at least two entries' : 'Draw a winner'}</div>
        )}
      </div>
    </div>
  )
}
