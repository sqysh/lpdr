import { Pause, Play } from 'lucide-react'

export function CarouselPauseButton({ stopped, onToggle }: { stopped: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'}
      className="w-8 h-8 shrink-0 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      {stopped ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
    </button>
  )
}
