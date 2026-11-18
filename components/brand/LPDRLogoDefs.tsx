import { loadBrandMaster } from 'lib/brand/master'
import { LOGO_GEOMETRY } from './lpdr-logo.geometry'

// The master artwork, put on the page once for every <LPDRLogo /> to reference. Render it one time near the root of whatever
// page or layout holds logos; it draws nothing itself and is hidden from assistive technology.
export async function LPDRLogoDefs() {
  const master = await loadBrandMaster()

  if (process.env.NODE_ENV !== 'production') {
    const drift = (['logo', 'character', 'figure', 'ground', 'butterfly', 'wordmark'] as const).filter((name) =>
      (['x', 'y', 'w', 'h'] as const).some((k) => master[name][k] !== LOGO_GEOMETRY[name][k])
    )
    if (drift.length > 0) console.error(`brand/lpdr-master.svg no longer matches lpdr-logo.geometry.ts: ${drift.join(', ')}`)
  }

  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs dangerouslySetInnerHTML={{ __html: master.defs }} />
    </svg>
  )
}
