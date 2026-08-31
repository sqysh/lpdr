export function SectionHeader({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border-light dark:border-border-dark">
      <div className="w-1 h-3.5 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
        {title}
      </h2>
      {aside && <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark ml-auto">{aside}</span>}
    </div>
  )
}
