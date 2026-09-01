export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
        aria-hidden="true"
      />
      <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
        {children}
      </h2>
    </div>
  )
}
