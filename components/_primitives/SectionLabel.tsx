interface SectionLabelProps {
  children: React.ReactNode
  muted?: boolean
  className?: string
}

export function SectionLabel({ children, muted = false, className = '' }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span
        className={`block w-6 h-px shrink-0 ${muted ? 'bg-border-light dark:bg-border-dark' : 'bg-primary-light dark:bg-primary-dark'}`}
        aria-hidden="true"
      />
      <p
        className={`text-[10px] font-mono tracking-[0.2em] uppercase ${muted ? 'text-muted-light dark:text-muted-dark' : 'text-primary-light dark:text-primary-dark'}`}
      >
        {children}
      </p>
    </div>
  )
}
