'use client'

import { LogoStage, StageLogo, useLogoStage, type LogoAction } from 'components/brand/LogoStage'

const ACTIONS: { label: string; action: LogoAction }[] = [
  { label: 'Blink', action: 'blink' },
  { label: 'Flutter', action: 'flutter' },
  { label: 'Ear Twitch', action: 'ear' },
  { label: 'Look Around', action: 'look' }
]

const control =
  'px-6 py-3 font-mono text-[10px] tracking-eyebrow uppercase border border-border-dark text-text-dark hover:bg-text-dark hover:text-bg-dark transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark'

function Controls() {
  const stage = useLogoStage()!
  return (
    <div className="flex flex-wrap justify-center gap-px" role="group" aria-label="Animation controls">
      {ACTIONS.map(({ label, action }) => (
        <button
          key={action}
          type="button"
          onClick={() => stage.play(action)}
          disabled={stage.paused}
          className={`${control} disabled:opacity-30 disabled:pointer-events-none`}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => stage.setPaused(!stage.paused)}
        aria-pressed={stage.paused}
        className={`${control} aria-pressed:bg-text-dark aria-pressed:text-bg-dark`}
      >
        {stage.paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  )
}

export function Showcase() {
  return (
    <LogoStage>
      <div className="flex flex-col items-center gap-14">
        <StageLogo variant="icon" background="dark" title="The Little Paws mascot" className="w-[min(78vw,480px)] h-auto" />
        <Controls />
      </div>
    </LogoStage>
  )
}
