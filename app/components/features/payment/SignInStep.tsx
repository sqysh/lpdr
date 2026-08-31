import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUiSelector } from 'lib/store/store'
import { GoogleButton } from '../login/GoogleButton'
import { FacebookButton } from '../login/FacebookButton'
import { MagicLink } from '../login/MagicLink'
import { fadeUp } from 'lib/constants/motion.constants'

export function StepSignIn({ redirectTo, isDark }: { redirectTo: string; isDark?: boolean }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const { isDark: storeDark } = useUiSelector()
  const dark = isDark ?? storeDark

  const c = {
    heading: dark ? 'text-text-dark' : 'text-text-light',
    headingLight: dark ? 'text-muted-dark' : 'text-muted-light',
    muted: dark ? 'text-muted-dark' : 'text-muted-light',
    text: dark ? 'text-text-dark' : 'text-text-light',
    primary: dark ? 'text-primary-dark' : 'text-primary-light',
    sentBox: dark
      ? 'border-primary-dark/20 bg-surface-dark'
      : 'border-primary-light/20 bg-surface-light',
    googleBtn: dark
      ? 'border-border-dark bg-surface-dark text-text-dark hover:border-primary-dark'
      : 'border-border-light bg-surface-light text-text-light hover:border-primary-light',
    divider: dark ? 'bg-border-dark' : 'bg-border-light',
    ring: dark ? 'focus-visible:ring-primary-dark' : 'focus-visible:ring-primary-light',
    sendDisabled: dark
      ? 'bg-surface-dark text-muted-dark border-2 border-border-dark cursor-not-allowed'
      : 'bg-surface-light text-muted-light border-2 border-border-light cursor-not-allowed',
    sendEnabled: dark
      ? 'bg-primary-dark hover:bg-secondary-dark text-white cursor-pointer'
      : 'bg-primary-light hover:bg-secondary-light text-white cursor-pointer'
  }

  return (
    <motion.div
      key="step-signin"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={1}
      className="space-y-6"
    >
      <div>
        <h2 className={`font-quicksand text-2xl font-bold mb-1 ${c.heading}`}>
          Sign in to <span className={`font-light ${c.headingLight}`}>continue</span>
        </h2>
        <p className={`text-sm leading-relaxed ${c.muted}`}>
          Use any of the options below to continue.
        </p>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-4 border ${c.sentBox}`}
        >
          <p className={`text-[10px] font-mono tracking-[0.2em] uppercase mb-1 ${c.primary}`}>
            Check your inbox
          </p>
          <p className={`text-sm font-mono ${c.muted}`}>
            We sent a magic link to <span className={c.text}>{email}</span>. Click the link to sign
            in and return here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* Google */}
          <GoogleButton redirectTo={redirectTo} />
          {/* Facebook */}
          <FacebookButton redirectTo={redirectTo} />

          {/* Divider */}
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className={`flex-1 h-px ${c.divider}`} />
            <span className={`text-[10px] font-mono ${c.muted}`}>or</span>
            <div className={`flex-1 h-px ${c.divider}`} />
          </div>

          {/* Magic link */}
          <MagicLink email={email} redirectTo={redirectTo} setEmail={setEmail} setSent={setSent} />
        </div>
      )}
    </motion.div>
  )
}
