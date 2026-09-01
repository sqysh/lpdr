'use client'

export function MigrationGridEffect({ trigger }: { trigger: boolean }) {
  if (!trigger) return null

  const cols = 12
  const rows = 3
  const cells = Array.from({ length: cols * rows }, (_, i) => i)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {cells.map((i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const delay = (col * 0.03 + row * 0.05).toFixed(2)
          return (
            <span
              key={i}
              className="block m-px bg-primary-light dark:bg-primary-dark animate-[gridPop_0.6s_ease-out_forwards]"
              style={{ animationDelay: `${delay}s`, opacity: 0 }}
            />
          )
        })}
      </div>
    </div>
  )
}
