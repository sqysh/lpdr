import { formatMoney } from 'lib/utils/currency.utils'

export function AdminDashboardWelcomeWienerSection({ data }) {
  const wieners = [...(data.welcomeWienerRevenue ?? [])].sort(
    (a, b) => b.totalRaised - a.totalRaised
  )
  const wienerTotal = wieners.reduce((s, w) => s + w.totalRaised, 0)
  const wienerMax = wieners[0]?.totalRaised ?? 0
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
          Welcome Wieners
        </p>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
          {formatMoney(wienerTotal)} raised
        </span>
      </div>
      <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark mb-4">
        Money raised per sponsored dog
      </p>
      {wieners.length === 0 ? (
        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
          No data yet
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {wieners.map((w) => {
            const pct = wienerMax ? Math.round((w.totalRaised / wienerMax) * 100) : 0
            return (
              <div key={w.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs text-text-light dark:text-text-dark truncate">
                    {w.name}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-muted-light dark:text-muted-dark tabular-nums shrink-0 ml-2">
                    {formatMoney(w.totalRaised)} &middot; {w.sponsorCount}{' '}
                    {w.sponsorCount === 1 ? 'sponsor' : 'sponsors'}
                  </span>
                </div>
                <div className="h-2 w-full bg-bg-light dark:bg-bg-dark overflow-hidden">
                  <div
                    className="h-2 bg-primary-light dark:bg-primary-dark"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
