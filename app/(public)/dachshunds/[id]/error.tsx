'use client'

export default function DachshundError({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center bg-bg-light dark:bg-bg-dark"
    >
      <h1 className="font-quicksand font-bold text-2xl text-text-light dark:text-text-dark">We couldn&apos;t load this dachshund</h1>
      <p className="max-w-md text-sm text-muted-light dark:text-muted-dark">
        Our dog listings are having a hiccup. This usually clears up in a few seconds.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 border border-border-light dark:border-border-dark text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors"
      >
        Try again
      </button>
    </main>
  )
}
