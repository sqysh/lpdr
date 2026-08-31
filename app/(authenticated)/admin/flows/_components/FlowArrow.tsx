import { ChevronRight } from 'lucide-react'

export function FlowArrow() {
  return (
    <div className="hidden md:flex items-center justify-center shrink-0 px-1" aria-hidden="true">
      <ChevronRight className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
    </div>
  )
}
