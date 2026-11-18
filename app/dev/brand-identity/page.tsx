import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { loadBrandMaster } from 'lib/brand/master'
import { LPDRLogoDefs } from 'components/brand/LPDRLogoDefs'
import { LogoControls, MasterArtwork, PreviewLogo } from './_components/LogoControls'
import { HeaderCompare } from './_components/HeaderCompare'
import { OverlayCompare } from './_components/OverlayCompare'
import styles from './brand.module.css'

export const metadata: Metadata = {
  title: 'Brand identity: vector reproduction',
  robots: { index: false, follow: false }
}

const REFERENCE = '/dev/brand-identity/reference/lpdr-logo.png'
const REFERENCE_HORIZONTAL = '/dev/brand-identity/reference/lpdr-logo-horizontal.png'

const OVERLAY_REGIONS = [
  { label: 'Full', box: [0, 0, 1447, 1087] },
  { label: 'Face', box: [560, 150, 400, 260] },
  { label: 'Butterfly', box: [790, 50, 230, 230] },
  { label: 'Fur & ear', box: [230, 90, 420, 320] },
  { label: 'Paws', box: [470, 570, 520, 180] },
  { label: 'Wordmark', box: [100, 740, 1260, 300] }
] satisfies { label: string; box: [number, number, number, number] }[]

const SURFACES = [
  { token: 'bg-light', className: 'bg-bg-light', background: 'light' as const },
  { token: 'surface-light', className: 'bg-surface-light', background: 'light' as const },
  { token: 'bg-dark', className: 'bg-bg-dark', background: 'dark' as const },
  { token: 'surface-dark', className: 'bg-surface-dark', background: 'dark' as const },
  { token: 'navbar-light', className: 'bg-navbar-light', background: 'dark' as const },
  { token: 'navbar-dark', className: 'bg-navbar-dark', background: 'dark' as const }
]

const ICON_SIZES = [
  { px: 128, className: 'size-32' },
  { px: 64, className: 'size-16' },
  { px: 48, className: 'size-12' },
  { px: 32, className: 'size-8' }
]

const LAYERS = [
  { id: 'lpdr-ear-left, lpdr-ear-right', label: 'Ears', swatch: '#fdba74' },
  { id: 'lpdr-sclera-*', label: 'Whites of the eyes', swatch: '#7dd3fc' },
  { id: 'lpdr-pupil-* (iris + catchlight)', label: 'Pupils', swatch: 'var(--color-primary-light)' },
  { id: 'lpdr-eyelid-*', label: 'Eyelids (drawn on blink)', swatch: 'transparent' },
  { id: 'lpdr-nose', label: 'Nose', swatch: '#c4b5fd' },
  { id: 'lpdr-mouth', label: 'Mouth', swatch: 'var(--color-primary-dark)' },
  { id: 'lpdr-paw-left, lpdr-paw-right', label: 'Paws', swatch: '#86efac' },
  { id: 'lpdr-butterfly-wings', label: 'Butterfly wings', swatch: '#f9a8d4' },
  { id: 'lpdr-butterfly-body', label: 'Butterfly body', swatch: 'var(--color-secondary-dark)' },
  { id: 'lpdr-body, lpdr-ground-*', label: 'Head, body, ground', swatch: 'var(--color-muted-light)' }
]

function Section({ n, title, children, note }: { n: string; title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-border-light dark:border-border-dark pt-8">
      <header className="space-y-1">
        <p className="font-mono text-xs text-muted-light dark:text-muted-dark">{n}</p>
        <h2 className="text-xl font-semibold">{title}</h2>
        {note && <p className="text-sm text-muted-light dark:text-muted-dark max-w-prose">{note}</p>}
      </header>
      {children}
    </section>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] text-muted-light dark:text-muted-dark">{children}</p>
}

export default async function BrandIdentityPreview() {
  // The artwork isn't approved yet: this page only exists on a local dev server
  if (process.env.NODE_ENV === 'production') notFound()

  const master = await loadBrandMaster()
  const kb = Math.round(Buffer.byteLength(master.defs) / 1024)
  // The layer map needs its own copy to colour layers by id; ids become data-ids so they don't clash with the defs
  const layerMap = master.defs.slice(master.defs.indexOf('<g id="lpdr-logo"')).replace(/\sid="/g, ' data-id="')

  return (
    <main className="bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark min-h-screen">
      <LPDRLogoDefs />
      <LogoControls>
        <div className="max-w-334 mx-auto px-4 sm:px-6 py-12 space-y-12">
          <header className="space-y-2">
            <p className="font-mono text-xs text-muted-light dark:text-muted-dark">Local preview · not deployed · phase 1</p>
            <h1 className="text-3xl font-semibold">Little Paws: vector reproduction</h1>
            <p className="text-sm text-muted-light dark:text-muted-dark max-w-prose">
              Traced from <code>lpdr-logo.png</code> into one layered master, <code>brand/lpdr-master.svg</code> ({kb} KB). Every logo below
              is a <code>&lt;use&gt;</code> of that one file: nothing is redrawn per composition.
            </p>
          </header>

          <Section n="01 · 02" title="Original reference and reproduced SVG">
            <div className="grid md:grid-cols-2 gap-6">
              <figure className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={REFERENCE}
                  alt="Original reference artwork"
                  className="w-full h-auto border border-border-light dark:border-border-dark"
                />
                <Caption>01 · lpdr-logo.png (1447 × 1087 raster)</Caption>
              </figure>
              <figure className="space-y-2">
                <div className={`bg-white border border-border-light dark:border-border-dark ${styles.onLight}`}>
                  <MasterArtwork viewBox={master.viewBox} className="block w-full h-auto" title="Reproduced SVG" />
                </div>
                <Caption>02 · lpdr-master.svg (vector, same canvas)</Caption>
              </figure>
            </div>
          </Section>

          <Section n="03" title="Overlay comparison" note="Both on the same 1447 × 1087 canvas. Zoom into the details that matter most.">
            <OverlayCompare reference={REFERENCE} size={{ w: master.viewBox.w, h: master.viewBox.h }} regions={OVERLAY_REGIONS} />
          </Section>

          <Section
            n="04"
            title="Standalone character"
            note="The master character with the wordmark removed. To sit in a square, each tapered end of the ground line is pulled in to 63% of its length, the same proportion the horizontal reference uses. Paws, butterfly, fur and notched ear are untouched."
          >
            <div className="flex flex-wrap items-end gap-6">
              <figure className="space-y-2">
                <div className={`bg-bg-light border border-border-light ${styles.onLight}`}>
                  <PreviewLogo variant="icon" background="light" className="block size-72" title="Standalone character, light" />
                </div>
                <Caption>288px · bg-light</Caption>
              </figure>
              <figure className="space-y-2">
                <div className={`bg-bg-dark border border-border-dark ${styles.onDark}`}>
                  <PreviewLogo variant="icon" background="dark" className="block size-72" title="Standalone character, dark" />
                </div>
                <Caption>288px · bg-dark</Caption>
              </figure>
              {ICON_SIZES.map(({ px: s, className }) => (
                <figure key={s} className="space-y-2">
                  <div className="flex gap-2">
                    <div className={`bg-bg-light border border-border-light ${styles.onLight}`}>
                      <PreviewLogo variant="icon" background="light" className={`block ${className}`} title={`${s}px light`} />
                    </div>
                    <div className={`bg-bg-dark border border-border-dark ${styles.onDark}`}>
                      <PreviewLogo variant="icon" background="dark" className={`block ${className}`} title={`${s}px dark`} />
                    </div>
                  </div>
                  <Caption>{s}px</Caption>
                </figure>
              ))}
            </div>
          </Section>

          <Section
            n="05"
            title="Horizontal composition"
            note="Built from the same master character and wordmark, laid out to the horizontal reference: the same character height, word block width and spacing. The reference's own type is drawn slightly condensed; the master's type is kept."
          >
            <figure className="space-y-2">
              <div className={`bg-white border border-border-light dark:border-border-dark p-6 ${styles.onLight}`}>
                <PreviewLogo variant="horizontal" background="light" className="block w-full h-auto" title="Horizontal logo" />
              </div>
              <Caption>Master horizontal composition</Caption>
            </figure>
            <figure className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={REFERENCE_HORIZONTAL}
                alt="Horizontal composition reference"
                className="w-full h-auto border border-border-light dark:border-border-dark"
              />
              <Caption>Reference · lpdr-logo-horizontal.png (layout only)</Caption>
            </figure>
          </Section>

          <Section
            n="06"
            title="Light and dark backgrounds"
            note="Transparent everywhere. Dark ink on light backgrounds, light ink on dark ones. On dark, the eyes are not inverted: their whites and catchlights stay pale around a dark pupil, so the face reads the same. The butterfly keeps the homepage butterfly's six rainbow stops in every version."
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SURFACES.map((s) => (
                <figure key={s.token} className="space-y-2">
                  <div className={`${s.className} p-6 space-y-6`}>
                    <PreviewLogo
                      variant="stacked"
                      background={s.background}
                      className="block w-full h-auto"
                      title={`Stacked logo on ${s.token}`}
                    />
                    <PreviewLogo
                      variant="horizontal"
                      background={s.background}
                      className="block w-full h-auto"
                      title={`Horizontal logo on ${s.token}`}
                    />
                  </div>
                  <Caption>--color-{s.token}</Caption>
                </figure>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <figure className="space-y-2">
                <div className={`bg-bg-light p-6 border border-border-light ${styles.onLight} ${styles.mono}`}>
                  <PreviewLogo
                    variant="stacked"
                    background="light"
                    wingColor="transparent"
                    wingSheen="transparent"
                    className="block w-full h-auto max-w-md mx-auto"
                    title="Monochrome print, dark"
                  />
                </div>
                <Caption>Fully monochromatic (print) · dark</Caption>
              </figure>
              <figure className="space-y-2">
                <div className={`bg-bg-dark p-6 ${styles.onDark} ${styles.mono}`}>
                  <PreviewLogo
                    variant="stacked"
                    background="dark"
                    wingColor="transparent"
                    wingSheen="transparent"
                    className="block w-full h-auto max-w-md mx-auto"
                    title="Monochrome print, light"
                  />
                </div>
                <Caption>Fully monochromatic (print) · light</Caption>
              </figure>
            </div>
          </Section>

          <Section
            n="06 · header"
            title="Header"
            note="The approved desktop header (110px navigation, paws-on-the-edge mascot) and mobile header (80px navigation, horizontal logo), with the simplified navigation rebuilt from the live configuration so every destination is kept. Narrow the window to see the hamburger take over. The theme toggle flips the whole page. The live header is untouched."
          >
            <HeaderCompare />
          </Section>

          <Section
            n="Layers"
            title="Layer map"
            note="The animation-ready layers inside the master, each addressable by id. Eyelids are hidden until a blink."
          >
            <div className="grid md:grid-cols-[2fr_1fr] gap-6 items-start">
              <div className="bg-white border border-border-light dark:border-border-dark">
                <svg
                  viewBox={`0 0 ${master.viewBox.w} ${master.viewBox.h}`}
                  className={`block w-full h-auto ${styles.layers}`}
                  role="img"
                  aria-label="Layer map"
                >
                  <g dangerouslySetInnerHTML={{ __html: layerMap }} />
                </svg>
              </div>
              <ul className="space-y-2 text-sm">
                {LAYERS.map((l) => (
                  <li key={l.id} className="flex items-start gap-3">
                    <span
                      className="mt-1 size-3 shrink-0 border border-border-light dark:border-border-dark"
                      style={{ background: l.swatch }}
                    />
                    <span>
                      {l.label}
                      <br />
                      <code className="text-[11px] text-muted-light dark:text-muted-dark">#{l.id}</code>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>
      </LogoControls>
    </main>
  )
}
