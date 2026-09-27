/** The placeholder for a missing photo. A label, like "No photos yet", shows under the mark when there's something to say */
export function PhotoFallback({ label }: { label?: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-surface-light dark:bg-surface-dark">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-3">
        <span className="font-quicksand font-black text-2xl text-primary-light/20 dark:text-primary-dark/20 select-none" aria-hidden="true">
          LP
        </span>
        {label && <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-light dark:text-muted-dark">{label}</span>}
      </div>
    </div>
  )
}
