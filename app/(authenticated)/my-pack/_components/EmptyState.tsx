export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-xs font-mono text-muted-light dark:text-muted-dark">{message}</p>
    </div>
  )
}
