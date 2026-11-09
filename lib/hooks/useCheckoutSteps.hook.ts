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

  // Worked out on every render rather than once, because the cart loads from storage after the
  // first render. Locking it in early sent shoppers with a physical item straight to payment.
  const firstStep = !isAuthed ? 1 : !hasName ? 2 : hasPhysical && !hasSavedAddress ? 3 : 4

  // null until the shopper moves, so the first step can still change while the cart loads
  const [chosenStep, setChosenStep] = useState<number | null>(null)
  const step = chosenStep ?? firstStep

  const effectiveStep = isAuthed && step === 1 ? 2 : step
  const flowIndex = FLOW.indexOf(effectiveStep)

  return {
    effectiveStep,
    stepLabels,
    displayStep: flowIndex + 1,
    totalSteps: FLOW.length,
    goNext: () => setChosenStep(FLOW[Math.min(flowIndex + 1, FLOW.length - 1)]),
    goBack: () => setChosenStep(FLOW[Math.max(flowIndex - 1, isAuthed ? 1 : 0)])
  }
}
