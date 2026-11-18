'use client'

import { useState } from 'react'
import styles from '../brand.module.css'

type Region = { label: string; box: [number, number, number, number] }

type Props = {
  reference: string
  size: { w: number; h: number }
  regions: Region[]
}

type Mode = 'onion' | 'difference'

export function OverlayCompare({ reference, size, regions }: Props) {
  const [mode, setMode] = useState<Mode>('onion')
  const [opacity, setOpacity] = useState(0.6)
  const [region, setRegion] = useState(0)
  const box = regions[region].box

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-text-light dark:text-text-dark">
        <div className="flex gap-1" role="group" aria-label="Overlay mode">
          {(['onion', 'difference'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className="px-3 py-1.5 border border-border-light dark:border-border-dark aria-pressed:bg-button-light aria-pressed:text-white dark:aria-pressed:bg-button-dark cursor-pointer"
            >
              {m === 'onion' ? 'Onion skin' : 'Difference'}
            </button>
          ))}
        </div>
        {mode === 'onion' && (
          <label className="flex items-center gap-3">
            <span className="text-muted-light dark:text-muted-dark">Reference</span>
            <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            <span className="text-muted-light dark:text-muted-dark">SVG</span>
          </label>
        )}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Zoom">
          {regions.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRegion(i)}
              aria-pressed={region === i}
              className="px-3 py-1.5 border border-border-light dark:border-border-dark aria-pressed:bg-button-light aria-pressed:text-white dark:aria-pressed:bg-button-dark cursor-pointer"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-light dark:text-muted-dark max-w-prose">
        {mode === 'onion'
          ? 'The traced SVG, in the primary accent, laid over the reference. Slide to fade between them; any black showing past the accent edge is a miss.'
          : 'The SVG is subtracted from the reference: where they agree the result is white, and anything that differs shows up dark.'}
      </p>

      <svg
        viewBox={box.join(' ')}
        className={`${styles.overlay} w-full h-auto bg-white`}
        role="img"
        aria-label="Reference with the traced SVG overlaid"
      >
        <image href={reference} x={0} y={0} width={size.w} height={size.h} />
        {mode === 'onion' ? (
          <g className="text-primary-light" style={{ opacity }}>
            <use href="#lpdr-logo" />
          </g>
        ) : (
          <g className={styles.difference}>
            <use href="#lpdr-logo" />
          </g>
        )}
      </svg>
    </div>
  )
}
