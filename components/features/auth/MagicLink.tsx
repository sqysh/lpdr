import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Mail } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export function MagicLink({ email, setEmail, setSent, redirectTo }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMagicLink() {
    if (!email || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await signIn('email', { email, redirect: false, redirectTo })
      if (res?.error) throw new Error(res.error)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label
          htmlFor="email"
          className="block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1.5"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            aria-describedby={error ? 'email-error' : undefined}
            className="w-full pl-9 pr-3.5 py-3 text-xs font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 transition-colors duration-200 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark"
          />
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            id="email-error"
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 border-l-2 border-red-500 bg-red-50 dark:bg-red-500/5 px-3 py-2"
          >
            <AlertCircle size={12} className="text-red-500 shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-mono text-red-500 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleMagicLink}
        disabled={!email || loading}
        whileHover={email && !loading ? { y: -1 } : {}}
        whileTap={email && !loading ? { scale: 0.98 } : {}}
        className={`w-full py-3 text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 flex items-center justify-center gap-2 ${
          email && !loading
            ? 'bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white cursor-pointer'
            : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="block w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
              aria-hidden="true"
            />
            Sending...
          </>
        ) : (
          <>
            <ArrowRight size={12} aria-hidden="true" />
            Send Magic Link
          </>
        )}
      </motion.button>
    </div>
  )
}
