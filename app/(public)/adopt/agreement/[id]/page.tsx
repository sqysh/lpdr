import { auth } from 'lib/auth'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { getAdoptionAgreementForAdopter } from 'lib/actions/user/adoption-agreement/getAdoptionAgreementForAdopter'
import { AdoptionAgreementClient } from './AdoptionAgreementClient'
import { SwitchAccountButton } from './_components/SwitchAccountButton'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'

export const dynamic = 'force-dynamic'

export default async function AdoptionAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    return (
      <main id="main-content" className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <h1 className="font-quicksand font-bold text-3xl text-text-light dark:text-text-dark">Your adoption agreement</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark">Sign in with the email address the agreement was sent to.</p>
        <StepSignIn redirectTo={`/adopt/agreement/${id}`} />
      </main>
    )
  }

  const result = await getAdoptionAgreementForAdopter(id)

  // Same message whether it doesn't exist or belongs to someone else, so a link never confirms whose it is
  if (!result.success || !result.data) {
    return (
      <main id="main-content" className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <div className="space-y-4">
          <h1 className="font-quicksand font-bold text-3xl text-text-light dark:text-text-dark">Agreement not found</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            You&apos;re signed in as <strong className="text-text-light dark:text-text-dark">{session.user.email}</strong>. If your
            agreement was sent to a different email address, sign out and sign back in with that one. Otherwise, reply to your agreement
            email and we&apos;ll help.
          </p>
        </div>

        <SwitchAccountButton returnTo={`/adopt/agreement/${id}`} />
      </main>
    )
  }

  const a = result.data.agreement
  const awaitingCard = a.status === 'SIGNED' && a.paymentMethod === 'CARD'
  const cards = awaitingCard ? await getSavedPaymentMethods() : null

  return <AdoptionAgreementClient {...result.data} userId={session.user.id} savedCards={cards?.success ? (cards.data ?? []) : []} />
}
