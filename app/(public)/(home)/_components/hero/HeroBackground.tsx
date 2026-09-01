export function HeroBackground() {
  return (
    <div className="absolute inset-0 h-full" aria-hidden="true">
      <video
        src="/videos/landing-2.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-linear-to-r from-bg-light/90 dark:from-bg-dark/90 via-bg-light/40 dark:via-bg-dark/40 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-bg-light/70 dark:from-bg-dark/70 via-transparent to-transparent" />
    </div>
  )
}
