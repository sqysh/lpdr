import Link, { useLinkStatus } from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { Flight, FlightContext } from 'components/_common/butterfly/Butterfly'
import styles from './RainbowBridgePerch.module.css'

// The butterfly loops through the open sky, makes a low pass that draws this button in behind it,
// then rises, curls back and lands on its top edge
export function heroRoute({ width, height, rect, find }: FlightContext): Flight | null {
  const perch = find('[data-butterfly-perch]')
  if (!perch) return null
  const b = rect(perch)
  if (!b.w) return null

  const narrow = width < 968
  const middle = b.t + b.h / 2
  // keeps every point inside the hero
  const inside = (x: number) => Math.min(width - 36, x)
  const land = { x: b.r - (narrow ? 26 : 22), y: b.t - 10 }

  // the loop stays below the header, which sits over the top of the hero
  const wander = narrow
    ? [
        { x: -120, y: height * 0.62 },
        { x: width * 0.4, y: height * 0.5 },
        { x: width * 0.78, y: height * 0.32 },
        { x: width * 0.56, y: height * 0.24 },
        { x: width * 0.24, y: height * 0.34 },
        { x: 18, y: middle - 70 }, // swings out to the left edge, above the button
        { x: b.l - 30, y: middle - 6 } // and comes back in heading right, so it slides into the pass
      ]
    : [
        { x: -140, y: height * 0.8 },
        { x: width * 0.3, y: height * 0.64 },
        { x: width * 0.56, y: height * 0.38 },
        { x: width * 0.74, y: height * 0.26 },
        { x: width * 0.88, y: height * 0.4 },
        { x: width * 0.7, y: height * 0.52 },
        { x: width * 0.6, y: height * 0.4 },
        { x: b.l - 110, y: middle - 40 }
      ]
  const draw = [
    { x: b.l - 10, y: middle + 4 },
    { x: b.l + b.w * 0.5, y: middle + 8 },
    { x: inside(b.r + 20), y: middle }
  ]
  const perchOn = [
    { x: inside(b.r + (narrow ? 24 : 70)), y: b.t - (narrow ? 70 : 100) },
    { x: inside(land.x + 30), y: b.t - 120 },
    { x: land.x - 26, y: land.y - 60 },
    land
  ]

  return {
    points: [...wander, ...draw, ...perchOn],
    duration: narrow ? 7600 : 9400,
    scale: width < 640 ? 0.75 : 1,
    trace: { from: wander.length - 1, to: wander.length + draw.length - 1, el: perch }
  }
}

function PerchIcon() {
  const { pending } = useLinkStatus()
  const iconClass = 'w-3.5 h-3.5 text-violet-500 dark:text-violet-300'
  return pending ? (
    <Loader2 className={`${iconClass} animate-spin`} aria-hidden="true" />
  ) : (
    <ArrowRight className={`${iconClass} transition-transform group-hover:translate-x-0.5`} aria-hidden="true" />
  )
}

export function RainbowBridgePerch() {
  return (
    <Link
      href="/rainbow-bridge"
      data-butterfly-perch
      onFocus={(e) => e.currentTarget.style.setProperty('--trace', '1')}
      className={`${styles.perch} group [--rainbow:linear-gradient(90deg,#db2777,#ea580c,#ca8a04,#16a34a,#0284c7,#7c3aed,#db2777)] dark:[--rainbow:linear-gradient(90deg,#f9a8d4,#fdba74,#fde68a,#86efac,#7dd3fc,#c4b5fd,#f9a8d4)] inline-flex items-center gap-3 px-5 sm:px-6 py-3.5 text-[11px] font-mono tracking-eyebrow uppercase bg-bg-light/70 dark:bg-bg-dark/70 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bg-light dark:focus-visible:ring-offset-bg-dark`}
    >
      <span className={styles.label}>Visit the Rainbow Bridge</span>
      <PerchIcon />
    </Link>
  )
}
