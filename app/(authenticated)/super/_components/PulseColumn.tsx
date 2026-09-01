import { PulseStat } from 'lib/actions/super-user/getPulseStats'
import { PanelHeader } from './PanelHeader'

const signalColor: Record<string, string> = {
  green: 'text-green-500',
  yellow: 'text-amber-500',
  red: 'text-red-500',
  neutral: 'text-muted-light dark:text-muted-dark'
}
const signalBg: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  neutral: 'bg-muted-light dark:bg-muted-dark'
}

export function PulseColumn({ stats }: { stats: PulseStat[] }) {
  return (
    <div className="flex flex-col border-r border-border-light dark:border-border-dark w-44 shrink-0">
      <PanelHeader label="Platform Pulse" />
      <div className="flex flex-col divide-y divide-border-light dark:divide-border-dark overflow-y-auto flex-1">
        {stats.map((s) => (
          <div key={s.label} className="px-3 py-2.5 relative">
            <div
              className={`absolute top-0 left-0 w-0.5 h-full ${signalBg[s.signal]}`}
              aria-hidden="true"
            />
            <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-light dark:text-muted-dark mb-1 pl-1">
              {s.label}
            </p>
            <p
              className={`font-quicksand font-black text-xl leading-none pl-1 ${signalColor[s.signal]}`}
            >
              {s.value}
            </p>
            <p className="font-mono text-[8px] text-muted-light dark:text-muted-dark mt-0.5 pl-1 leading-snug">
              {s.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
