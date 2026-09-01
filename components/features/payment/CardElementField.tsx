import { CardElement } from '@stripe/react-stripe-js'
import { useThemeStore } from 'stores/theme.store'

type Props = {
  onChange: (state: { complete: boolean; error: string | null }) => void
}

export function CardElementField({ onChange }: Props) {
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <div>
      <label
        id="card-label"
        className="block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2"
      >
        Card Details
      </label>
      <div
        role="group"
        aria-labelledby="card-label"
        className="px-3.5 py-3.5 border-2 border-border-light dark:border-border-dark bg-white dark:bg-surface-dark transition-colors duration-200 focus-within:border-primary-light dark:focus-within:border-primary-dark"
      >
        <CardElement
          onChange={(e) => onChange({ complete: e.complete, error: e.error?.message ?? null })}
          options={{
            style: {
              base: {
                color: isDark ? '#f1f0ff' : '#09090b',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '::placeholder': { color: isDark ? '#4a4a6a' : '#a1a1aa' }
              },
              invalid: { color: '#ef4444' }
            }
          }}
        />
      </div>
    </div>
  )
}
