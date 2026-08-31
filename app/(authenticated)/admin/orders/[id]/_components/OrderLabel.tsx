export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">{children}</p>
  )
}
