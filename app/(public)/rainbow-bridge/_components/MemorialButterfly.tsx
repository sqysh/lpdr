'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import styles from './MemorialButterfly.module.css'

const WINGS = [
  { side: styles.left, src: '/images/memorial/butterfly-wing-left.png' },
  { side: styles.right, src: '/images/memorial/butterfly-wing-right.png' }
]
const BODY = '/images/memorial/butterfly-body.png'
const SPARK_COLORS = ['#f9a8d4', '#fdba74', '#fde68a', '#86efac', '#7dd3fc', '#c4b5fd']
const REST_ANGLE = -8

type Layer = 'front' | 'behind'
type Pt = { x: number; y: number; layer: Layer }
type Box = { l: number; t: number; r: number; b: number; w: number; h: number }

const wrap = (deg: number) => (((deg % 360) + 540) % 360) - 180
const smooth = (x: number) => x * x * (3 - 2 * x)

// Speed over the flight: arrives already moving (the swoop), eases to a cruise, then slows to a stop for the landing
function speedAt(t: number) {
  if (t < 0.18) return 1.75 - 0.75 * smooth(t / 0.18)
  if (t < 0.78) return 1
  return 1 - smooth((t - 0.78) / 0.22) * 0.97
}
const DIST = (() => {
  const N = 400
  const out = [0]
  let acc = 0
  for (let i = 1; i <= N; i++) {
    acc += speedAt(i / N) / N
    out.push(acc)
  }
  return out.map((v) => v / acc)
})()
function distanceAt(t: number) {
  const x = t * (DIST.length - 1)
  const i = Math.floor(x)
  return i >= DIST.length - 1 ? 1 : DIST[i] + (DIST[i + 1] - DIST[i]) * (x - i)
}

// Catmull-Rom through the waypoints
function point(pts: Pt[], u: number) {
  const n = pts.length - 1
  const s = Math.min(n - 1e-6, u * n)
  const i = Math.floor(s)
  const t = s - i
  const p0 = pts[Math.max(0, i - 1)],
    p1 = pts[i],
    p2 = pts[i + 1],
    p3 = pts[Math.min(n, i + 2)]
  const f = (k: 'x' | 'y') =>
    0.5 *
    (2 * p1[k] +
      (-p0[k] + p2[k]) * t +
      (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t +
      (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)
  return { x: f('x'), y: f('y'), seg: i }
}

// Walks the curve by distance, so speed comes from speedAt and not from how far apart the waypoints are
function lengthTable(pts: Pt[]) {
  const N = 600
  const rows = [{ u: 0, d: 0 }]
  let prev = point(pts, 0)
  let d = 0
  for (let i = 1; i <= N; i++) {
    const u = i / N
    const p = point(pts, u)
    d += Math.hypot(p.x - prev.x, p.y - prev.y)
    rows.push({ u, d })
    prev = p
  }
  return rows.map((r) => ({ u: r.u, d: r.d / (d || 1) }))
}
function uAtDistance(table: { u: number; d: number }[], s: number) {
  let lo = 0
  let hi = table.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (table[mid].d < s) lo = mid
    else hi = mid
  }
  const a = table[lo],
    b = table[hi]
  return a.u + (b.u - a.u) * ((s - a.d) / (b.d - a.d || 1))
}

/** A rainbow butterfly that swoops in, weaves behind the memorial cards and lands on the first (newest) one */
export function MemorialButterfly({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const bfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const page = containerRef.current
    const bf = bfRef.current
    if (!page || !bf) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let timer = 0
    let pts: Pt[] = []
    let table: { u: number; d: number }[] = []
    let end: Pt = { x: 0, y: 0, layer: 'front' }

    const cards = () => [...page.querySelectorAll<HTMLElement>('[data-memorial-card]')]
    const rect = (el: Element): Box => {
      const r = el.getBoundingClientRect()
      const p = page.getBoundingClientRect()
      return { l: r.left - p.left, t: r.top - p.top, r: r.right - p.left, b: r.bottom - p.top, w: r.width, h: r.height }
    }
    const size = () => (page.clientWidth < 560 ? 0.8 : 1)
    const place = (x: number, y: number, angle: number, scale: number) => {
      bf.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scale * size()})`
    }

    // Waypoints come from where the cards actually are, so the flight fits any screen
    function route(): Pt[] {
      const list = cards()
      const pw = page!.clientWidth
      const a = rect(list[0])
      const b = list[1] ? rect(list[1]) : null
      const offLeft = -page!.getBoundingClientRect().left - 160

      if (b && Math.abs(a.t - b.t) < 4) {
        const land: Pt = { x: a.r - 84, y: a.t - 4, layer: 'front' }
        return [
          { x: offLeft, y: a.t - 420, layer: 'front' },
          { x: pw * 0.28, y: a.t - 70, layer: 'front' },
          { x: pw * 0.6, y: a.t - 190, layer: 'behind' },
          { x: b.l + b.w * 0.55, y: b.t + b.h * 0.45, layer: 'behind' },
          { x: b.l + b.w * 0.4, y: b.b + 70, layer: 'front' },
          { x: a.l + a.w * 0.35, y: a.b + 50, layer: 'front' },
          { x: a.l - 40, y: a.t + a.h * 0.55, layer: 'front' },
          { x: a.l + a.w * 0.5, y: a.t + a.h * 0.3, layer: 'front' },
          { x: land.x - 40, y: land.y + 110, layer: 'front' },
          land
        ]
      }

      // One column, or a single memorial: the flight stays around the top card so it never leaves the screen
      const art = rect(list[0].querySelector('[data-memorial-art]') ?? list[0])
      const land: Pt = { x: a.l + a.w * 0.74, y: a.t - 4, layer: 'front' }
      return [
        { x: offLeft, y: a.t - 300, layer: 'front' },
        { x: pw * 0.35, y: a.t - 60, layer: 'front' },
        { x: pw * 0.82, y: a.t - 150, layer: 'behind' },
        { x: pw * 0.55, y: art.t + art.h * 0.55, layer: 'behind' },
        { x: -110, y: art.t + art.h * 0.3, layer: 'front' },
        { x: pw * 0.22, y: a.t - 130, layer: 'front' },
        { x: land.x - 30, y: land.y + 80, layer: 'front' },
        land
      ]
    }

    function measure() {
      pts = route()
      table = lengthTable(pts)
      end = pts[pts.length - 1]
    }

    const overlapsCard = (x: number, y: number) =>
      cards().some((c) => {
        const r = rect(c)
        return x > r.l - 60 && x < r.r + 60 && y > r.t - 40 && y < r.b + 40
      })

    function spark(x: number, y: number, behind: boolean) {
      const el = document.createElement('span')
      el.className = behind ? `${styles.spark} ${styles.sparkBehind}` : styles.spark
      el.style.setProperty('--x', `${x + (Math.random() - 0.5) * 30}px`)
      el.style.setProperty('--y', `${y + (Math.random() - 0.5) * 16}px`)
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 24}px`)
      el.style.setProperty('--dy', `${18 + Math.random() * 26}px`)
      el.style.setProperty('--c', SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0])
      el.addEventListener('animationend', () => el.remove())
      page!.appendChild(el)
    }

    function land() {
      bf!.classList.remove(styles.glide, styles.behind)
      bf!.classList.add(styles.landed, styles.ready)
      place(end.x, end.y, REST_ANGLE, 1)
    }

    function fly() {
      if (!cards().length) return
      cancelAnimationFrame(raf)
      measure()
      bf!.classList.remove(styles.landed, styles.behind, styles.glide)

      if (reduced) return land()

      const duration = page!.clientWidth < 560 ? 7000 : 8200
      const t0 = performance.now()
      let prev = point(pts, 0)
      let angle = 120
      let layer: Layer = 'front'
      let lastSpark = 0

      const step = (now: number) => {
        const raw = Math.min(1, (now - t0) / duration)
        const p = point(pts, uAtDistance(table, distanceAt(raw)))

        // Changes sides only while clear of the cards, so it never pops through one
        const want = pts[p.seg].layer
        if (want !== layer && !overlapsCard(p.x, p.y)) {
          layer = want
          bf!.classList.toggle(styles.behind, layer === 'behind')
        }

        const dx = p.x - prev.x
        const dy = p.y - prev.y
        const moving = Math.hypot(dx, dy)
        if (moving > 0.6) {
          const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90
          angle = wrap(angle + wrap(target - angle) * 0.08)
        }

        // Over the last stretch it eases into a relaxed resting angle instead of snapping upright
        const k = Math.max(0, (raw - 0.82) / 0.18)
        const settle = smooth(k)
        const shown = angle + wrap(REST_ANGLE - angle) * settle
        const live = 1 - settle

        // Butterflies never fly a clean line: a slow sideways drift plus a hop on every wingbeat
        const wob = size() < 1 ? 0.55 : 1
        const nx = -dy / (moving || 1)
        const ny = dx / (moving || 1)
        const drift = (Math.sin(now / 420) * 9 + Math.sin(now / 173) * 4) * live * wob
        const hop = Math.abs(Math.sin(now / 75)) * -4 * live * wob
        const x = p.x + nx * drift
        const y = p.y + ny * drift + hop

        place(x, y, shown, layer === 'behind' ? 0.78 : 1)
        bf!.classList.add(styles.ready)
        bf!.style.setProperty('--flap', raw > 0.86 ? '.22s' : '.14s')
        bf!.classList.toggle(styles.glide, live > 0.6 && Math.sin(now / 900) > 0.82)

        if (now - lastSpark > 60 && raw < 0.97) {
          lastSpark = now
          spark(x, y, layer === 'behind')
        }

        prev = p
        if (raw < 1) raf = requestAnimationFrame(step)
        else land()
      }
      raf = requestAnimationFrame(step)
    }

    // A width change redraws the path in place; height-only changes (phone toolbars) are ignored
    let lastWidth = innerWidth
    let resizeTimer = 0
    const onResize = () => {
      if (innerWidth === lastWidth) return
      lastWidth = innerWidth
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (!pts.length) return
        measure()
        if (bf.classList.contains(styles.landed)) place(end.x, end.y, REST_ANGLE, 1)
      }, 150)
    }
    addEventListener('resize', onResize)

    // Waits for fonts and the cards' fade-in so the route is drawn against their final positions
    let cancelled = false
    Promise.resolve(document.fonts?.ready).then(() => {
      if (!cancelled) timer = window.setTimeout(fly, 900)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      clearTimeout(resizeTimer)
      removeEventListener('resize', onResize)
      page.querySelectorAll(`.${styles.spark}`).forEach((el) => el.remove())
    }
  }, [containerRef])

  return (
    <div ref={bfRef} className={styles.bf} aria-hidden="true">
      <div className={styles.shadow} />
      <div className={styles.pose}>
        <div className={styles.tilt}>
          {WINGS.map(({ side, src }) => (
            <div key={src} className={`${styles.wing} ${side}`}>
              <img src={src} alt="" />
              <span className={styles.sheen} style={{ '--m': `url(${src})` } as CSSProperties} />
              <span className={styles.glint} style={{ '--m': `url(${src})` } as CSSProperties} />
            </div>
          ))}
          <img className={styles.body} src={BODY} alt="" />
        </div>
      </div>
    </div>
  )
}
