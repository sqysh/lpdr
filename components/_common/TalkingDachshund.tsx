'use client'

import { useEffect, useRef, useState } from 'react'

type BubbleSide = 'top' | 'bottom' | 'left' | 'right'

type TalkingDachshundProps = {
  /** The message the dachshund "says", typed out one character at a time. */
  message?: string
  /** Which side of the mascot the speech bubble sits on. Default 'top'. */
  bubbleSide?: BubbleSide
  /** Rendered width of the mascot in px (height scales proportionally). Default 160. */
  size?: number
  /** ms per typed character. Default 45. */
  typeSpeed?: number
  /** Delay before typing starts, ms. Default 300. */
  startDelay?: number
  /** Loop the message (retype after a pause). Default false. */
  loop?: boolean
  /** Pause before re-typing when looping, ms. Default 2500. */
  loopDelay?: number
  /** Extra classes on the outer wrapper. */
  className?: string
}

const ASPECT = 320 / 260 // svg viewBox height / width

export function TalkingDachshund({
  message = '',
  bubbleSide = 'top',
  size = 160,
  typeSpeed = 45,
  startDelay = 300,
  loop = false,
  loopDelay = 2500,
  className = ''
}: TalkingDachshundProps) {
  const [typed, setTyped] = useState('')
  const isTalking = typed.length > 0 && typed.length < message.length

  // refs for imperative SVG animation (mouth openness, blink) without re-renders
  const mouthOpenRef = useRef<SVGEllipseElement>(null)
  const tongueRef = useRef<SVGEllipseElement>(null)
  const mouthLineRef = useRef<SVGPathElement>(null)
  const lidLRef = useRef<SVGEllipseElement>(null)
  const lidRRef = useRef<SVGEllipseElement>(null)
  const earLRef = useRef<SVGPathElement>(null)
  const earRRef = useRef<SVGPathElement>(null)

  const talkingRef = useRef(false)

  // Keep the ref in sync with talking state (outside render)
  useEffect(() => {
    talkingRef.current = isTalking
  }, [isTalking])

  // ── Typewriter ──
  useEffect(() => {
    if (!message) return
    let i = 0
    let typeTimer: ReturnType<typeof setTimeout>
    let loopTimer: ReturnType<typeof setTimeout>

    const tick = () => {
      i += 1
      setTyped(message.slice(0, i))
      if (i < message.length) {
        typeTimer = setTimeout(tick, typeSpeed)
      } else if (loop) {
        loopTimer = setTimeout(() => {
          i = 0
          setTyped('')
          typeTimer = setTimeout(tick, typeSpeed)
        }, loopDelay)
      }
    }

    const startTimer = setTimeout(tick, startDelay)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(typeTimer)
      clearTimeout(loopTimer)
    }
  }, [message, typeSpeed, startDelay, loop, loopDelay])

  // ── Mouth animation loop (driven by talking state) ──
  useEffect(() => {
    let raf: number
    let last = 0

    const setMouth = (openness: number) => {
      if (mouthOpenRef.current) mouthOpenRef.current.setAttribute('ry', (openness * 12).toFixed(1))
      if (tongueRef.current) tongueRef.current.setAttribute('ry', (openness * 6).toFixed(1))
      if (mouthLineRef.current) mouthLineRef.current.style.opacity = openness > 0.15 ? '0' : '1'
    }

    const frame = (t: number) => {
      if (talkingRef.current) {
        if (t - last > 110 + Math.random() * 90) {
          setMouth(Math.random() * 0.9 + 0.1)
          last = t
        }
      } else {
        setMouth(0)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ── Blink loop ──
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>
    let openTimer: ReturnType<typeof setTimeout>

    const blink = () => {
      lidLRef.current?.setAttribute('opacity', '1')
      lidRRef.current?.setAttribute('opacity', '1')
      openTimer = setTimeout(() => {
        lidLRef.current?.setAttribute('opacity', '0')
        lidRRef.current?.setAttribute('opacity', '0')
      }, 130)
      blinkTimer = setTimeout(blink, 2500 + Math.random() * 3500)
    }
    blinkTimer = setTimeout(blink, 1500)
    return () => {
      clearTimeout(blinkTimer)
      clearTimeout(openTimer)
    }
  }, [])

  const height = size * ASPECT

  // Bubble positioning relative to the mascot
  const isVertical = bubbleSide === 'top' || bubbleSide === 'bottom'
  const wrapperFlex: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection:
      bubbleSide === 'top'
        ? 'column'
        : bubbleSide === 'bottom'
          ? 'column-reverse'
          : bubbleSide === 'left'
            ? 'row'
            : 'row-reverse',
    alignItems: 'center',
    gap: 12
  }

  const showBubble = typed.length > 0

  // ── Ear flick loop (idle, always runs) ──
  useEffect(() => {
    let flickTimer: ReturnType<typeof setTimeout>
    let resetTimer: ReturnType<typeof setTimeout>

    const flick = () => {
      // Randomly flick one or both ears with a small rotation
      const both = Math.random() > 0.6
      const angle = 3 + Math.random() * 4 // 3–7deg

      if (both || Math.random() > 0.5) {
        earLRef.current?.style.setProperty('transform', `rotate(-${angle}deg)`)
      }
      if (both || Math.random() > 0.5) {
        earRRef.current?.style.setProperty('transform', `rotate(${angle}deg)`)
      }

      // Return to rest shortly after
      resetTimer = setTimeout(() => {
        earLRef.current?.style.setProperty('transform', 'rotate(0deg)')
        earRRef.current?.style.setProperty('transform', 'rotate(0deg)')
      }, 350)

      // Schedule next flick at a random idle interval
      flickTimer = setTimeout(flick, 2000 + Math.random() * 4000)
    }

    flickTimer = setTimeout(flick, 2000)
    return () => {
      clearTimeout(flickTimer)
      clearTimeout(resetTimer)
    }
  }, [])

  return (
    <div className={className} style={wrapperFlex}>
      {showBubble && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'relative',
            maxWidth: isVertical ? size * 1.6 : 220,
            background: 'var(--dachshund-bubble-bg, #1a1420)',
            color: 'var(--dachshund-bubble-fg, #e9dcf2)',
            border: '1px solid var(--dachshund-bubble-border, #3a2a48)',
            padding: '10px 14px',
            fontSize: 13,
            lineHeight: 1.4,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
          }}
        >
          {/* Reserve the FULL message's box — invisible, sets final width/height */}
          <span style={{ visibility: 'hidden' }} aria-hidden="true">
            {message}
          </span>

          {/* Typed text overlaid on the reserved space — fills in without resizing the box */}
          <span
            style={{
              position: 'absolute',
              inset: 0,
              padding: '10px 14px'
            }}
          >
            {typed}
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: 2,
                height: '1em',
                marginLeft: 2,
                verticalAlign: '-2px',
                background: 'currentColor',
                opacity: isTalking ? 1 : 0,
                animation: isTalking ? 'dachshund-caret 0.8s step-end infinite' : 'none'
              }}
            />
          </span>

          {/* bubble tail */}
          <BubbleTail side={bubbleSide} />
        </div>
      )}

      <svg
        width={size}
        height={height}
        viewBox="0 0 260 320"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Little Paws dachshund mascot"
      >
        <defs>
          <linearGradient id="dh-fur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a675bd" />
            <stop offset="100%" stopColor="#7c4f96" />
          </linearGradient>
          <linearGradient id="dh-ear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6f4589" />
            <stop offset="100%" stopColor="#4a2d5c" />
          </linearGradient>
          <linearGradient id="dh-snout" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b083c4" />
            <stop offset="100%" stopColor="#9a6bb0" />
          </linearGradient>
        </defs>

        <g>
          <path
            ref={earLRef}
            d="M92 66 C 54 58, 26 92, 26 150 C 26 200, 44 236, 70 238 C 88 239, 96 210, 92 168 C 89 132, 84 96, 92 66 Z"
            fill="url(#dh-ear)"
            style={{ transformOrigin: '85px 70px', transition: 'transform 0.4s ease-in-out' }}
          />
          <path
            ref={earRRef}
            d="M168 66 C 206 58, 234 92, 234 150 C 234 200, 216 236, 190 238 C 172 239, 164 210, 168 168 C 171 132, 176 96, 168 66 Z"
            fill="url(#dh-ear)"
            style={{ transformOrigin: '175px 70px', transition: 'transform 0.4s ease-in-out' }}
          />

          <path
            d="M130 44 C 174 44, 196 78, 194 118 C 193 138, 186 156, 174 170 L 86 170 C 74 156, 67 138, 66 118 C 64 78, 86 44, 130 44 Z"
            fill="url(#dh-fur)"
          />

          <path
            d="M92 158 C 90 198, 96 234, 110 250 C 118 259, 142 259, 150 250 C 164 234, 170 198, 168 158 C 150 172, 110 172, 92 158 Z"
            fill="url(#dh-snout)"
          />

          <ellipse cx="100" cy="120" rx="16" ry="18" fill="#2a1836" />
          <circle cx="105" cy="114" r="5" fill="#fff" />
          <circle cx="97" cy="124" r="2.5" fill="#fff" opacity="0.7" />
          <ellipse cx="160" cy="120" rx="16" ry="18" fill="#2a1836" />
          <circle cx="165" cy="114" r="5" fill="#fff" />
          <circle cx="157" cy="124" r="2.5" fill="#fff" opacity="0.7" />
          <ellipse ref={lidLRef} cx="100" cy="120" rx="17" ry="19" fill="url(#dh-fur)" opacity="0" />
          <ellipse ref={lidRRef} cx="160" cy="120" rx="17" ry="19" fill="url(#dh-fur)" opacity="0" />

          <path d="M84 98 Q 100 90 116 96" fill="none" stroke="#5e3b73" strokeWidth="4" strokeLinecap="round" />
          <path d="M144 96 Q 160 90 176 98" fill="none" stroke="#5e3b73" strokeWidth="4" strokeLinecap="round" />

          <ellipse cx="130" cy="214" rx="20" ry="15" fill="#241332" />
          <ellipse cx="121" cy="209" rx="5.5" ry="4" fill="#8b6ba1" opacity="0.8" />

          <path
            ref={mouthLineRef}
            d="M130 229 L130 238 M112 238 Q 130 248, 148 238"
            fill="none"
            stroke="#3a2148"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse ref={mouthOpenRef} cx="130" cy="246" rx="13" ry="0" fill="#33203f" />
          <ellipse ref={tongueRef} cx="130" cy="250" rx="8" ry="0" fill="#cf9bc2" />
        </g>
      </svg>

      <style>{`
        @keyframes dachshund-caret {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── Speech bubble tail pointing toward the mascot ──
function BubbleTail({ side }: { side: BubbleSide }) {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0
  }
  const bg = 'var(--dachshund-bubble-bg, #1a1420)'

  const styles: Record<BubbleSide, React.CSSProperties> = {
    // tail points DOWN toward mascot below
    top: {
      ...base,
      bottom: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: `8px solid ${bg}`
    },
    // tail points UP toward mascot above
    bottom: {
      ...base,
      top: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderBottom: `8px solid ${bg}`
    },
    // tail points RIGHT toward mascot on the right
    left: {
      ...base,
      right: -8,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderLeft: `8px solid ${bg}`
    },
    // tail points LEFT toward mascot on the left
    right: {
      ...base,
      left: -8,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: `8px solid ${bg}`
    }
  }

  return <span aria-hidden="true" style={styles[side]} />
}
