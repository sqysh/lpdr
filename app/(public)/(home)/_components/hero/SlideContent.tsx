import Link from 'next/link'

export function SlideContent({
  slide
}: {
  slide: { heading: string; subheading: string; primaryCta: { href: string; label: string } }
}) {
  return (
    <div className="flex flex-1 items-center py-8 sm:py-16 px-4 sm:px-0">
      <div className="w-full">
        <h1
          className="font-light tracking-tighter leading-none text-muted-light dark:text-on-dark font-quicksand m-0"
          style={{ fontSize: 'clamp(1.125rem, 5vw, 60px)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {slide.heading.split(' ').slice(0, 3).join(' ')}
        </h1>

        <h1
          className="font-bold tracking-tighter leading-none text-text-light dark:text-text-dark font-quicksand m-0 mb-4 sm:mb-6"
          style={{ fontSize: 'clamp(1.75rem, 9vw, 100px)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {slide.heading.split(' ').slice(3).join(' ')}
        </h1>

        <p
          className="mb-5 sm:mb-8 leading-relaxed text-muted-light dark:text-muted-dark font-nunito max-w-xl"
          style={{ fontSize: 'clamp(0.8125rem, 2vw, 1rem)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {slide.subheading}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={slide.primaryCta.href}
            className="inline-flex items-center justify-center px-5 sm:px-6 py-3 bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bg-light dark:focus-visible:ring-offset-bg-dark active:scale-95"
          >
            {slide.primaryCta.label}
          </Link>
        </div>
      </div>
    </div>
  )
}
