export function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <dt className="text-sm text-muted-light dark:text-muted-dark">{label}</dt>
      <dd
        className={`text-sm tabular-nums ${accent ? 'text-primary-light dark:text-primary-dark' : 'text-text-light dark:text-text-dark'}`}
      >
        {value}
      </dd>
    </div>
  )
}
