import { formatMoney } from 'lib/utils/currency.utils'
import { sourceMeta } from 'lib/constants/dashboard.constants'

const COLORS = [
  {
    stroke: 'stroke-primary-light dark:stroke-primary-dark',
    bg: 'bg-primary-light dark:bg-primary-dark'
  },
  {
    stroke: 'stroke-secondary-light dark:stroke-secondary-dark',
    bg: 'bg-secondary-light dark:bg-secondary-dark'
  },
  { stroke: 'stroke-teal-500 dark:stroke-teal-400', bg: 'bg-teal-500 dark:bg-teal-400' },
  { stroke: 'stroke-purple-500 dark:stroke-purple-400', bg: 'bg-purple-500 dark:bg-purple-400' },
  { stroke: 'stroke-amber-500 dark:stroke-amber-400', bg: 'bg-amber-500 dark:bg-amber-400' }
]

type Segment = {
  type: string
  total: number
  dash: number
  gap: number
  rotation: number
  colors: (typeof COLORS)[number]
  pct: number
}

const fmtType = (type: string) =>
  sourceMeta[type]?.label ?? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')

export function RevenueBySourceChart({ sources }: { sources: { type: string; total: number }[] }) {
  const total = sources.reduce((sum, s) => sum + s.total, 0)
  if (total === 0) return null

  const size = 160
  const radius = 60
  const strokeWidth = 22
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  const segments = sources.reduce<Segment[]>((acc, s, i) => {
    const fraction = s.total / total
    const dash = fraction * circumference
    const priorOffset = acc.reduce((sum, seg) => sum + seg.dash, 0)

    acc.push({
      ...s,
      dash,
      gap: circumference - dash,
      rotation: (priorOffset / circumference) * 360,
      colors: COLORS[i % COLORS.length],
      pct: Math.round(fraction * 100)
    })

    return acc
  }, [])

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-4">
        Revenue By Source
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="shrink-0 mx-auto sm:mx-0"
          role="img"
          aria-label="Revenue by source breakdown"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-border-light dark:stroke-border-dark"
            style={{ fill: 'none' }}
          />
          {segments.map((seg) => (
            <circle
              key={seg.type}
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              transform={`rotate(${seg.rotation - 90} ${center} ${center})`}
              className={seg.colors.stroke}
              strokeLinecap="butt"
              style={{ fill: 'none' }}
            />
          ))}
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            className="fill-text-light dark:fill-text-dark font-quicksand font-black"
            style={{ fontSize: '15px' }}
          >
            {formatMoney(total)}
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            className="fill-muted-light dark:fill-muted-dark"
            style={{
              fontSize: '8px',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.1em'
            }}
          >
            TOTAL
          </text>
        </svg>

        <ul className="flex-1 min-w-0 space-y-2" role="list">
          {segments.map((seg) => (
            <li key={seg.type} className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 shrink-0 ${seg.colors.bg}`} aria-hidden="true" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-muted-light dark:text-muted-dark flex-1 min-w-0 truncate">
                {fmtType(seg.type)}
              </span>
              <span className="font-mono text-[10px] text-muted-light/70 dark:text-muted-dark/70 tabular-nums shrink-0">
                {seg.pct}%
              </span>
              <span className="font-quicksand font-black text-xs text-text-light dark:text-text-dark tabular-nums shrink-0 text-right">
                {formatMoney(seg.total)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
