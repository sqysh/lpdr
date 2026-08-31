import { STATUS_STYLES } from 'lib/constants/order.constants'

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 border text-[9px] font-mono tracking-[0.15em] uppercase ${
        STATUS_STYLES[status] ??
        'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
      }`}
    >
      {status}
    </span>
  )
}
