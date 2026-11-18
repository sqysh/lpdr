'use client'

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

// The four idle animations of the LPDR mascot. Each one drives a CSS custom property on the logo's root element, and the master
// artwork's own stylesheet turns the property into movement, so an instance only ever touches its own element:
//   --lpdr-blink    0 open, 1 closed       the eyelids
//   --lpdr-flutter  0 at rest, 1 beating   the butterfly's wings
//   --lpdr-ear      0 at rest, 1 flicked   the notched ear
//   --lpdr-gaze-x/y 0, 0 on the butterfly  both pupils

// One blink: the lids close fast, hold a beat, then open a little slower (ms)
const CLOSE = 80
const HOLD = 50
const OPEN = 140

// One flutter: a few gentle beats that swell and settle, so the wings start and end at rest (beats per second)
const BEAT_RATE = 4

// One ear twitch: a quick flick out, a small rebound past rest, then settle (ms)
const FLICK = 70
const REBOUND = 130
const SETTLE = 110

// Gaze: the pupils rest on the butterfly (0, 0), which is already the up-and-right limit of the eyes, so every glance goes
// left and/or down. x runs -1 (left) to 0, y runs 0 to 1 (down). Both eyes share one target, so they stay parallel.
const GLANCES: [number, number][] = [
  [-1, 0.3],
  [-0.4, 1],
  [-0.75, 0.75],
  [-0.55, 0]
]
const SACCADE = 60 // ms time constant going out: a quick flick of the eyes
const RETURN = 110 // coming back to the butterfly is a little softer

const ease = (t: number) => t * t * (3 - 2 * t)

function lidAt(t: number) {
  if (t < CLOSE) return ease(t / CLOSE)
  if (t < CLOSE + HOLD) return 1
  return 1 - ease(Math.min(1, (t - CLOSE - HOLD) / OPEN))
}

function earAt(t: number) {
  if (t < FLICK) return ease(t / FLICK)
  if (t < FLICK + REBOUND) return 1 - 1.2 * ease((t - FLICK) / REBOUND)
  return -0.2 * (1 - ease(Math.min(1, (t - FLICK - REBOUND) / SETTLE)))
}

const REDUCED = '(prefers-reduced-motion: reduce)'
const reducedMotion = () => window.matchMedia(REDUCED).matches

const subscribeReduced = (notify: () => void) => {
  const query = window.matchMedia(REDUCED)
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

export type LogoAnimationHandle = {
  blink: () => void
  flutter: () => void
  twitchEar: () => void
  lookAround: () => void
}

// Everything an instance animates lives in this closure, so two logos on a page never share state. The element is attached once
// the logo has mounted.
function createEngine() {
  let target: Element | null = null
  const element = () => target
  const attach = (el: Element | null) => {
    target = el
  }
  let blinkFrame = 0
  let flutterFrame = 0
  let earFrame = 0
  let gazeFrame = 0
  let gazeNow = { x: 0, y: 0 }
  let glanceTimers: ReturnType<typeof setTimeout>[] = []
  let idleTimers = new Set<ReturnType<typeof setTimeout>>()

  const set = (name: string, value: number) => (element() as HTMLElement | null)?.style.setProperty(name, String(value))

  const blink = () => {
    cancelAnimationFrame(blinkFrame)
    const start = performance.now()
    const step = (now: number) => {
      const t = now - start
      set('--lpdr-blink', t >= CLOSE + HOLD + OPEN ? 0 : lidAt(t))
      if (t < CLOSE + HOLD + OPEN) blinkFrame = requestAnimationFrame(step)
    }
    blinkFrame = requestAnimationFrame(step)
  }

  const flutter = (beats = 3 + Math.floor(Math.random() * 4), strength = 0.8 + Math.random() * 0.2) => {
    cancelAnimationFrame(flutterFrame)
    const start = performance.now()
    const duration = (beats / BEAT_RATE) * 1000
    const step = (now: number) => {
      const u = (now - start) / duration
      const done = u >= 1
      const envelope = Math.sin(Math.PI * Math.min(u, 1))
      const beat = 0.5 - 0.5 * Math.cos(2 * Math.PI * beats * u)
      set('--lpdr-flutter', done ? 0 : strength * envelope * beat)
      if (!done) flutterFrame = requestAnimationFrame(step)
    }
    flutterFrame = requestAnimationFrame(step)
  }

  const twitchEar = (strength = 1) => {
    cancelAnimationFrame(earFrame)
    const start = performance.now()
    const end = FLICK + REBOUND + SETTLE
    const step = (now: number) => {
      const t = now - start
      set('--lpdr-ear', t >= end ? 0 : strength * earAt(t))
      if (t < end) earFrame = requestAnimationFrame(step)
    }
    earFrame = requestAnimationFrame(step)
  }

  const setGaze = (x: number, y: number) => {
    gazeNow = { x, y }
    set('--lpdr-gaze-x', x)
    set('--lpdr-gaze-y', y)
  }

  // Ease the shared gaze toward a target with an exponential approach, so it starts fast and settles without a hard stop
  const aim = (tx: number, ty: number, tau: number) => {
    cancelAnimationFrame(gazeFrame)
    let last = performance.now()
    const step = (now: number) => {
      const k = 1 - Math.exp(-(now - last) / tau)
      last = now
      const nx = gazeNow.x + (tx - gazeNow.x) * k
      const ny = gazeNow.y + (ty - gazeNow.y) * k
      const arrived = Math.abs(tx - nx) < 0.003 && Math.abs(ty - ny) < 0.003
      setGaze(arrived ? tx : nx, arrived ? ty : ny)
      if (!arrived) gazeFrame = requestAnimationFrame(step)
    }
    gazeFrame = requestAnimationFrame(step)
  }

  // A brief glance away and back to the butterfly, usually with a blink on the way back
  const lookAround = (strength = 1) => {
    glanceTimers.forEach(clearTimeout)
    glanceTimers = []
    const [gx, gy] = GLANCES[Math.floor(Math.random() * GLANCES.length)]
    const hold = 550 + Math.random() * 450
    const later = (fn: () => void, ms: number) => glanceTimers.push(setTimeout(fn, ms))
    if (reducedMotion()) {
      // no movement between positions: the eyes simply hold the glance, then rest again
      cancelAnimationFrame(gazeFrame)
      setGaze(gx * strength, gy * strength)
      later(() => setGaze(0, 0), 700)
      return
    }
    aim(gx * strength, gy * strength, SACCADE)
    later(() => {
      aim(0, 0, RETURN)
      if (Math.random() < 0.6) later(blink, 90)
    }, hold)
  }

  // Idle: a blink every few seconds (occasionally a quick double), the butterfly alternating between rest and a flutter, the
  // ear now and then, and a glance away and back. Returns the function that stops it.
  const startIdle = () => {
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        idleTimers.delete(id)
        // a hidden tab keeps its timers, but there is nothing to see: check again in a second
        if (document.hidden) later(fn, 1000)
        else fn()
      }, ms)
      idleTimers.add(id)
    }
    const nextBlink = () =>
      later(
        () => {
          blink()
          if (Math.random() < 0.15) later(blink, 260)
          nextBlink()
        },
        2500 + Math.random() * 3500
      )
    const nextFlutter = () =>
      later(
        () => {
          flutter()
          nextFlutter()
        },
        3500 + Math.random() * 4500
      )
    // the ear is the rarest: every ten seconds or so, sometimes a second flick right after
    const nextTwitch = () =>
      later(
        () => {
          twitchEar(0.7 + Math.random() * 0.3)
          if (Math.random() < 0.25) later(() => twitchEar(0.6), 320)
          nextTwitch()
        },
        7000 + Math.random() * 8000
      )
    const nextGlance = () =>
      later(
        () => {
          lookAround(0.6 + Math.random() * 0.4)
          nextGlance()
        },
        9000 + Math.random() * 9000
      )
    nextBlink()
    nextFlutter()
    nextTwitch()
    nextGlance()
    return () => {
      idleTimers.forEach(clearTimeout)
      idleTimers = new Set()
    }
  }

  // Cancel everything in flight and put the face back at rest
  const stop = () => {
    idleTimers.forEach(clearTimeout)
    idleTimers = new Set()
    glanceTimers.forEach(clearTimeout)
    glanceTimers = []
    ;[blinkFrame, flutterFrame, earFrame, gazeFrame].forEach(cancelAnimationFrame)
    gazeNow = { x: 0, y: 0 }
    const el = element() as HTMLElement | null
    ;['--lpdr-blink', '--lpdr-flutter', '--lpdr-ear', '--lpdr-gaze-x', '--lpdr-gaze-y'].forEach((name) => el?.style.removeProperty(name))
  }

  return { attach, blink, flutter, twitchEar, lookAround, startIdle, stop }
}

function useVisible(el: Element | null) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [el])
  return visible
}

const NOOP_HANDLE: LogoAnimationHandle = { blink() {}, flutter() {}, twitchEar() {}, lookAround() {} }

// Animates the logo whose root element is given to `attach` (pass it as the element's ref). While `enabled` it idles on its own
// (and only while on screen, and not at all under reduced motion). The returned handle plays each animation on request; under
// reduced motion those are single soft moves, because the visitor asked for them. Every frame, timer and property is cleaned
// up on unmount.
export function useLogoAnimation(enabled: boolean) {
  const reduced = useSyncExternalStore(subscribeReduced, reducedMotion, () => false)
  const [element, setElement] = useState<Element | null>(null)
  const visible = useVisible(element)
  const [engine] = useState(createEngine)

  const attach = useCallback(
    (el: Element | null) => {
      engine.attach(el)
      setElement(el)
    },
    [engine]
  )

  useEffect(() => () => engine.stop(), [engine])
  useEffect(() => {
    if (!enabled) return
    return () => engine.stop()
  }, [enabled, engine])

  useEffect(() => {
    if (!enabled || reduced || !visible) return
    return engine.startIdle()
  }, [enabled, reduced, visible, engine])

  const handle = useMemo<LogoAnimationHandle>(
    () =>
      enabled
        ? {
            blink: engine.blink,
            flutter: () => (reducedMotion() ? engine.flutter(1, 0.4) : engine.flutter()),
            twitchEar: () => engine.twitchEar(reducedMotion() ? 0.4 : 1),
            lookAround: () => engine.lookAround(reducedMotion() ? 0.4 : 1)
          }
        : NOOP_HANDLE,
    [enabled, engine]
  )

  return { attach, handle }
}
