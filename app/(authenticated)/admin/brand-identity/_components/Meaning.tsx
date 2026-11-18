'use client'

import { LogoStage, StageLogo, useLogoStage, type LogoAction } from 'components/brand/LogoStage'

type Detail = { n: string; title: string; body: string; action: LogoAction | null }

const DETAILS: Detail[] = [
  {
    n: '01',
    title: 'Scruffy fur',
    body: 'The coat is drawn with uneven tufts and a cowlick instead of a smooth outline. Rescue dogs arrive as they are, and the rough edges keep the logo friendly rather than polished.',
    action: 'blink'
  },
  {
    n: '02',
    title: 'A notched ear',
    body: 'One ear has a small notch. It represents a dog with a history before it came to the rescue, and it gives the mascot a distinctive feature.',
    action: 'ear'
  },
  {
    n: '03',
    title: 'A hopeful expression',
    body: 'The eyes look up at the butterfly and the mouth turns up slightly. The expression is friendly and hopeful, which suits a rescue that is finding homes for dogs.',
    action: 'look'
  },
  {
    n: '04',
    title: 'The butterfly',
    body: 'The butterfly refers to Rainbow Bridge, the section of the website where supporters create memorials for dogs they have lost. It rests on the nose of the mascot, and its wing colors can be customized.',
    action: 'flutter'
  }
]

// Hovering or focusing a detail plays the part of the mascot it describes
function List() {
  const stage = useLogoStage()!
  return (
    <ol className="divide-y divide-border-light dark:divide-border-dark border-y border-border-light dark:border-border-dark">
      {DETAILS.map((d) => (
        <li
          key={d.n}
          tabIndex={0}
          onMouseEnter={() => d.action && stage.play(d.action)}
          onFocus={() => d.action && stage.play(d.action)}
          className="grid grid-cols-[3rem_1fr] gap-x-4 py-8 focus:outline-none focus-visible:bg-surface-light dark:focus-visible:bg-surface-dark"
        >
          <span className="font-mono text-[11px] tracking-eyebrow text-primary-light dark:text-primary-dark pt-1.5">{d.n}</span>
          <div className="space-y-3">
            <h3 className="font-quicksand font-bold text-2xl sm:text-3xl tracking-tight">{d.title}</h3>
            <p className="text-base leading-relaxed text-muted-light dark:text-muted-dark max-w-xl">{d.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Meaning() {
  return (
    <LogoStage>
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-12 lg:gap-24 items-start">
        <div className="lg:sticky lg:top-24 bg-surface-light dark:bg-surface-dark p-8 sm:p-14">
          <StageLogo variant="icon" background="auto" title="The Little Paws mascot" className="block w-full h-auto" />
        </div>
        <List />
      </div>
    </LogoStage>
  )
}
