import { PenLine, Wallet, MailWarning } from 'lucide-react'
import { IAdoptionAgreementRow } from 'types/adoption-agreement.types'

type RowAction = { label: string; icon: typeof PenLine; bar: string; tint: string; text: string }

// What, if anything, someone at LPDR needs to do with this agreement. Null means it's waiting on the adopter or done
export function actionFor(a: IAdoptionAgreementRow): RowAction | null {
  if (a.status === 'PAID') {
    return {
      label: 'Countersign to complete',
      icon: PenLine,
      bar: 'border-l-violet-500',
      tint: 'bg-violet-500/5',
      text: 'text-violet-600 dark:text-violet-400'
    }
  }
  if (a.status === 'SENT' && a.emailFailedAt) {
    return {
      label: 'Email failed, send again',
      icon: MailWarning,
      bar: 'border-l-red-500',
      tint: 'bg-red-500/5',
      text: 'text-red-600 dark:text-red-400'
    }
  }
  if (a.status === 'SIGNED' && a.paymentMethod !== 'CARD') {
    return {
      label: 'Record payment when received',
      icon: Wallet,
      bar: 'border-l-amber-500',
      tint: 'bg-amber-500/5',
      text: 'text-amber-600 dark:text-amber-400'
    }
  }
  return null
}
