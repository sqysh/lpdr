import { useState } from 'react'
import { motion } from 'framer-motion'
import { GoogleButton } from 'components/features/auth/GoogleButton'
import { FacebookButton } from 'components/features/auth/FacebookButton'
import { MagicLink } from 'components/features/auth/MagicLink'
import { fadeUp } from 'lib/constants/motion.constants'

export function StepSignIn({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <motion.div key="step-signin" variants={fadeUp} initial="hidden" animate="show" custom={1} className="space-y-6">
      <div>
        <h2 className="font-quicksand text-2xl font-bold mb-1 text-text-light dark:text-text-dark">
          Sign in to <span className="font-light text-muted-light dark:text-muted-dark">continue</span>
        </h2>
        <p className="text-sm leading-relaxed text-muted-light dark:text-muted-dark">Use any of the options below to continue.</p>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4 border border-primary-light/20 dark:border-primary-dark/20 bg-surface-light dark:bg-surface-dark"
        >
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-1 text-primary-light dark:text-primary-dark">
            Check your inbox
          </p>
          <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
            We sent a magic link to <span className="text-text-light dark:text-text-dark">{email}</span>. Click the link to sign
            in and return here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <GoogleButton redirectTo={redirectTo} />
          <FacebookButton redirectTo={redirectTo} />

          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
            <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">or</span>
            <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
          </div>

          <MagicLink email={email} redirectTo={redirectTo} setEmail={setEmail} setSent={setSent} />
        </div>
      )}
    </motion.div>
  )
}
