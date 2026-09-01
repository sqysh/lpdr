export const fieldLabel =
  'block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1.5'

export const fieldBase =
  'w-full px-3 py-2 text-sm font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark'

export const fieldInput = `${fieldBase} placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50`

export const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

export const buttonBase = `flex-1 px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`

export const buttonPrimary = `${buttonBase} bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark`

export const buttonSecondary = `${buttonBase} border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark`
