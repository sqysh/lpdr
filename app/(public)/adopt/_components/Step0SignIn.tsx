import { slideVariants } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'
import { GoogleButton } from 'components/features/auth/GoogleButton'
import { FacebookButton } from 'components/features/auth/FacebookButton'
import { MagicLink } from 'components/features/auth/MagicLink'

export function Step0SignIn({ magicLinkSent, magicEmail, setMagicEmail, setMagicLinkSent }) {
  return (
    <motion.section
      key="sign-in"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      aria-labelledby="step-sign-in-heading"
      className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-7"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="block w-4 h-px bg-primary-light dark:bg-primary-dark shrink-0"
            aria-hidden="true"
          />
          <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            Step 1
          </p>
        </div>
        <h2
          id="step-sign-in-heading"
          className="font-quicksand text-xl font-bold text-text-light dark:text-text-dark mb-1.5"
        >
          Sign in to continue
        </h2>
        <p className="text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed">
          Verify your identity before starting your adoption application. It only takes a moment.
        </p>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <GoogleButton redirectTo="/adopt" />
        <FacebookButton redirectTo="/adopt" />
      </div>

      <div className="flex items-center gap-3 my-4" aria-hidden="true">
        <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
        <span className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
          or
        </span>
        <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
      </div>

      {!magicLinkSent ? (
        <MagicLink
          email={magicEmail}
          setEmail={setMagicEmail}
          setSent={setMagicLinkSent}
          redirectTo="/adopt"
        />
      ) : (
        <div className="border-l-2 border-primary-light dark:border-primary-dark pl-4">
          <p className="text-xs font-mono text-text-light dark:text-text-dark mb-1">
            Check your inbox
          </p>
          <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark mb-3">
            We sent a sign in link to <strong>{magicEmail}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              setMagicLinkSent(false)
              setMagicEmail('')
            }}
            className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none"
          >
            Use a different email
          </button>
        </div>
      )}
    </motion.section>
  )
}
