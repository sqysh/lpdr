'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { STEPS } from 'lib/constants/adoption-application.constants'
import { STEPS_TYPES } from 'types/adoption-application.types'
import { Header, Progress, PreApp1SignIn, PreApp2Terms, PreApp3Details, PreApp4Payment } from './_components'
import { IPaymentMethod } from 'types/payment-method.types'
import { useConfettiStore } from 'stores/confetti.store'
import { redeemBypassCodeSchema, RedeemBypassCodeInput, RedeemBypassCodeValues } from 'lib/schemas/adoption-fee.schema'
import { redeemBypassCode } from 'lib/actions/adoption-fee/redeemBypassCode'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'

type Props = {
  savedCards: IPaymentMethod[]
  userName: { firstName: string; lastName: string } | null
  isAuthed: boolean
  email: string | null
  userId: string | null
}

export const PreApplicationFlowClient = ({ savedCards, userName, isAuthed, email, userId }: Props) => {
  const showConfetti = useConfettiStore((s) => s.show)
  const router = useRouter()

  const [step, setStep] = useState<STEPS_TYPES>(isAuthed ? 'terms' : 'sign-in')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Magic link state
  const [magicEmail, setMagicEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const [redeeming, setRedeeming] = useState(false)
  const [bypassError, setBypassError] = useState('')

  useRefreshOnSignOut(isAuthed)

  const {
    register,
    control,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<RedeemBypassCodeInput, unknown, RedeemBypassCodeValues>({
    resolver: zodResolver(redeemBypassCodeSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: userName?.firstName ?? '',
      lastName: userName?.lastName ?? '',
      bypassCode: ''
    }
  })

  const values = useWatch({ control })

  const handleContinueToInfo = () => {
    if (!agreedToTerms) return
    setStep('details')
  }

  /** Details are required either way, so validate them before both paths. */
  const detailsValid = () => trigger(['firstName', 'lastName'])

  const handleRedeemCode = async () => {
    if (!(await detailsValid())) return
    if (!(await trigger('bypassCode'))) return

    setRedeeming(true)
    setBypassError('')

    const result = await redeemBypassCode(getValues())

    setRedeeming(false)

    if (!result.success) {
      setBypassError(result.error ?? 'That code is not valid.')
      return
    }

    showConfetti()
    router.push('/adopt/application')
  }

  const handleContinueToPayment = async () => {
    if (!(await detailsValid())) return
    setStep('payment')
  }

  const currentIndex = STEPS.indexOf(step)

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        <Header />

        <Progress currentIndex={currentIndex} step={step} />

        <AnimatePresence mode="wait">
          {step === 'sign-in' && (
            <PreApp1SignIn
              magicEmail={magicEmail}
              magicLinkSent={magicLinkSent}
              setMagicEmail={setMagicEmail}
              setMagicLinkSent={setMagicLinkSent}
            />
          )}

          {step === 'terms' && (
            <PreApp2Terms agreedToTerms={agreedToTerms} handleContinueToInfo={handleContinueToInfo} setAgreedToTerms={setAgreedToTerms} />
          )}

          {step === 'details' && (
            <PreApp3Details
              register={register}
              errors={errors}
              email={email}
              bypassError={bypassError}
              redeeming={redeeming}
              onRedeemCode={handleRedeemCode}
              onContinueToPayment={handleContinueToPayment}
              setStep={setStep}
            />
          )}

          {step === 'payment' && (
            <PreApp4Payment
              savedCards={savedCards}
              setStep={setStep}
              email={email}
              firstName={values.firstName ?? ''}
              lastName={values.lastName ?? ''}
              isAuthed={isAuthed}
              userId={userId ?? ''}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
