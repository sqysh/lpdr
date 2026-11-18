'use client'

import { useState } from 'react'
import { LPDRLogo } from 'components/brand/LPDRLogo'

// Hex values because a color input needs them: the site's accent tokens (globals.css) and the six stops of the homepage butterfly
const SWATCHES = [
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Violet', hex: '#a78bfa' },
  { name: 'Teal', hex: '#0e7490' },
  { name: 'Pink', hex: '#f472b6' },
  { name: 'Peach', hex: '#fdba74' },
  { name: 'Butter', hex: '#fde68a' },
  { name: 'Mint', hex: '#86efac' },
  { name: 'Sky', hex: '#7dd3fc' }
]

const pill =
  'px-5 py-2.5 font-mono text-[10px] tracking-eyebrow uppercase border border-border-light dark:border-border-dark cursor-pointer transition-colors duration-300 aria-pressed:bg-text-light aria-pressed:text-bg-light dark:aria-pressed:bg-text-dark dark:aria-pressed:text-bg-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

export function WingLab() {
  const [dark, setDark] = useState(false)
  const [color, setColor] = useState('#f472b6')
  const background = dark ? 'dark' : 'light'

  const cards = [
    {
      label: 'Monochrome',
      note: 'Default. White wings, as in the original drawing.',
      logo: (
        <LPDRLogo variant="icon" background={background} animated className="block w-full h-auto" title="Mascot with monochrome wings" />
      )
    },
    {
      label: 'Rainbow',
      note: 'The six colors used by the homepage butterfly.',
      logo: (
        <LPDRLogo
          variant="icon"
          background={background}
          animated
          wings="rainbow"
          className="block w-full h-auto"
          title="Mascot with rainbow wings"
        />
      )
    },
    {
      label: 'Custom color',
      note: 'Any single color, chosen with the swatches or the color picker above.',
      logo: (
        <LPDRLogo
          variant="icon"
          background={background}
          animated
          wingColor={color}
          wingSheen="transparent"
          className="block w-full h-auto"
          title="Mascot with custom wings"
        />
      )
    }
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex gap-px" role="group" aria-label="Background">
          <button type="button" onClick={() => setDark(false)} aria-pressed={!dark} className={pill}>
            On light
          </button>
          <button type="button" onClick={() => setDark(true)} aria-pressed={dark} className={pill}>
            On dark
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Wing color">
          {SWATCHES.map((s) => (
            <button
              key={s.hex}
              type="button"
              onClick={() => setColor(s.hex)}
              aria-label={s.name}
              aria-pressed={color === s.hex}
              style={{ backgroundColor: s.hex }}
              className="size-7 border border-border-light dark:border-border-dark cursor-pointer aria-pressed:ring-2 aria-pressed:ring-offset-2 aria-pressed:ring-text-light dark:aria-pressed:ring-text-dark ring-offset-bg-light dark:ring-offset-bg-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            />
          ))}
          <label className="flex items-center gap-2 pl-2 font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
            Custom
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-7 p-0 border-0 bg-transparent cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
        {cards.map((c) => (
          <figure key={c.label} className={`${dark ? 'bg-bg-dark' : 'bg-bg-light'} p-8 sm:p-10 space-y-6`}>
            {c.logo}
            <figcaption className="space-y-1">
              <p className={`font-quicksand font-bold text-xl ${dark ? 'text-text-dark' : 'text-text-light'}`}>{c.label}</p>
              <p className={`text-sm leading-relaxed ${dark ? 'text-on-dark' : 'text-muted-light'}`}>{c.note}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
