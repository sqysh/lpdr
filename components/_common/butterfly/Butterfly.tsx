'use client'

import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import styles from './Butterfly.module.css'
import Image from 'next/image'

export type Layer = 'front' | 'behind'
export type FlightPoint = { x: number; y: number; layer?: Layer }
export type Box = { l: number; t: number; r: number; b: number; w: number; h: number }

export type FlightContext = {
  width: number
  height: number
  // fully past the left edge of the window, wherever the container sits
  offLeft: number
  rect: (el: Element) => Box
  find: (selector: string) => HTMLElement | null
  findAll: (selector: string) => HTMLElement[]
}

export type Flight = {
  points: FlightPoint[]
  duration: number
  scale?: number
  // waypoints from..to draw this element in behind the butterfly, through its --trace variable (0 to 1)
  trace?: { from: number; to: number; el: HTMLElement }
}

type Props = {
  containerRef: RefObject<HTMLElement | null>
  // define this outside the component so it keeps the same identity between renders
  route: (ctx: FlightContext) => Flight | null
  obstacles?: string
  zIndex?: { front: number; behind: number }
}

const WINGS = { left: '/images/memorial/butterfly-wing-left.png', right: '/images/memorial/butterfly-wing-right.png' }
const BODY = '/images/memorial/butterfly-body.png'
const SPARK_COLORS = ['#f9a8d4', '#fdba74', '#fde68a', '#86efac', '#7dd3fc', '#c4b5fd']
const REST_ANGLE = -8
const DEFAULT_Z = { front: 3, behind: 1 }

const smoothstep = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
// keeps an angle between -180 and 180 so turns always go the short way round
const wrapDegrees = (deg: number) => (((deg % 360) + 540) % 360) - 180

// Catmull-Rom spline through the waypoints. progress runs 0 to 1 across the whole path.
function pointOnPath(points: FlightPoint[], progress: number) {
  const segments = points.length - 1
  const position = Math.min(segments - 1e-6, progress * segments)
  const segment = Math.floor(position)
  const t = position - segment
  const p0 = points[Math.max(0, segment - 1)]
  const p1 = points[segment]
  const p2 = points[segment + 1]
  const p3 = points[Math.min(segments, segment + 2)]
  const blend = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
  return { x: blend(p0.x, p1.x, p2.x, p3.x), y: blend(p0.y, p1.y, p2.y, p3.y), segment }
}

type DistanceSample = { progress: number; distance: number }

// How far along the path (0 to 1) each progress value is, so speed comes from the timing and not from waypoint spacing
function measureDistances(points: FlightPoint[]): DistanceSample[] {
  const SAMPLES = 800
  const samples: DistanceSample[] = [{ progress: 0, distance: 0 }]
  let previous = pointOnPath(points, 0)
  let total = 0
  for (let i = 1; i <= SAMPLES; i++) {
    const progress = i / SAMPLES
    const p = pointOnPath(points, progress)
    total += Math.hypot(p.x - previous.x, p.y - previous.y)
    samples.push({ progress, distance: total })
    previous = p
  }
  return samples.map((s) => ({ progress: s.progress, distance: s.distance / (total || 1) }))
}

function progressAtDistance(samples: DistanceSample[], distance: number) {
  let lo = 0
  let hi = samples.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (samples[mid].distance < distance) lo = mid
    else hi = mid
  }
  const a = samples[lo]
  const b = samples[hi]
  return a.progress + (b.progress - a.progress) * ((distance - a.distance) / (b.distance - a.distance || 1))
}

// Arrives already moving (the swoop), eases to a cruise, then slows to a stop for the landing
function speedAt(time: number) {
  if (time < 0.18) return 1.75 - 0.75 * smoothstep(time / 0.18)
  if (time < 0.78) return 1
  return 1 - smoothstep((time - 0.78) / 0.22) * 0.97
}

// speedAt added up over time, so it can be looked up instead of integrated every frame
const DISTANCE_OVER_TIME = (() => {
  const STEPS = 400
  const out = [0]
  let total = 0
  for (let i = 1; i <= STEPS; i++) {
    total += speedAt(i / STEPS) / STEPS
    out.push(total)
  }
  return out.map((d) => d / total)
})()

function distanceAtTime(time: number) {
  const position = time * (DISTANCE_OVER_TIME.length - 1)
  const i = Math.floor(position)
  if (i >= DISTANCE_OVER_TIME.length - 1) return 1
  return DISTANCE_OVER_TIME[i] + (DISTANCE_OVER_TIME[i + 1] - DISTANCE_OVER_TIME[i]) * (position - i)
}

export function Butterfly({ containerRef, route, obstacles, zIndex = DEFAULT_Z }: Props) {
  const butterflyRef = useRef<HTMLDivElement>(null)
  const { front, behind } = zIndex

  useEffect(() => {
    const container = containerRef.current
    const bf = butterflyRef.current
    if (!container || !bf) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let startTimer = 0
    let resizeTimer = 0
    let cancelled = false
    let flight: Flight | null = null
    let distances: DistanceSample[] = []
    let blockers: Box[] = []
    let traceBox: Box | null = null

    const rect = (el: Element): Box => {
      const r = el.getBoundingClientRect()
      const c = container.getBoundingClientRect()
      return { l: r.left - c.left, t: r.top - c.top, r: r.right - c.left, b: r.bottom - c.top, w: r.width, h: r.height }
    }
    const findAll = (selector: string) => [...container.querySelectorAll<HTMLElement>(selector)]

    const measure = () => {
      flight = route({
        width: container.clientWidth,
        height: container.clientHeight,
        offLeft: -container.getBoundingClientRect().left - 160,
        rect,
        find: (selector) => container.querySelector<HTMLElement>(selector),
        findAll
      })
      if (!flight) return
      distances = measureDistances(flight.points)
      blockers = obstacles ? findAll(obstacles).map(rect) : []
      traceBox = flight.trace ? rect(flight.trace.el) : null
    }

    const isOverObstacle = (x: number, y: number) => blockers.some((b) => x > b.l - 60 && x < b.r + 60 && y > b.t - 40 && y < b.b + 40)

    const place = (x: number, y: number, angle: number, depth: number) => {
      bf.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${depth * (flight?.scale ?? 1)})`
    }

    const setTrace = (fraction: number) => {
      const el = flight?.trace?.el
      if (!el) return
      el.style.setProperty('--trace', String(clamp01(fraction)))
      if (fraction >= 1) el.dataset.traced = 'true'
      else delete el.dataset.traced
    }

    const spark = (x: number, y: number, layer: Layer, tracing: boolean) => {
      const el = document.createElement('span')
      el.className = styles.spark
      el.style.zIndex = String(layer === 'behind' ? behind : front)
      el.style.setProperty('--x', `${x + (Math.random() - 0.5) * (tracing ? 14 : 30)}px`)
      el.style.setProperty('--y', `${y + (Math.random() - 0.5) * (tracing ? 10 : 16)}px`)
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * (tracing ? 8 : 24)}px`)
      el.style.setProperty('--dy', `${tracing ? 4 + Math.random() * 8 : 18 + Math.random() * 26}px`)
      el.style.setProperty('--life', tracing ? '1.8s' : '1.2s')
      el.style.setProperty('--color', SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0])
      el.addEventListener('animationend', () => el.remove())
      container.appendChild(el)
    }

    // a short glowing streak behind it while it draws, so the traced element reads as painted by the trail
    const streak = (x0: number, y0: number, x1: number, y1: number) => {
      const el = document.createElement('span')
      el.className = styles.streak
      el.style.zIndex = String(front)
      el.style.width = `${Math.hypot(x1 - x0, y1 - y0) + 2}px`
      el.style.transform = `translate(${x0}px, ${y0}px) rotate(${Math.atan2(y1 - y0, x1 - x0)}rad)`
      el.addEventListener('animationend', () => el.remove())
      container.appendChild(el)
    }

    const land = () => {
      if (!flight) return
      const end = flight.points[flight.points.length - 1]
      bf.classList.remove(styles.glide)
      bf.classList.add(styles.landed, styles.ready)
      bf.style.zIndex = String(front)
      place(end.x, end.y, REST_ANGLE, 1)
    }

    const fly = () => {
      measure()
      if (!flight) return
      setTrace(0)
      if (reduced) {
        setTrace(1)
        land()
        return
      }

      const startedAt = performance.now()
      let previous = pointOnPath(flight.points, 0)
      let heading = 100
      let layer: Layer = flight.points[0].layer ?? 'front'
      let lastX = previous.x
      let lastY = previous.y
      let lastSpark = 0
      let traced = 0
      bf.style.zIndex = String(layer === 'behind' ? behind : front)

      const step = (now: number) => {
        if (!flight) return
        const { points, duration, trace } = flight
        // the first frame can be stamped a moment before startedAt, so clamp at both ends
        const time = clamp01((now - startedAt) / duration)
        const p = pointOnPath(points, progressAtDistance(distances, distanceAtTime(time)))

        // the side it should be on, switched only while clear of the obstacles so it never pops through one
        const wanted = points[p.segment].layer ?? 'front'
        if (wanted !== layer && !isOverObstacle(p.x, p.y)) {
          layer = wanted
          bf.style.zIndex = String(layer === 'behind' ? behind : front)
        }

        const tracing = !!trace && p.segment >= trace.from && p.segment < trace.to
        const dx = p.x - previous.x
        const dy = p.y - previous.y
        const moved = Math.hypot(dx, dy)
        if (moved > 0.6) {
          // heading follows the direction of travel, turning gradually
          const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90
          heading = wrapDegrees(heading + wrapDegrees(target - heading) * 0.08)
        }

        // over the last stretch it eases toward a relaxed resting angle instead of snapping upright
        const settle = smoothstep(Math.max(0, (time - 0.82) / 0.18))
        const angle = heading + wrapDegrees(REST_ANGLE - heading) * settle

        // butterflies never fly a clean line: a slow sideways drift plus a hop on every wingbeat. Steadier while drawing.
        const liveliness = (1 - settle) * (tracing ? 0.35 : 1)
        const sideX = -dy / (moved || 1)
        const sideY = dx / (moved || 1)
        const wobble = (flight.scale ?? 1) < 1 ? 0.55 : 1
        const drift = (Math.sin(now / 420) * 9 + Math.sin(now / 173) * 4) * liveliness * wobble
        const hop = Math.abs(Math.sin(now / 75)) * -4 * liveliness * wobble
        const x = p.x + sideX * drift
        const y = p.y + sideY * drift + hop

        place(x, y, angle, layer === 'behind' ? 0.78 : 1)
        bf.classList.add(styles.ready)
        bf.style.setProperty('--flap', time > 0.86 ? '.22s' : tracing ? '.12s' : '.14s')
        // now and then it stops flapping and glides
        bf.classList.toggle(styles.glide, !tracing && liveliness > 0.6 && Math.sin(now / 900) > 0.82)

        if (trace && traceBox) {
          if (tracing) {
            // fills in behind it, never ahead of it
            traced = Math.max(traced, (p.x - 20 - traceBox.l) / traceBox.w)
            setTrace(traced)
            streak(lastX, lastY + 10, x, y + 10)
          } else if (p.segment >= trace.to && traced < 1) {
            traced = 1
            setTrace(1)
          }
        }

        if (now - lastSpark > (tracing ? 22 : 60) && time < 0.97) {
          lastSpark = now
          spark(x, y + (tracing ? 8 : 0), layer, tracing)
        }

        lastX = x
        lastY = y
        previous = p
        if (time < 1) frame = requestAnimationFrame(step)
        else land()
      }
      frame = requestAnimationFrame(step)
    }

    // A resize redraws the path in place: a flight keeps going and a landed butterfly moves to its new spot.
    // Height-only changes (a phone's toolbar) are ignored.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (!flight) return
        measure()
        if (bf.classList.contains(styles.landed)) land()
      }, 150)
    }
    window.addEventListener('resize', onResize)

    // Wait for fonts and the wing images so everything is in its final place before the route is drawn
    const images = [...bf.querySelectorAll('img')]
    Promise.all([document.fonts?.ready, ...images.map((img) => img.decode().catch(() => undefined))]).then(() => {
      if (!cancelled) startTimer = window.setTimeout(fly, 900)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      clearTimeout(startTimer)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      container.querySelectorAll(`.${styles.spark}, .${styles.streak}`).forEach((el) => el.remove())
    }
  }, [containerRef, route, obstacles, front, behind])

  return (
    <div ref={butterflyRef} className={styles.butterfly} aria-hidden="true">
      <div className={styles.shadow} />
      <div className={styles.pose}>
        <div className={styles.tilt}>
          {(['left', 'right'] as const).map((side) => (
            <div key={side} className={`${styles.wing} ${styles[side]}`} style={{ '--mask': `url(${WINGS[side]})` } as CSSProperties}>
              <Image src={WINGS[side]} alt="" fill sizes="240px" />
              <span className={styles.sheen} />
              <span className={styles.glint} />
            </div>
          ))}
          <Image className={styles.body} src={BODY} alt="" fill sizes="240px" />
        </div>
      </div>
    </div>
  )
}
