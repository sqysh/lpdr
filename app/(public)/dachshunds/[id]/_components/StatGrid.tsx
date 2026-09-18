import { SectionHeading } from './SectionHeading'
import { StatPill } from 'components/_primitives/StatPill'
import { getStats } from 'lib/utils/animal.utils'

export function StatGrid({ a, className }: { a: any; className?: string }) {
  return (
    <div className={className}>
      <SectionHeading>At a Glance</SectionHeading>
      <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
        {getStats(a).map(({ label, value }) => (
          <StatPill key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  )
}
