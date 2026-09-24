import { DevAgreementStep, devSetAgreementStep } from 'lib/actions/user/adoption-agreement/devSetAgreementStep'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const DEV_STEPS: DevAgreementStep[] = ['details', 'terms', 'financial', 'payment', 'done']

export function DevStepBar({ agreementId, current }: { agreementId: string; current: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const go = (step: DevAgreementStep) =>
    startTransition(async () => {
      await devSetAgreementStep(agreementId, step)
      router.refresh()
    })

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8 p-2 border border-dashed border-amber-500/60">
      <span className="text-[9px] font-mono tracking-eyebrow uppercase text-amber-600 dark:text-amber-400">Dev{isPending ? ' …' : ''}</span>
      {DEV_STEPS.map((step) => (
        <button
          key={step}
          type="button"
          disabled={isPending}
          onClick={() => go(step)}
          className={`px-2 py-1 text-[9px] font-mono tracking-eyebrow uppercase border ${
            step === current
              ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          {step}
        </button>
      ))}
      <button
        type="button"
        disabled={isPending}
        onClick={() => void signOut({ redirectTo: `/adopt/agreement/${agreementId}` })}
        className="ml-auto px-2 py-1 text-[9px] font-mono tracking-eyebrow uppercase border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
      >
        Sign out
      </button>
    </div>
  )
}
