import { AlertTriangle, CheckCircle, XCircle, Minus } from 'lucide-react'
import { PanelHeader } from './PanelHeader'
import { ServiceHealth } from 'lib/actions/super-user/getServiceHealth'

const healthIcon: Record<string, React.ReactNode> = {
  ok: <CheckCircle size={10} className="text-green-500 shrink-0" />,
  warn: <AlertTriangle size={10} className="text-amber-500 shrink-0" />,
  error: <XCircle size={10} className="text-red-500 shrink-0" />,
  unknown: <Minus size={10} className="text-muted-light dark:text-muted-dark shrink-0" />
}

export function ServiceStrip({ services }: { services: ServiceHealth[] }) {
  return (
    <div className="flex flex-col border-t border-border-light dark:border-border-dark shrink-0">
      <PanelHeader label="Service Health" />
      <div className="flex divide-x divide-border-light dark:divide-border-dark overflow-x-auto">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center gap-2 px-3 py-2 shrink-0">
            {healthIcon[svc.status]}
            <div>
              <p className="font-mono text-[9px] text-text-light dark:text-text-dark whitespace-nowrap">
                {svc.name}
              </p>
              <p className="font-mono text-[8px] text-muted-light dark:text-muted-dark whitespace-nowrap">
                {svc.latency && svc.latency !== '—' ? `${svc.latency} · ` : ''}
                {svc.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
