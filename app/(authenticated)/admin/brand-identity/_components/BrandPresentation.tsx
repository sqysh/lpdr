import type { ReactNode } from 'react'
import Picture from 'components/_common/Picture'
import { LPDRLogo } from 'components/brand/LPDRLogo'
import { LPDRLogoDefs } from 'components/brand/LPDRLogoDefs'
import { StageLogo } from 'components/brand/LogoStage'
import { DesktopHeaderPreview, MobileHeaderPreview } from 'components/brand/HeaderPreview'
import { PresentationShell } from './PresentationShell'
import { Reveal, Unveil } from './motion'
import { Meaning } from './Meaning'
import { Showcase } from './Showcase'
import { Example, EmailHeader, Flyer, Signage, Sticker, SocialProfile, WebsiteHeader } from './UsageExamples'
import { WingLab } from './WingLab'

const eyebrow = 'font-mono text-[10px] tracking-eyebrow uppercase text-primary-light dark:text-primary-dark'
const display = 'font-quicksand font-black tracking-tight leading-[0.95]'

function Chapter({
  n,
  title,
  lead,
  children,
  tone = 'plain'
}: {
  n: string
  title: string
  lead?: string
  children: ReactNode
  tone?: 'plain' | 'dark'
}) {
  return (
    <section className={tone === 'dark' ? 'bg-bg-dark text-text-dark' : undefined}>
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-28 sm:py-40 space-y-16 sm:space-y-24">
        <Reveal className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-x-24 gap-y-6 items-end">
          <div className="space-y-6">
            <p className={eyebrow}>{n}</p>
            <h2 className={`${display} text-[clamp(2.5rem,6vw,5rem)]`}>{title}</h2>
          </div>
          {lead && (
            <p className={`text-lg leading-relaxed max-w-lg ${tone === 'dark' ? 'text-on-dark' : 'text-muted-light dark:text-muted-dark'}`}>
              {lead}
            </p>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  )
}

// One arrangement: the logo itself on the left, in the site's theme, and where it is used on the right
function Variation({ name, use, logo, children }: { name: string; use: string; logo: ReactNode; children: ReactNode }) {
  return (
    <article className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] bg-bg-light dark:bg-bg-dark">
      <div className="p-8 sm:p-10 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-border-light dark:border-border-dark">
        <div className="flex-1 flex items-center justify-center">{logo}</div>
        <div className="space-y-1">
          <h3 className="font-quicksand font-bold text-xl">{name}</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">{use}</p>
        </div>
      </div>
      <div className="bg-surface-light dark:bg-surface-dark p-6 sm:p-10 grid sm:grid-cols-2 gap-8 items-center">{children}</div>
    </article>
  )
}

const SURFACES = [
  { name: 'Light', className: 'bg-bg-light', background: 'light' as const },
  { name: 'Light gray', className: 'bg-surface-light', background: 'light' as const },
  { name: 'Charcoal', className: 'bg-navbar-light', background: 'dark' as const },
  { name: 'Dark', className: 'bg-bg-dark', background: 'dark' as const }
]

export function BrandPresentation() {
  return (
    <>
      <LPDRLogoDefs />
      <PresentationShell>
        {/* Reveal */}
        <section className="relative min-h-screen bg-bg-dark text-text-dark flex flex-col items-center justify-center px-5 py-28 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,color-mix(in_srgb,var(--color-primary-dark)_24%,transparent),transparent_62%)]"
          />
          <Unveil className="relative w-full flex flex-col items-center gap-16">
            <StageLogo
              variant="stacked"
              background="dark"
              title="Little Paws Dachshund Rescue"
              className="h-[min(60vh,680px)] w-auto max-w-[88vw]"
            />
            <p className={`${eyebrow} text-on-dark!`}>Brand identity proposal</p>
          </Unveil>
          <a
            href="#idea"
            className="absolute bottom-10 font-mono text-[10px] tracking-eyebrow uppercase text-on-dark hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark"
          >
            Start
          </a>
        </section>

        {/* The idea */}
        <section id="idea" className="max-w-[1440px] mx-auto px-5 sm:px-8 py-36 sm:py-52">
          <Reveal className="space-y-14">
            <p className={eyebrow}>01</p>
            <h1 className={`${display} text-[clamp(3.5rem,11vw,10rem)]`}>
              Proposed
              <br />
              New Logo
            </h1>
            <p className="font-nunito italic font-light text-[clamp(1.5rem,3vw,2.5rem)] leading-snug max-w-3xl text-muted-light dark:text-muted-dark">
              A new mascot and wordmark, proposed to replace the current logo.
            </p>
          </Reveal>
        </section>

        {/* The character */}
        <div className="bg-surface-light/50 dark:bg-surface-dark/40">
          <Chapter
            n="02"
            title="Behind the Design"
            lead="The mascot is an illustrated dachshund. Four details were chosen on purpose, and each one connects to the rescue."
          >
            <Meaning />
          </Chapter>
        </div>

        {/* Variations */}
        <Chapter
          n="03"
          title="Logo Variations"
          lead="The same mascot is arranged three ways, each sized for a different kind of space. Next to each one are examples of where it is used."
        >
          <Reveal className="divide-y divide-border-light dark:divide-border-dark border border-border-light dark:border-border-dark">
            <Variation
              name="Horizontal"
              use="Mascot beside the name. For headers, email, and other wide, short spaces."
              logo={
                <LPDRLogo
                  variant="horizontal"
                  background="auto"
                  title="Little Paws Dachshund Rescue, horizontal"
                  className="block w-full max-w-md h-auto"
                />
              }
            >
              <Example caption="Website header">
                <WebsiteHeader />
              </Example>
              <Example caption="Email header">
                <EmailHeader />
              </Example>
            </Variation>
            <Variation
              name="Stacked"
              use="Mascot above the name. For print, signage, and other tall or square spaces."
              logo={
                <LPDRLogo
                  variant="stacked"
                  background="auto"
                  title="Little Paws Dachshund Rescue, stacked"
                  className="block w-full max-w-60 h-auto"
                />
              }
            >
              <Example caption="Printed flyer">
                <Flyer />
              </Example>
              <Example caption="Signage">
                <Signage />
              </Example>
            </Variation>
            <Variation
              name="Standalone"
              use="Mascot only. For profile pictures, stickers, and other small spaces."
              logo={<LPDRLogo variant="icon" background="auto" title="Little Paws mascot" className="block w-full max-w-48 h-auto" />}
            >
              <Example caption="Social media profile">
                <SocialProfile />
              </Example>
              <Example caption="Sticker">
                <Sticker />
              </Example>
            </Variation>
          </Reveal>
        </Chapter>

        {/* Motion */}
        <Chapter
          n="04"
          tone="dark"
          title="Animated Logo"
          lead="On screen, the mascot blinks, looks around, twitches its notched ear, and flutters the butterfly's wings. Each runs on its own timer. The buttons play each one on demand. Animation is turned off for visitors who have reduced motion enabled in their device settings."
        >
          <Reveal>
            <Showcase />
          </Reveal>
        </Chapter>

        {/* Header */}
        <Chapter
          n="05"
          title="Website Preview"
          lead="The desktop header is 110px tall. The mascot's paws rest on the bottom edge of the bar and the name is centered vertically. The mobile header is 80px tall and uses the horizontal logo, which scales down to fit narrow screens."
        >
          <Reveal className="space-y-16">
            <figure className="space-y-4">
              <div className="overflow-x-auto border border-border-light dark:border-border-dark shadow-2xl shadow-black/10">
                <div className="min-w-180">
                  <DesktopHeaderPreview />
                </div>
              </div>
              <figcaption className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                Desktop · 110px navigation
              </figcaption>
            </figure>
            <figure className="space-y-4">
              <MobileHeaderPreview>
                <StageLogo variant="horizontal" background="dark" className="w-auto" style={{ height: 64 }} />
              </MobileHeaderPreview>
              <figcaption className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                Mobile · 80px navigation
              </figcaption>
            </figure>
          </Reveal>
        </Chapter>

        {/* Backgrounds */}
        <Chapter
          n="06"
          title="Light and Dark Mode"
          lead="The logo works on light and dark backgrounds. The black coat and white markings stay the same. On dark backgrounds, a thin light outline keeps the coat visible and the wordmark switches to a light color."
        >
          <Reveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
            {SURFACES.map((s) => (
              <figure key={s.name} className={`${s.className} p-8 sm:p-10 space-y-8`}>
                <LPDRLogo
                  variant="stacked"
                  background={s.background}
                  title={`Little Paws Dachshund Rescue on ${s.name.toLowerCase()}`}
                  className="block w-full h-auto"
                />
                <figcaption
                  className={`font-mono text-[10px] tracking-eyebrow uppercase ${s.background === 'dark' ? 'text-on-dark' : 'text-muted-light'}`}
                >
                  {s.name}
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </Chapter>

        {/* Butterfly */}
        <Chapter
          n="07"
          title="Butterfly Customization"
          lead="The butterfly's wings are white by default, as in the original drawing. They can also use the rainbow colors of the homepage butterfly, or any single color, for example for a campaign or a season."
        >
          <Reveal>
            <WingLab />
          </Reveal>
        </Chapter>

        {/* Comparison */}
        <Chapter
          n="08"
          title="Current vs. Proposed Logo"
          lead="The current logo is a standing dachshund beside stacked lettering and a handwritten line. The proposed logo is built around one mascot, so it also comes as a horizontal layout and a standalone icon, and it adjusts to light and dark backgrounds."
        >
          <Reveal className="grid md:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
            <figure className="bg-navbar-light dark:bg-navbar-dark p-10 sm:p-16 flex flex-col justify-between gap-16 min-h-112">
              <div className="flex-1 flex items-center justify-center">
                <Picture
                  src="/images/logos/logo.png"
                  alt="The current Little Paws logo"
                  unoptimized
                  className="block h-52 w-auto"
                  sizes="320px"
                />
              </div>
              <figcaption className="space-y-1">
                <p className="font-mono text-[10px] tracking-eyebrow uppercase text-on-dark">Current</p>
                <p className="text-sm text-on-dark leading-relaxed">Standing dachshund beside stacked lettering and a handwritten line.</p>
              </figcaption>
            </figure>
            <figure className="bg-navbar-light dark:bg-navbar-dark p-10 sm:p-16 flex flex-col justify-between gap-16 min-h-112">
              <div className="flex-1 flex items-center justify-center">
                <StageLogo variant="stacked" background="dark" title="The proposed Little Paws logo" className="w-full max-w-sm h-auto" />
              </div>
              <figcaption className="space-y-1">
                <p className="font-mono text-[10px] tracking-eyebrow uppercase text-primary-dark">Proposed</p>
                <p className="text-sm text-on-dark leading-relaxed">Illustrated mascot above a rounded wordmark.</p>
              </figcaption>
            </figure>
          </Reveal>
        </Chapter>

        {/* Close */}
        <section className="bg-bg-dark text-text-dark">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-32 flex flex-col items-center gap-10 text-center">
            <StageLogo variant="icon" background="dark" title="Little Paws mascot" className="w-40 h-auto" />
            <p className={`${display} text-[clamp(2rem,5vw,3.5rem)]`}>Little Paws Dachshund Rescue</p>
            <a
              href="#idea"
              className="font-mono text-[10px] tracking-eyebrow uppercase text-on-dark hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark"
            >
              Back to top
            </a>
          </div>
        </section>
      </PresentationShell>
    </>
  )
}
