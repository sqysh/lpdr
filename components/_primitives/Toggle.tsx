type IToggle = {
  label: string
  description?: string
  checked: boolean
  onToggle: () => void
  id: string
}

export function Toggle({ label, description, checked, onToggle, id }: IToggle) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3.5 py-3 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      <div className="text-left">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark">{label}</p>
        {description && (
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">{description}</p>
        )}
      </div>
      <div
        aria-hidden="true"
        className={`relative shrink-0 w-10 h-5 ml-4 transition-colors duration-200 ${checked ? 'bg-primary-light dark:bg-primary-dark' : 'bg-border-light dark:bg-border-dark'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-200 ${checked ? 'translate-x-0.5' : '-translate-x-4.5'}`}
        />
      </div>
    </button>
  )
}
