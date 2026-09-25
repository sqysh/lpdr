import { Pause, Play } from 'lucide-react'

export function CarouselPauseButton({ stopped, onToggle }: { stopped: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'}
      className="w-11 h-11 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      {stopped ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
    </button>
  )
}
