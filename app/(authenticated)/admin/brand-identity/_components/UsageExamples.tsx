import type { ReactNode } from 'react'
import { LPDRLogo } from 'components/brand/LPDRLogo'

// Objects the logo lives on. They are drawings of the real thing, so their colors are fixed: a printed flyer stays white and a
// website header stays charcoal whichever theme the presentation is in. Placeholder text is just bars.

const bar = 'h-1.5 bg-border-light'

function Bars({ widths, className = '' }: { widths: string[]; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`} aria-hidden="true">
      {widths.map((w, i) => (
        <div key={i} className={bar} style={{ width: w }} />
      ))}
    </div>
  )
}

export function Example({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="space-y-3">
      {children}
      <figcaption className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">{caption}</figcaption>
    </figure>
  )
}

export function WebsiteHeader() {
  return (
    <div
      className="bg-bg-light border border-border-light shadow-xl shadow-black/10 text-text-light"
      role="img"
      aria-label="The horizontal logo in a website header"
    >
      <div className="flex items-center gap-1.5 px-3 h-6 bg-surface-light border-b border-border-light" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-border-light" />
        ))}
        <span className="ml-3 h-2.5 w-28 bg-bg-light" />
      </div>
      <div className="bg-navbar-light h-14 px-4 flex items-center justify-between gap-4" aria-hidden="true">
        <LPDRLogo variant="horizontal" background="dark" decorative className="block h-9 w-auto" />
        <div className="hidden sm:flex gap-3 font-mono text-[7px] tracking-eyebrow uppercase text-on-dark">
          <span>About</span>
          <span>Dachshunds</span>
          <span>Adopt</span>
        </div>
        <span className="bg-primary-light font-mono text-[7px] tracking-eyebrow uppercase text-white px-2.5 py-1.5">Donate</span>
      </div>
      <div className="p-4 grid grid-cols-[2fr_1fr] gap-4" aria-hidden="true">
        <Bars widths={['70%', '92%', '58%']} />
        <div className="bg-surface-light h-12" />
      </div>
    </div>
  )
}

export function EmailHeader() {
  return (
    <div
      className="bg-bg-light border border-border-light shadow-xl shadow-black/10"
      role="img"
      aria-label="The horizontal logo in an email header"
    >
      <div className="px-5 pt-5 pb-4 border-b border-border-light" aria-hidden="true">
        <LPDRLogo variant="horizontal" background="light" decorative className="block h-10 w-auto" />
      </div>
      <div className="p-5 space-y-4" aria-hidden="true">
        <div className="h-2.5 w-2/5 bg-text-light/80" />
        <Bars widths={['96%', '88%', '92%', '40%']} />
        <div className="h-6 w-24 bg-primary-light" />
      </div>
    </div>
  )
}

export function Flyer() {
  return (
    <div
      className="bg-bg-light border border-border-light shadow-xl shadow-black/15 aspect-[3/4] max-w-64 mx-auto w-full -rotate-1 p-6 flex flex-col"
      role="img"
      aria-label="The stacked logo on a printed flyer"
    >
      <LPDRLogo variant="stacked" background="light" decorative className="block w-4/5 h-auto mx-auto" />
      <div className="mt-auto space-y-5" aria-hidden="true">
        <Bars widths={['100%', '86%', '94%', '62%']} />
        <div className="bg-navbar-light h-8 flex items-center px-3">
          <div className="h-1.5 w-1/2 bg-on-dark" />
        </div>
      </div>
    </div>
  )
}

export function Signage() {
  return (
    <div className="w-full max-w-80 mx-auto" role="img" aria-label="The stacked logo on an outdoor sign">
      <div className="bg-navbar-light aspect-[3/2] flex items-center justify-center p-5 border-4 border-bg-light shadow-xl shadow-black/20 outline outline-1 outline-border-light">
        <LPDRLogo variant="stacked" background="dark" decorative className="block h-full w-auto" />
      </div>
      <div className="flex justify-around px-10" aria-hidden="true">
        <span className="w-2 h-8 bg-button-light" />
        <span className="w-2 h-8 bg-button-light" />
      </div>
      <div className="h-px bg-muted-light/50" aria-hidden="true" />
    </div>
  )
}

export function SocialProfile() {
  return (
    <div
      className="bg-bg-light border border-border-light shadow-xl shadow-black/10 text-text-light w-full max-w-72 mx-auto"
      role="img"
      aria-label="The standalone mascot as a social media profile picture"
    >
      <div className="h-20 bg-navbar-light" aria-hidden="true" />
      <div className="px-5 pb-5" aria-hidden="true">
        <div className="size-20 -mt-10 rounded-full bg-surface-light border-4 border-bg-light overflow-hidden flex items-center justify-center">
          <LPDRLogo variant="icon" background="light" decorative className="block w-full h-auto scale-125" />
        </div>
        <p className="mt-3 font-quicksand font-bold text-sm">Little Paws Dachshund Rescue</p>
        <p className="font-mono text-[9px] tracking-eyebrow text-muted-light">@littlepaws</p>
        <Bars className="mt-4" widths={['100%', '72%']} />
      </div>
    </div>
  )
}

export function Sticker() {
  return (
    <div
      className="bg-navbar-light aspect-[4/3] w-full max-w-72 mx-auto flex items-center justify-center shadow-xl shadow-black/20"
      role="img"
      aria-label="The standalone mascot as a die-cut sticker on a laptop"
    >
      <div className="bg-bg-light rounded-4xl p-3 w-2/5 rotate-6 shadow-lg shadow-black/40" aria-hidden="true">
        <LPDRLogo variant="icon" background="light" decorative className="block w-full h-auto" />
      </div>
    </div>
  )
}
