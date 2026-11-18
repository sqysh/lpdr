'use client'

import { useEffect, useImperativeHandle, type CSSProperties, type Ref } from 'react'
import { HORIZONTAL, HORIZONTAL_GAP, LOGO_GEOMETRY, SHORT_GROUND, type Box } from './lpdr-logo.geometry'
import { useLogoAnimation, type LogoAnimationHandle } from './useLogoAnimation'

// The Little Paws Dachshund Rescue logo. Every instance is a set of <use> references into the one master artwork that
// <LPDRLogoDefs /> puts on the page, so the artwork is in the HTML once however many logos there are, no instance declares an id,
// and each instance animates only its own root element.

export type LPDRLogoProps = {
  /** horizontal: mascot beside the wordmark. stacked: the full logo. icon: the mascot alone, in a square.
   *  header: the approved desktop header lockup, with the mascot's paws on the bottom edge of its box and the wordmark centred in it */
  variant?: 'horizontal' | 'stacked' | 'icon' | 'header'
  /** The surface the logo sits on: `light` gives dark artwork, `dark` keeps the dark coat with white markings and a light outline.
   *  `auto` follows the site's theme (the `dark` class on <html>) in CSS, so one mounted logo changes colour in the same frame as
   *  the page behind it, with no re-render and no restart of its animation */
  background?: 'light' | 'dark' | 'auto'
  /** Idle blinking, butterfly fluttering, ear twitching and pupil movement. Static by default. Not run under reduced motion */
  animated?: boolean
  /** The butterfly's wing panels: white (the original design) or the homepage rainbow */
  wings?: 'monochrome' | 'rainbow'
  /** Any CSS colour for the wing panels, in place of `wings` */
  wingColor?: string
  /** Any CSS paint for the wings' glint. Transparent unless the rainbow is on */
  wingSheen?: string
  /** Accessible name. Defaults to the organisation's name */
  title?: string
  /** Hide the logo from assistive technology, for when the name is already in adjacent text */
  decorative?: boolean
  /** header variant only: the mascot's height in px (the wordmark follows). Defaults to 100 */
  mascotHeight?: number
  /** Size it with this, e.g. `h-16 w-auto` or `w-48`. The logo never exceeds its container's width unless this sets a `max-w-*` */
  className?: string
  style?: CSSProperties
  /** Plays each animation on request: blink, flutter, twitchEar, lookAround. Does nothing unless `animated` */
  ref?: Ref<LogoAnimationHandle>
}

const G = LOGO_GEOMETRY

const viewBox = (b: Box) => `${b.x} ${b.y} ${b.w} ${b.h}`

// The colour roles of the master artwork (see the comment at the top of brand/lpdr-master.svg), from the site's own tokens.
// Light backgrounds need only the dark ink. On dark ones the coat stays dark, so the white markings are filled in, a light
// outline separates the fur from the background, and the wordmark takes the light foreground.
const BACKGROUND: Record<'light' | 'dark', CSSProperties> = {
  light: { color: 'var(--color-text-light)' },
  dark: {
    color: 'var(--color-text-light)',
    '--lpdr-paper': 'var(--color-text-dark)',
    '--lpdr-sclera': 'var(--color-text-dark)',
    '--lpdr-glint': 'var(--color-text-dark)',
    '--lpdr-type': 'var(--color-text-dark)',
    '--lpdr-outline': 'var(--color-text-dark)',
    '--lpdr-outline-width': 8
  } as CSSProperties
}

// `auto`: the same two treatments as above, chosen by the site's `dark` class rather than by a prop
const AUTO =
  'text-text-light dark:[--lpdr-paper:var(--color-text-dark)] dark:[--lpdr-sclera:var(--color-text-dark)] dark:[--lpdr-glint:var(--color-text-dark)] dark:[--lpdr-type:var(--color-text-dark)] dark:[--lpdr-outline:var(--color-text-dark)] dark:[--lpdr-outline-width:8]'

const RAINBOW = { '--lpdr-wing': 'url(#lpdr-rainbow)', '--lpdr-wing-sheen': 'url(#lpdr-rainbow-glint)' } as CSSProperties

function characterBox(groundScale: number): Box {
  const { figure, butterfly, ground, character, groundAnchors } = G
  const left = Math.min(figure.x, groundAnchors.left - (groundAnchors.left - ground.x) * groundScale)
  const right = Math.max(
    figure.x + figure.w,
    butterfly.x + butterfly.w,
    groundAnchors.right + (ground.x + ground.w - groundAnchors.right) * groundScale
  )
  return { x: left, y: character.y, w: right - left, h: character.h }
}

// The character, with each end of the ground line pulled in toward the body by groundScale
function Character({ groundScale = 1 }: { groundScale?: number }) {
  if (groundScale === 1) return <use href="#lpdr-character" />
  const squeeze = (x: number) => `translate(${x} 0) scale(${groundScale} 1) translate(${-x} 0)`
  const { left, right } = G.groundAnchors
  return (
    <>
      <use href="#lpdr-ground-outline-left" transform={squeeze(left)} />
      <use href="#lpdr-ground-outline-right" transform={squeeze(right)} />
      <use href="#lpdr-figure" />
      <use href="#lpdr-ground-left" transform={squeeze(left)} />
      <use href="#lpdr-ground-right" transform={squeeze(right)} />
      <use href="#lpdr-butterfly" />
    </>
  )
}

export function LPDRLogo({
  variant = 'horizontal',
  background = 'light',
  animated = false,
  wings = 'monochrome',
  wingColor,
  wingSheen,
  title = 'Little Paws Dachshund Rescue',
  decorative = false,
  mascotHeight = 100,
  className,
  style,
  ref
}: LPDRLogoProps) {
  const { attach, handle } = useLogoAnimation(animated)
  useImperativeHandle(ref, () => handle, [handle])

  // The artwork lives in <LPDRLogoDefs />; without it the logo would render blank, so say so while developing
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const copies = document.querySelectorAll('#lpdr-logo').length
    if (copies === 0) console.error('LPDRLogo: render <LPDRLogoDefs /> once on the page, or the logo has no artwork to draw.')
    if (copies > 1) console.error('LPDRLogo: <LPDRLogoDefs /> is on the page more than once, which duplicates the artwork ids.')
  }, [])

  const colours: CSSProperties = {
    ...(background === 'auto' ? null : BACKGROUND[background]),
    ...(wings === 'rainbow' ? RAINBOW : null),
    ...(wingColor ? ({ '--lpdr-wing': wingColor } as CSSProperties) : null),
    ...(wingSheen ? ({ '--lpdr-wing-sheen': wingSheen } as CSSProperties) : null)
  }
  // never wider than the container, unless the caller sets its own max-w-* class
  const capWidth = !/(^|\s)max-w-/.test(className ?? '')
  const themed = `${background === 'auto' ? AUTO : ''} ${className ?? ''}`.trim()
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img' as const, 'aria-label': title }

  if (variant === 'header') {
    // Two drawings in a row: the mascot sits on the bottom edge of the box and the wordmark is centred in it. Sized from the
    // horizontal composition's own proportions; the box should be as tall as the bar it sits in.
    const char = characterBox(SHORT_GROUND)
    const unit = mascotHeight / HORIZONTAL.characterHeight
    const wordScale = HORIZONTAL.wordmarkWidth / G.wordmark.w
    return (
      <div
        ref={attach}
        {...a11y}
        data-lpdr-logo={variant}
        className={`flex items-center self-stretch ${themed}`}
        style={{ gap: mascotHeight * HORIZONTAL_GAP, ...colours, ...style }}
      >
        <svg
          viewBox={viewBox(char)}
          width={char.w * (HORIZONTAL.characterHeight / char.h) * unit}
          height={mascotHeight}
          className="block self-end shrink-0"
          aria-hidden="true"
        >
          <Character groundScale={SHORT_GROUND} />
        </svg>
        <svg
          viewBox={viewBox(G.wordmark)}
          width={HORIZONTAL.wordmarkWidth * unit}
          height={G.wordmark.h * wordScale * unit}
          className="block shrink-0"
          aria-hidden="true"
        >
          <use href="#lpdr-wordmark" />
        </svg>
      </div>
    )
  }

  let box: Box
  let content: React.ReactNode
  if (variant === 'stacked') {
    box = G.logo
    content = <use href="#lpdr-logo" />
  } else if (variant === 'icon') {
    const char = characterBox(SHORT_GROUND)
    const side = Math.max(char.w, char.h) * 1.04
    box = { x: char.x + char.w / 2 - side / 2, y: char.y + char.h / 2 - side / 2, w: side, h: side }
    content = <Character groundScale={SHORT_GROUND} />
  } else {
    const h = HORIZONTAL
    const char = characterBox(SHORT_GROUND)
    const charScale = h.characterHeight / char.h
    const wordScale = h.wordmarkWidth / G.wordmark.w
    const wordLeft = h.characterLeft + char.w * charScale + h.characterHeight * HORIZONTAL_GAP
    const wordTop = h.wordmarkMiddle - (G.wordmark.h * wordScale) / 2
    box = { x: h.characterLeft, y: h.characterTop, w: wordLeft + h.wordmarkWidth - h.characterLeft, h: h.characterHeight }
    content = (
      <>
        <g transform={`translate(${h.characterLeft} ${h.characterTop}) scale(${charScale}) translate(${-char.x} ${-char.y})`}>
          <Character groundScale={SHORT_GROUND} />
        </g>
        <g transform={`translate(${wordLeft} ${wordTop}) scale(${wordScale}) translate(${-G.wordmark.x} ${-G.wordmark.y})`}>
          <use href="#lpdr-wordmark" />
        </g>
      </>
    )
  }

  return (
    <svg
      ref={attach}
      viewBox={viewBox(box)}
      {...a11y}
      data-lpdr-logo={variant}
      className={themed || undefined}
      style={{ verticalAlign: 'top', ...(capWidth ? { maxWidth: '100%' } : null), ...colours, ...style }}
    >
      {content}
    </svg>
  )
}
