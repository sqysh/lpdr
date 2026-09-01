interface CountUnitProps {
  value: number
  label: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CountUnit({ value, label, size = 'md', className = '' }: CountUnitProps) {
  return (
    <div className={`flex flex-col items-center ${size === 'lg' ? 'min-w-9' : ''} ${className}`}>
      <span
        className={`font-mono font-black text-text-light dark:text-text-dark leading-none tabular-nums ${
          size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-2xl'
        }`}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span
        className={`font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark ${
          size === 'sm' ? 'text-[8px] mt-0.5' : size === 'lg' ? 'text-[8px] mt-0.5' : 'text-[9px] mt-1'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
