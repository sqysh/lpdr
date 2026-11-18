'use client'

import type { CSSProperties, ReactNode } from 'react'
import { LogoStage, StageLogo, useLogoStage } from 'components/brand/LogoStage'

// Preview-only controls. Every logo on this page is an independent <LPDRLogo animated />; the buttons here ask all of them to
// play an animation at once, and the toggle switches every butterfly between white and rainbow wings.

export { StageLogo as PreviewLogo }

// The whole master on its own canvas, for the comparison with the reference image. It follows the wing toggle like the logos do.
export function MasterArtwork({ viewBox, className, title }: { viewBox: { w: number; h: number }; className?: string; title: string }) {
  const stage = useLogoStage()
  const rainbow =
    stage?.wings === 'rainbow'
      ? ({ '--lpdr-wing': 'url(#lpdr-rainbow)', '--lpdr-wing-sheen': 'url(#lpdr-rainbow-glint)' } as CSSProperties)
      : undefined
  return (
    <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className={className} style={rainbow} role="img" aria-label={title}>
      <use href="#lpdr-logo" />
    </svg>
  )
}

const BUTTON = 'px-4 py-2 text-sm text-white bg-button-light dark:bg-button-dark cursor-pointer shadow-md'

function Bar() {
  const stage = useLogoStage()!
  return (
    <div className="fixed bottom-6 right-6 z-10 flex flex-wrap justify-end gap-2 max-w-[calc(100vw-3rem)]">
      <div className="flex" role="group" aria-label="Butterfly wings">
        {(['monochrome', 'rainbow'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => stage.setWings(value)}
            aria-pressed={stage.wings === value}
            className="px-4 py-2 text-sm cursor-pointer shadow-md bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark aria-pressed:bg-button-light aria-pressed:text-white dark:aria-pressed:bg-button-dark"
          >
            {value === 'rainbow' ? 'Rainbow' : 'Monochrome'}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => stage.play('blink')} className={BUTTON}>
        Blink
      </button>
      <button type="button" onClick={() => stage.play('flutter')} className={BUTTON}>
        Flutter
      </button>
      <button type="button" onClick={() => stage.play('ear')} className={BUTTON}>
        Ear Twitch
      </button>
      <button type="button" onClick={() => stage.play('look')} className={BUTTON}>
        Look Around
      </button>
    </div>
  )
}

export function LogoControls({ children }: { children: ReactNode }) {
  return (
    <LogoStage>
      {children}
      <Bar />
    </LogoStage>
  )
}
