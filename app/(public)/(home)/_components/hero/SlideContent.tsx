import { LinkSpinner } from 'components/_common/LinkSpinner'
import Link from 'next/link'

type Props = {
  slide: { heading: string; subheading: string; primaryCta: { href: string; label: string } }
  index: number
  total: number
}

export function SlideContent({ slide, index, total }: Props) {
  const words = slide.heading.split(' ')

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      className="flex flex-1 items-center py-8 sm:py-16 px-4 sm:px-0"
    >
      <div className="w-full">
        {/* One heading, styled as two lines, so it's announced as the single sentence it is */}
        <h1 className="font-quicksand tracking-tighter leading-none m-0 mb-4 sm:mb-6">
          <span className="block font-light text-muted-light dark:text-on-dark" style={{ fontSize: 'clamp(1.125rem, 5vw, 60px)' }}>
            {words.slice(0, 3).join(' ')}
          </span>{' '}
          <span className="block font-bold text-text-light dark:text-text-dark" style={{ fontSize: 'clamp(1.75rem, 9vw, 100px)' }}>
            {words.slice(3).join(' ')}
          </span>
        </h1>

        <p
          className="mb-5 sm:mb-8 leading-relaxed text-muted-light dark:text-muted-dark font-nunito max-w-xl"
          style={{ fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)' }}
        >
          {slide.subheading}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={slide.primaryCta.href}
            className="inline-flex min-h-11 w-auto min-w-25 items-center justify-center px-5 sm:px-6 py-3 bg-primary-light dark:bg-primary-dark text-white text-[11px] font-mono tracking-eyebrow uppercase hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bg-light dark:focus-visible:ring-offset-bg-dark motion-safe:active:scale-95"
          >
            <LinkSpinner label={slide.primaryCta.label} />
          </Link>
        </div>
      </div>
    </div>
  )
}
