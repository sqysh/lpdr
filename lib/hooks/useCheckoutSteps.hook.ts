import { useState } from 'react'

export function useCheckoutSteps({
  isAuthed,
  hasName,
  hasPhysical,
  hasSavedAddress
}: {
  isAuthed: boolean
  hasName: boolean
  hasPhysical: boolean
  hasSavedAddress: boolean
}) {
  const FLOW = hasPhysical ? [1, 2, 3, 4] : [1, 2, 4]
  const stepLabels = hasPhysical ? ['Sign In', 'Your Name', 'Shipping', 'Payment'] : ['Sign In', 'Your Name', 'Payment']

  const [step, setStep] = useState(() => {
    if (!isAuthed) return 1
    if (!hasName) return 2
    if (!hasPhysical) return 4
    return hasSavedAddress ? 4 : 3
  })

  const effectiveStep = isAuthed && step === 1 ? 2 : step
  const flowIndex = FLOW.indexOf(effectiveStep)

  return {
    effectiveStep,
    stepLabels,
    displayStep: flowIndex + 1,
    totalSteps: FLOW.length,
    goNext: () => setStep(FLOW[Math.min(flowIndex + 1, FLOW.length - 1)]),
    goBack: () => setStep(FLOW[Math.max(flowIndex - 1, isAuthed ? 1 : 0)])
  }
}
